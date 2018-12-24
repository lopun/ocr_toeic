module.exports = {
  name: 'Toeic',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    file: {
      type: 'varchar',
    },
    date: {
      type: 'varchar',
    },
    lc: {
      type: 'int',
    },
    rc: {
      type: 'int',
    },
    ok: {
      type: 'tinyint',
    },
  },
};
