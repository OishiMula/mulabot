const Keyv = require('keyv');
const SQL = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './mula.db',
  },
  useNullAsDefault: true,
});

const mulaCACHE = new Keyv('redis://localhost:6379/0');

module.exports = {
  mulaCACHE,
  SQL,
};
