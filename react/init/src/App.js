import React, { useState, useEffect } from "react";
import logo from "./Resources/Asset 1.png";
import image1 from "./Images/1x/Asset 15.png";
import image2 from "./Images/1x/Asset 15.png";
import image3 from "./Images/1x/Asset 15_1.png";
import image4 from "./Images/1x/Asset 10.png";
import image5 from "./Images/1x/Asset 17.png";
import green from "./Images/1x/Asset 3.png";
import red from "./Images/1x/Asset 12.png";
import orange from "./Images/1x/Asset 13.png";
import "./App.css";

function parseDate(date) {
  return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
}

function ActiveItem(props) {
  return (
    <div
      className="active item"
      key={props._id}
      onClick={() => {
        props.handleClick(props._id);
      }}
    >
      <div className="one flex">
        <div className="flex">
          <div>
            <img src={green} alt="" className="img" />
          </div>
          <div className="order">#{props._id.substring(0, 4)}</div>
        </div>
      </div>

      <div className="one flex">
        <div className="flex">
          <div className="amount">{props.proxyAmount}</div>
        </div>
      </div>

      <div className="one flex">
        <div className="flex">
          <div className="product">{props.planName}</div>
        </div>
      </div>

      <div className="one flex">
        <div className="flex">
          <div className="date">{parseDate(new Date(props.startDate))}</div>
        </div>
      </div>
      <div className="one flex">
        <div className="flex">
          <div className="date">{parseDate(new Date(props.endDate))}</div>
        </div>
      </div>
      <div className="one flex">
        <div className="flex">
          <div className="text-success">Active</div>
        </div>
      </div>
    </div>
  );
}

function RenewableItem(props) {
  return (
    <div
      className="renew item"
      key={props._id}
      onClick={() => {
        props.handleClick(props._id);
      }}
    >
      <div className="one flex">
        <div className="flex">
          <div>
            <img src={orange} alt="" className="img" />
          </div>
          <div className="order">#{props._id.substring(0, 7)}</div>
        </div>
      </div>

      <div className="one flex">
        <div className="flex">
          <div className="amount">{props.proxyAmount}</div>
        </div>
      </div>

      <div className="one flex">
        <div className="flex">
          <div className="product">{props.planName}</div>
        </div>
      </div>

      <div className="one flex">
        <div className="flex">
          <div className="date">{parseDate(new Date(props.startDate))}</div>
        </div>
      </div>
      <div className="one flex">
        <div className="flex">
          <div className="date">{parseDate(new Date(props.endDate))}</div>
        </div>
      </div>
      <div className="one flex">
        <div className="flex">
          <div
            className="text-warning"
            onClick={() => {
              window.location.href = `/renew/${props._id}`;
            }}
          >
            Renew
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpiredItem(props) {
  return (
    <div className="expired item" key={props._id}>
      <div className="one flex">
        <div className="flex">
          <div>
            <img src={red} alt="" className="img" />
          </div>
          <div className="order">#{props._id.substring(0, 4)}</div>
        </div>
      </div>

      <div className="one flex">
        <div className="flex">
          <div className="amount">{props.proxyAmount}</div>
        </div>
      </div>

      <div className="one flex">
        <div className="flex">
          <div className="product">{props.planName}</div>
        </div>
      </div>

      <div className="one flex">
        <div className="flex">
          <div className="date">{parseDate(new Date(props.startDate))}</div>
        </div>
      </div>
      <div className="one flex">
        <div className="flex">
          <div className="date">{parseDate(new Date(props.endDate))}</div>
        </div>
      </div>
      <div className="one flex">
        <div className="flex">
          <div className="text-danger">Expired</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [items, updateItems] = useState([]);
  const [iOrder, updateiOrder] = useState("");
  const [proxies, updateProxies] = useState([]);

  useEffect(() => {
    (async () => {
      let result = await fetch("/api/orders");
      let data = await result.json();
      updateItems(data);
    })();
  }, []);

  useEffect(() => {
    if (iOrder != "") {
      (async () => {
        let result = await fetch(`/api/proxies/${iOrder}`);
        let data = await result.json();
        updateProxies(data[0]);
      })();
    }
  }, [iOrder]);

  const _updateiOrder = (id) => {
    updateiOrder(id);
  };

  const __renderOrders = (orders) => {
    return orders.map((items, key) => {
      items.key = key;
      switch (items.status) {
        case 1:
          return ActiveItem(
            Object.assign({}, items, { handleClick: _updateiOrder })
          );
        case 2:
          return RenewableItem(
            Object.assign({}, items, { handleClick: _updateiOrder })
          );
        default:
          return ExpiredItem(items);
      }
    });
  };

  const __renderIps = (data) => {
    if (!data || !data.proxies) {
      return <p></p>;
    }
    return data.proxies.split("\n").map((ip, index) => {
      return (
        <p key={index}>
          {ip}:{data.proxyUser}:{data.proxyUserPassword}
        </p>
      );
    });
  };

  return (
    <div className="App">
      <nav>
        <div className="brand">
          <img src={logo} alt="" className="logo" />
          <p className="arrowtxt">Arrow Dashboard</p>
        </div>
        <div className="links">
          <a href="https://arrowproxies.com/">Home</a>
          <a href="#" className="active1">
            Dashboard
          </a>
          <a href="/purchase">Purchase Proxy</a>
          <a href="https://dash.arrowproxies.com/store">Store</a>
        </div>
        <p className="user">
          Welcome <span className="username">User, </span>
          <span>
            <a href="/logout" className="out">
              {" "}
              Logout{" "}
            </a>
          </span>
        </p>
      </nav>
      <div className="container">
        <div className="section1">
          <div className="storage">
            <div>Unlimited</div>
            <div className="small">GB Remaining</div>
          </div>
          <div className="proxylist">
            <div className="top">
              <div className="toptext">Proxy List</div>
              <div className="btn">
                <button
                  onClick={() => {
                    if (iOrder) {
                      window.location.href = `/api/download/${iOrder}`;
                    }
                  }}
                >
                  Download
                </button>
              </div>
            </div>
            <div className="proxy">
              <div className="proxyitems">{__renderIps(proxies)}</div>
            </div>
          </div>
        </div>
        <div className="section2">
          <div className="text">Previous Purchases</div>
          <div className="itemcontainer">
            <div className="productitems">
              <div className="items">
                <div className=" flex">
                  <div className="flex mar">
                    <div>
                      <img src={image1} alt="" className="img" />
                    </div>
                    <div>Order #</div>
                  </div>
                </div>

                <div className=" flex">
                  <div className="flex">
                    <div>
                      <img src={image2} alt="" className="img" />
                    </div>
                    <div>Product</div>
                  </div>
                </div>

                <div className=" flex">
                  <div className="flex neg">
                    <div>
                      <img src={image3} alt="" className="img" />
                    </div>
                    <div>Amount</div>
                  </div>
                </div>

                <div className=" flex">
                  <div className="flex">
                    <div>
                      <img src={image4} alt="" className="img" />
                    </div>
                    <div>Start Date</div>
                  </div>
                </div>
                <div className=" flex">
                  <div className="flex">
                    <div>
                      <img src={image5} alt="" className="img" />
                    </div>
                    <div>End Date</div>
                  </div>
                </div>
                <div className=" flex">
                  <div className="flex">
                    <div>
                      <img src={image4} alt="" className="img" />
                    </div>
                    <div className="margin">Status</div>
                  </div>
                </div>
              </div>
              <div className="scroll">
                <div className="pad">{__renderOrders(items)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
