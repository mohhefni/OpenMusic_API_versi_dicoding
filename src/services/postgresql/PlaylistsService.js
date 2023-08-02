const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const AuthorizationError = require('../../exceptions/AuthenticationError');

class playlists {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) throw new InvariantError('Lagu gagal ditambahkan.');

    return rows[0].id;
  }

  getAllPlaylists(userId) {}
  deletePlaylist() {}
  addSongToPlaylist() {}
  getAllSongByPlaylist() {}
  deleteSongFromPlaylist() {}
}

module.exports = playlists;
