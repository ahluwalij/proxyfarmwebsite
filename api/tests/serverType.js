const mongoose = require("mongoose");
const Product = require("../../models/Products");
const Server = require("../../models/Server");

(async () => {
  await mongoose.connect("mongodb://localhost:27017/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
  });
})();

async function createProduct() {
  await Product.updateMany({}, { serverType: 0 });
  await Server.updateMany({}, { serverType: 0 });
  console.log("Done!");
}

(async () => {
  createProduct();
})();
