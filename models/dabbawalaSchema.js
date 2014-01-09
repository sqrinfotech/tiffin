var mongoose = require('mongoose')
  , validate = require('mongoose-validator').validate
  , Schema = mongoose.Schema
  , userValidation = require('../routes/userValidation.js');

var DabbawalaSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true
  },
  name:{
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: Number,
    required: true
  },
  distributionAreas: [String],
  contactNumber: {
    type: Number,
    required: true
  },
  category: {
    veg: Boolean,
    nonVeg: Boolean
  },
  cuisine: {
    Type: String
    //default: Indian
  },

  orderType: {
    monthly: Boolean,
    weekly: Boolean,
    daily: Boolean
  },

  price: {
    monthly: {
      veg: Number,
      nonVeg: Number
    },

    weekly: {
      veg: Number,
      nonVeg: Number
    },

    daily: {
      veg: Number,
      nonVeg: Number
    }
  },

  itemAnalytics: [{
    itemName: String,
    itemCount:{
      type: Number,
      default: 0
    },
    date: Date,
    monthlyCount:[{
      month: String,
      year: Number,
      count: {
        Type: Number,
        default: 0
      }
    }]
  }],
  
  loginIps: Array,
  confirmationToken:  String,
  confirmationTokenSentAt: Date,
  confirmationAt: Date,
  resetPasswordToken: String,
  resetPasswordTokenSentAt: Date,
  signInCount: {
    type: Number,
    default: 0
  },
  createdAt: Date,
  updatedAt: Date,
});

//Menu Collection
var MenuSchema = mongoose.Schema({
  dabbawalaId: {
    type: String,
    ref: 'Dabbawala'
  },
  dayArray: [{
      date: Date,

      lunch: {
        veg: [String],
        nonVeg: [String]
      },

      dinner: {
        veg: [String],
        nonVeg: [String]
      }
  }]
});

//Items Collection
var ItemSchema = mongoose.Schema({
  itemName: String,
  dabbawalas: [{
    dabbawalaId: {
      type: String,
      ref: 'Dabbawala'
    },
    itemCount: {
      type: Number,
      default: 0
    },
    date: [Date]
  }]
});

exports.Dabbawala = mongoose.model('Dabbawala', DabbawalaSchema);
exports.Menu = mongoose.model('Menu', MenuSchema);
exports.Item = mongoose.model('Item', ItemSchema);