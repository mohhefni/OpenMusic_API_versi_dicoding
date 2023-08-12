const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: async (server, {
    playlistsService, songPlaylistsService, songsService, playlistSongActivitiesService, validator,
  }) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      songPlaylistsService,
      songsService,
      playlistSongActivitiesService,
      validator,
    );
    server.route(routes(playlistsHandler));
  },
};
