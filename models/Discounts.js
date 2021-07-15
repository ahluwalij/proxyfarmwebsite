const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DiscountsSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  }
});

DiscountsSchema.statics.check = async function(code) {
  const result = await this.findOne({
    code,
    active: true
  });

  if (result) {
    return {
      valid: true,
      amount: result.amount
    };
  } else {
    return {
      valid: false,
      amount: 0
    };
  }
};

module.exports = mongoose.model("Discounts", DiscountsSchema);
