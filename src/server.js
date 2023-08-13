require('dotenv').config();
const Hapi = require('@hapi/hapi');
const JWT = require('@hapi/jwt');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgresql/AlbumsService');
const albumsValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgresql/SongsService');
const songsValidator = require('./validator/songs');

// users
const users = require('./api/users');
const UsersService = require('./services/postgresql/UsersService');
const usersValidator = require('./validator/users');

// exception
const ClientError = require('./exceptions/ClientError');

// authentications
const authentications = require('./api/authentications');
const AuthenticationService = require('./services/postgresql/AuthenticationsService');
const authenticationsValidator = require('./validator/authentications');
const tokenManager = require('./tokenize/TokenManager');

// playlist, song playlist, playlist
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgresql/PlaylistsService');
const playlistsValidator = require('./validator/playlists');
const SongPlaylistService = require('./services/postgresql/SongPlaylistService');
const PlaylistSongActivitiesService = require('./services/postgresql/PlaylistSongActivitiesService');

// collaboration
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgresql/CollaborationsService');
const collaborationsValidator = require('./validator/collaborations');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationService();
  const playlistsService = new PlaylistsService();
  const songPlaylistsService = new SongPlaylistService();
  const collaborationsService = new CollaborationsService();
  const playlistSongActivitiesService = new PlaylistSongActivitiesService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  await server.register([{ plugin: JWT }]);

  // strategy autentikasi jwt
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: albumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: songsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: usersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager,
        validator: authenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        songPlaylistsService,
        songsService,
        playlistSongActivitiesService,
        validator: playlistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        usersService,
        playlistsService,
        validator: collaborationsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) return h.continue;

      const newResponse = h.response({
        status: 'fail',
        message: response.stack,
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();

// truncate users, collaborations, playlists,
// playlist_song_activities, playlist_songs, songs, collaborations;
