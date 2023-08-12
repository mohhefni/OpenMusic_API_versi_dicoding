const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) throw new InvariantError('Playlist gagal ditambahkan');

    return rows[0].id;
  }

  async getAllPlaylists(userId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username as username FROM  playlists LEFT JOIN users ON playlists.owner = users.id LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id WHERE playlists.owner = $1 OR collaborations.user_id = $1',
      values: [userId],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) throw new NotFoundError('Playlist gagal dihapus. id tidak ditemukan');
  }

  async verifyPlaylistAccess(playlistId, userId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username as username FROM  playlists LEFT JOIN users ON playlists.owner = users.id LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id WHERE playlists.owner = $1 OR collaborations.user_id = $1 AND playlists.id = $2',
      values: [userId, playlistId],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) throw new NotFoundError('Playlist tidak ditemukan');

    const playlist = rows[0];

    if (playlist.owner !== owner) throw new AuthorizationError('Anda tidak berhak mengakses resource ini.');
  }

  async verifyPlaylistExists(playlistId) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) throw new NotFoundError('Playlist tidak ditemukan');
  }
}

module.exports = PlaylistsService;
