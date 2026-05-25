const { readFile } = require('fs/promises');
const path = require('path');
const { Client } = require('pg');

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error('DATABASE_URL ou POSTGRES_URL est requis pour importer la base.');
  process.exit(1);
}

async function main() {
  const sqlPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const sql = await readFile(sqlPath, 'utf8');
  const client = new Client({
    connectionString,
    ssl: process.env.POSTGRES_SSL === 'false' ? false : { rejectUnauthorized: false }
  });

  await client.connect();
  await client.query(sql);
  await client.end();

  console.log('Base PostgreSQL importee avec succes.');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
