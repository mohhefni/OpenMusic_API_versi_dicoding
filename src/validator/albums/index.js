const { AlbumPayloadScheme } = require('./scheme');
const InvariantError = require('../../exceptions/InvariantError');

const albumValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadScheme.validate(payload);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
};

module.exports = albumValidator;
