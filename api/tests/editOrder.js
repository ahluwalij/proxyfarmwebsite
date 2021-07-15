const mongoose = require("mongoose");
const Order = require("../../models/Orders");
const Product = require("../../models/Products");

const userId = "5e5a34c5667aa4298c2f7ac6";
const planId = "5e59bccd8eaa3d53dc4985ec";

(async () => {
  await mongoose.connect("mongodb://localhost:27017/arrowaio2", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
  });

  await createOrder();
})();

async function createOrder() {
  //First find the planID
 
  let k = await  Order.updateOne({ _id : "5e5d80beed28be6667199709"}, { 
	  status : 2
  });

  console.log(k);
  }

