const request = require("request");

function makeUser(controller, auth, username, password) {
  var options = {
    method: "POST",
    url: `${controller}/makeuser`,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      authToken: auth,
      username: username,
      password: password,
    }),
  };
  request(options, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      if (response) {
        console.log(response.body);
      }
    }
  });
}

makeUser(
  "http://62.192.169.2:30000",
  "72149ef729c339c4f4d1cb1f7abee993",
  "leroy123",
  "8LdArgEA"
);
