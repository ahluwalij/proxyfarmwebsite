const mongoose = require("mongoose");
const Discount = require("../../models/Discounts");

(async () => {
  await mongoose.connect("mongodb://localhost:27017/arrowaio2", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
  });
})();

async function createProduct() {
  const testProduct = new Discount({
    code: "DYING",
    amount: 0.5
  });

  const result = await testProduct.save();
  console.log(result);
}

(async () => {
  createProduct();
})();
