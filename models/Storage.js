const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const StorageSchema = new Schema({
  qualityIndex: {
    type: Number,
    unique: true,
    index: true,
  },

  ips: [String],
  count: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("storage", StorageSchema);
