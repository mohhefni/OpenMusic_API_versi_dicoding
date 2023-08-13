const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(
    playlistsService,
    songPlaylistsService,
    songsService,
    playlistSongActivitiesService,
    validator,
  ) {
    this._playlistsService = playlistsService;
    this._songPlaylistsService = songPlaylistsService;
    this._songsService = songsService;
    this._playlistSongActivitiesService = playlistSongActivitiesService;
    this._validator = validator;
    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._playlistsService.addPlaylist({ name, owner: credentialId });
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan.',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getAllPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus.',
    };
  }

  async postSongPlaylistHandler(request, h) {
    this._validator.validateSongPlaylistPayload(request.payload);
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._songsService.verifySongExists(songId);
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._songPlaylistsService.addSongToPlaylist(id, songId);
    await this._playlistSongActivitiesService.activitiesSongPlaylist(id, songId, credentialId, 'add');
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistExists(id);
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._songPlaylistsService.getAllSongFromPlaylist(id);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongPlaylistHandler(request) {
    this._validator.validateSongPlaylistPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._songPlaylistsService.deleteSongFromPlaylist(id, songId);
    await this._playlistSongActivitiesService.activitiesSongPlaylist(id, songId, credentialId, 'delete');
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist.',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistExists(id);
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const data = await this._playlistSongActivitiesService.getActivitiesSongPlaylist(id);
    return {
      status: 'success',
      data,
    };
  }
}
module.exports = PlaylistsHandler;
