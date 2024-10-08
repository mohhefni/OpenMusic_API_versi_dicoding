const { SongPayloadSchema } = require('./scheme');
const InvariantError = require('../../exceptions/InvariantError');

const songValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
};

module.exports = songValidator;
