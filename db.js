const Keyv = require('keyv');
const SQL = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './mula.db',
  },
  useNullAsDefault: true,
});

const pgSQL = require('knex')({
  client: 'pg',
  connection: `postgres://oishi:${process.env.CARDABO_DB_SYNC_PW}@cardanodatabase.com:5432/cexplorer`,
  useNullAsDefault: true,
});

const mulaCACHE = new Keyv('redis://localhost:6379/0');

module.exports = {
  mulaCACHE,
  SQL,
  pgSQL,
};
