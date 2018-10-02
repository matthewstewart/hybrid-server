"use strict";

const mongoose = require("mongoose");

const freezerSchema = mongoose.Schema({
  createdAt: { type: String, default: new Date() },
  updatedAt: { type: String, default: new Date() },
  parentId: { type: String, ref: "Lab" },
  name: String,
  description: String,
  temperature: Number,
  potentialLocation: [{ type: Array }],
  parentLocation: String,
  canContain: {
    type: Array,
    default: ["Plate", "Well", "DnaSample", "OrganicSample", "Sample"]
  }
});

module.exports = mongoose.model("Freezer", freezerSchema);
