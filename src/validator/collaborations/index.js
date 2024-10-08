const { CollaborationPayloadSchema } = require('./scheme');
const InvariantError = require('../../exceptions/InvariantError');

const collaborationValidator = {
  validateCollaborationPayload: (payload) => {
    const validationResult = CollaborationPayloadSchema.validate(payload);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
};

module.exports = collaborationValidator;
