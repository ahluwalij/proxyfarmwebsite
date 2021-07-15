const mongoose = require("mongoose");
const Product = require("../../models/Products");

(async () => {
  await mongoose.connect("mongodb://localhost:27017/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
  });
})();

async function createProduct() {
  const testProduct = new Product({
    planName: "Teller",
    planDuration: 30,
    proxyQuantity: 50,
    planPrice: 105,
    enabled: true,
    public: true
  });

  const result = await testProduct.save();
  console.log(result);
}

(async () => {
  createProduct();
})();
