var mongoose = require('mongoose')
	, validate = require('mongoose-validator').validate
	, userValidation = require('./userValidation.js'); 

var DabbawalaSchema = new Schema({
  username: {
    type: String,
    //unique: true,
    required: true,
    //validate: userValidation.usernameValidator 
  },
  salt: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    validate: userValidation.nameValidator
  },
  email: {
    type: String,
    //unique: true,
    required: true,
    validate: userValidation.emailValidator
  },
  address: {
    type: String,
    validate: userValidation.addressValidator
  },
  city: {
    type: String,
    validate: userValidation.locationValidator
  },
  state: {
    type: String,
    validate: userValidation.stateValidator
  },
  zipCode: {
    type: Number,
    validate: userValidation.zipCodeValidator
  },
  area: [String],
  contactNumber: Number,
  category: {
  	veg: Boolean,
  	nonVeg: Boolean
  },
  menu: {
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

  	items: [String],

  	weekArray: [ 
  		week: {
  			startDate: Date,
  			monday: {
  				lunch: {
  					veg: [String],
  					nonVeg: [String]
  				},

  				dinner: {
  					veg: [String],
  					nonVeg: [String]
  				}
  			},

  			tuesday: {
  				lunch: {
  					veg: [String],
  					nonVeg: [String]
  				},

  				dinner: {
  					veg: [String],
  					nonVeg: [String]
  				}
  			},

  			wednesday: {
  				lunch: {
  					veg: [String],
  					nonVeg: [String]
  				},

  				dinner: {
  					veg: [String],
  					nonVeg: [String]
  				}
  			},

  			thursday: {
  				lunch: {
  					veg: [String],
  					nonVeg: [String]
  				},

  				dinner: {
  					veg: [String],
  					nonVeg: [String]
  				}
  			},

  			friday: {
  				lunch: {
  					veg: [String],
  					nonVeg: [String]
  				},

  				dinner: {
  					veg: [String],
  					nonVeg: [String]
  				}
  			},

  			saturday: {
  				lunch: {
  					veg: [String],
  					nonVeg: [String]
  				},

  				dinner: {
  					veg: [String],
  					nonVeg: [String]
  				}
  			},

  			sunday: {
  				lunch: {
  					veg: [String],
  					nonVeg: [String]
  				},

  				dinner: {
  					veg: [String],
  					nonVeg: [String]
  				}
  			}

  		}
  	]

  	}

  },

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

modules.export = mongoose.model('Dabbawala', DabbawalaSchema);