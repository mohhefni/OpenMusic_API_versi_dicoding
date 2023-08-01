const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hasedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, username, hasedPassword, fullname],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) throw new InvariantError('User gagal ditambahkan');

    return rows[0].id;
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT * FROM users WHERE username = $1',
      values: [username],
    };

    const { rowCount } = await this._pool.query(query);

    if (rowCount) throw new InvariantError('Gagal menambahkan user. Username sudah digunakan');
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) throw new AuthenticationError('Kredensial yang Anda berikan salah');

    const { id, password: hasedPassword } = rows[0];

    const match = await bcrypt.compare(password, hasedPassword);

    if (!match) throw new AuthenticationError('Kredensial yang Anda berikan salah');

    return id;
  }
}

module.exports = UsersService;
