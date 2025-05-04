const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactEmail: { type: String },
  phone: { type: String },
  cif: { type: String },
  address: { type: String },
  deleted: { type: Boolean, default: false }, // soft delete
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // el que lo creó
  company: { type: String } // nombre de la compañía (si el usuario tiene una)
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model("client", ClientSchema);
