const { PlaylistPayloadSchema, SongPlaylistPayloadSchema } = require('./scheme');
const InvariantError = require('../../exceptions/InvariantError');

const playlistValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
  validateSongPlaylistPayload: (payload) => {
    const validationResult = SongPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },
};

module.exports = playlistValidator;
