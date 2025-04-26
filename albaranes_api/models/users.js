const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: String,
    code: Number,
    intentos: Number,

    
    status: {
      type: String,
      enum: ['pending', 'validated'],
      default: 'pending'
    },
    apellidos: {
      type: String,
      default: ""
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    nif: {
      type: String,
      default: ""
    },
    company: {
      companyName: String,
      cif: String,
      address: String,
      phone: String,
      isFreelance: {
        type: Boolean,
        default: false
      }
    } ,   
    email: {
      type: String,
      unique: true, 
      required: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ['user', 'admin'], 
      default: 'user'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('users', userSchema);