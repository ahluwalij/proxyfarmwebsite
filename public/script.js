// A reference to Stripe.js
var stripe;

// Disable the button until we have Stripe set up on the page
document.querySelector("button").disabled = true;

fetch("/stripe-key")
  .then(function (result) {
    return result.json();
  })
  .then(function (data) {
    return setupElements(data);
  })
  .then(function ({ stripe, card, clientSecret }) {
    document.querySelector("button").disabled = false;

    var form = document.getElementById("payment-form");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      pay(stripe, card, clientSecret);
    });
  });

var setupElements = function (data) {
  stripe = Stripe(data.publishableKey);
  /* ------- Set up Stripe Elements to use in checkout form ------- */
  var elements = stripe.elements();
  var style = {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  };

  var card = elements.create("card", { style: style });
  card.mount("#card-element");

  return {
    stripe: stripe,
    card: card,
    clientSecret: data.clientSecret,
  };
};

var handleAction = function (clientSecret) {
  stripe.handleCardAction(clientSecret).then(function (data) {
    if (data.error) {
      showError("Your card was not authenticated, please try again");
    } else if (data.paymentIntent.status === "requires_confirmation") {
      fetch("/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId: data.paymentIntent.id,
        }),
      })
        .then(function (result) {
          return result.json();
        })
        .then(function (json) {
          if (json.error) {
            showError(json.error);
          } else {
            orderComplete(clientSecret);
          }
        });
    }
  });
};

function discount(e) {
  const discount = document.getElementById("discountcode").value;
  fetch(`/discount/${discount}`)
    .then(function (result) {
      return result.json();
    })
    .then(function (data) {
      if (data.valid) {
        orderData.discount = discount;
        document.getElementById("total-discount").innerHTML = `$${(
          price * data.amount
        ).toFixed(2)}`;

        let totalPrice = (price - price * data.amount).toFixed(2);

        document.getElementById("total-price").innerHTML = `$${totalPrice}`;
        document.getElementById("button-text").innerHTML = `$${totalPrice}`;
      } else {
        orderData.discount = discount;
        document.getElementById(
          "disocuntmsg"
        ).innerHTML = `Invalid discount code.`;
      }
    });
}

/*
 * Collect card details and pay for the order
 */
var pay = function (stripe, card) {
  changeLoadingState(true);

  // Collects card details and creates a PaymentMethod
  stripe
    .createPaymentMethod("card", card)
    .then(function (result) {
      if (result.error) {
        showError(result.error.message);
      } else {
        orderData.paymentMethodId = result.paymentMethod.id;
        const discount = document.getElementById("discountcode").value;
        orderData.discount = discount;
        return fetch("/pay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });
      }
    })
    .then(function (result) {
      return result.json();
    })
    .then(function (response) {
      if (response.error) {
        showError(response.error);
      } else if (response.requiresAction) {
        // Request authentication
        handleAction(response.clientSecret);
      } else {
        orderComplete(response.clientSecret);
      }
    });
};

/* ------- Post-payment helpers ------- */

/* Shows a success / error message when the payment is complete */
var orderComplete = function (clientSecret) {
  stripe.retrievePaymentIntent(clientSecret).then(function (result) {
    window.location = "/success";
  });
};

var showError = function (errorMsgText) {
  changeLoadingState(false);
  var errorMsg = document.querySelector(".sr-field-error");
  errorMsg.textContent = errorMsgText;

  if (errorMsgText.indexOf("out of stock") != -1) {
    setTimeout(function () {
      window.location.href = "/purchase";
    }, 2000);
  }
};

// Show a spinner on payment submission
var changeLoadingState = function (isLoading) {
  if (isLoading) {
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};
