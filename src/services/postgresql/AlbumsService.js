const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) throw new InvariantError('Album gagal ditambahkan');

    return rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT id, name, year FROM albums WHERE id = $1',
      values: [id],
    };

    const albumResult = await this._pool.query(queryAlbum);
    if (!albumResult.rows.length) throw new NotFoundError('Album tidak ditemukan');

    const querySongs = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs LEFT JOIN albums ON songs."albumId" = albums.id WHERE songs."albumId" = $1;',
      values: [id],
    };
    const songsResult = await this._pool.query(querySongs);

    if (!songsResult.rows.length) return { ...albumResult.rows[0], songs: [] };

    return { ...albumResult.rows[0], songs: songsResult.rows };
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
  }
}
module.exports = AlbumsService;
