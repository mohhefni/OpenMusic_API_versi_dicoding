const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongPlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) throw new InvariantError('Lagu gagal ditambahkan');
    return rows[0].id;
  }

  async getAllSongFromPlaylist(playlistId) {
    const queryPlaylist = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON playlists.owner = users.id WHERE playlists.id = $1',
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(queryPlaylist);
    if (!playlistResult.rows.length) throw new NotFoundError('Playlist tidak ditemukan');
    const querySongs = {
      text: 'SELECT playlist_songs.song_id as id, songs.title, songs.performer FROM playlist_songs LEFT JOIN songs ON playlist_songs.song_id = songs.id WHERE playlist_id = $1',
      values: [playlistId],
    };
    const songsResult = await this._pool.query(querySongs);
    if (!songsResult.rows.length) return { ...playlistResult.rows[0], songs: [] };
    return { ...playlistResult.rows[0], songs: songsResult.rows };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    const { rowCount } = await this._pool.query(query);
    if (!rowCount) throw new InvariantError('Lagu gagal dihapus. id tidak ditemukan');
  }
}

module.exports = SongPlaylistsService;
