const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResetsSchema = new Schema({
  valid: {
    type: Boolean,
    default: true
  },
  userId: {
    type: Schema.ObjectId,
    required: true
  },
  confirm: {
    type: String,
    required: true,
    index: true
  },
  newPassword: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("resets", ResetsSchema);
