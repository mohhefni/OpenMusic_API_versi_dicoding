exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(15)',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(40)',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
    },
    album_id: {
      type: 'VARCHAR(50)',
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.addConstraint(
    'songs',
    'fk_songs.album_id_albums.id',
    // eslint-disable-next-line comma-dangle
    'FOREIGN KEY ("album_id") REFERENCES albums(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
