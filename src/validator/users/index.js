const { userPaylodScheme } = require('./scheme');
const InvariantError = require('../../exceptions/InvariantError');

const userValidator = {
  validateUserPayload: (payload) => {
    const validationResult = userPaylodScheme.validate(payload);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
};

module.exports = userValidator;
