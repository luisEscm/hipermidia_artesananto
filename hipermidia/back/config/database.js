import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { verbose } = sqlite3;
const db = verbose();
const dbPath = path.join(__dirname, '..', 'database.sqlite');

const database = new db.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite');
    initDatabase().catch(err => console.error('Erro ao inicializar banco:', err));
  }
});

async function initDatabase() {
  return new Promise((resolve, reject) => {
    //Personalizar para o nosso projeto
    database.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        img TEXT NOT NULL,
        description TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela:', err.message);
        reject(err);
      } else {
        console.log('Tabela posts criada/verificada com sucesso');
        resolve();
      }
    });
  });
}

export default database;



