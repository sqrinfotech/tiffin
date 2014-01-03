var validate = require('mongoose-validator').validate;

exports.nameValidator = [
  validate({message: 'Name should not be empty'},'notNull'),
  validate({message: 'Name must contain only letters'}, 'isAlpha')
];

exports.emailValidator = [
  validate({message: 'Email should not be empty'}, 'notNull'),
  validate({message: 'Invalid email format'}, 'isEmail')
];

exports.usernameValidator = [
  validate({message: 'Username should not be empty'},'notNull'),
  validate({message: 'Username should be between 2 and 20 characters'}, 'len', 2, 20),
  validate({message: 'Username must contain only aplhanumeric characters or underscores'}, 'regex', /^[a-zA-Z0-9_]]*$/)
];

exports.passwordValidator = [
  validate({message: 'Password should not be empty'}, 'notNull'),
  validate({message: 'Password should be minimum 8 characters long'}, 'len', 8)
];

exports.addressValidator = [
  validate({message: 'Address should not be empty'}, 'notNull')
];

exports.locationValidator = [
  validate({message: 'Location should not be empty'}, 'notNull'),
  validate({message: 'Location should contain only letters'}, 'isAlpha')
];

exports.stateValidator = [
  validate({message: 'State should not be empty'}, 'notNull'),
  validate({message: 'State should contain only letters'}, 'isAlpha')
];

exports.zipCodeValidator = [
  validate({message: 'Zip Code should not be empty'}, 'notNull'),
  validate({message: 'Zip Code should contain only numbers'}, 'isNumeric')
];