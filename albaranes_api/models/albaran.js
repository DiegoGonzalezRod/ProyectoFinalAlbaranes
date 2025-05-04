const mongoose = require('mongoose');

const deliveryNoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'client',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'project',
    required: true
  },
  format: {
    type: String,
    enum: ['material', 'hours'],
    required: true
  },
  material: {
    type: String
  },
  hours: {
    type: Number
  },
  description: {
    type: String,
    required: true
  },
  workdate: {
    type: Date, 
    required: true
  },
  sign: {
    type: String,
    default: null
  },
  pdf: {
    type: String,
    default: null
  },
  pending: {
    type: Boolean,
    default: true
  },
  deleted: {  
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('albaran', deliveryNoteSchema);
