import knex from 'knex'

const pg = require('pg');
const PG_DECIMAL_OID = 1700;
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat);

const connection = knex({
  client: 'pg',
  connection: {
    host: String(process.env.DB_HOST),
    port: Number(process.env.DB_PORT),
    user: String(process.env.DB_USER),
    password: String(process.env.DB_PASS),
    database: String(process.env.DB_DATABASE)
  }
})

export default connection;
