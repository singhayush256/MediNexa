const { Client } = require('pg');

const passwords = ['', 'postgres', 'admin', 'root', '1234', '123456', 'Password123!', 'tushar', 'Tushar', 'medinexa'];

async function tryPasswords() {
  for (const pw of passwords) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: pw,
      database: 'postgres',
    });
    try {
      await client.connect();
      console.log(`>>> SUCCESS! Password is: "${pw}"`);
      await client.end();
      return pw;
    } catch (e) {
      // ignore
    }
  }
  console.log('None of the quick passwords worked.');
}

tryPasswords();
