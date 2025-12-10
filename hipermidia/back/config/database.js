import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pastaBanco = path.join(__dirname, 'banco');

if (!fs.existsSync(pastaBanco)) {
  fs.mkdirSync(pastaBanco, { recursive: true });
}

const dbPath = path.join(pastaBanco, 'database.sqlite');

// Conecta ao banco
const database = new Database(dbPath);
console.log('Conectado ao banco de dados SQLite');

// Ativar WAL
try {
  database.pragma('journal_mode = WAL');
} catch (e) {}

// Inicializa o banco (síncrono)
function initDatabase() {

  //usuarios
  database.prepare(`
    CREATE TABLE IF NOT EXISTS Usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('cliente','vendedor')),
      telefone TEXT,
      endereco TEXT
    );
  `).run();

  //vendedor
  database.prepare(`
    CREATE TABLE IF NOT EXISTS Vendedor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL UNIQUE,
      nome_loja TEXT NOT NULL,
      endereco_loja TEXT,
      FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
    );
  `).run();

  //produtos
  database.prepare(`
    CREATE TABLE IF NOT EXISTS Produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendedor_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL,
      quantidade_estoque INTEGER NOT NULL,
      url_imagem TEXT,
      FOREIGN KEY (vendedor_id) REFERENCES Vendedor(id)
    );
  `).run();

  // tags
  database.prepare(`
    CREATE TABLE IF NOT EXISTS Tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    );
  `).run();

  // produto_tags ligação tabela tag e produto
  database.prepare(`
    CREATE TABLE IF NOT EXISTS Produto_Tags (
      produto_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      FOREIGN KEY (produto_id) REFERENCES Produtos(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE,
      PRIMARY KEY (produto_id, tag_id)
    );
  `).run();

  // pedidos
  database.prepare(`
    CREATE TABLE IF NOT EXISTS Pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comprador_id INTEGER NOT NULL,
      vendedor_id INTEGER NOT NULL,
      produto_nome TEXT NOT NULL,
      produto_url_imagem TEXT,
      quantidade INTEGER NOT NULL,
      preco REAL NOT NULL,
      valor_total REAL NOT NULL,
      data_pedido TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (comprador_id) REFERENCES Usuarios(id),
      FOREIGN KEY (vendedor_id) REFERENCES Vendedor(id)
    );
  `).run();

  //facilitar a consulta
  database.prepare(`CREATE INDEX IF NOT EXISTS idx_pedidos_comprador ON Pedidos (comprador_id);`).run();
  database.prepare(`CREATE INDEX IF NOT EXISTS idx_pedidos_vendedor ON Pedidos (vendedor_id);`).run();
  database.prepare(`CREATE INDEX IF NOT EXISTS idx_pedidos_status ON Pedidos (status);`).run();
  database.prepare(`CREATE INDEX IF NOT EXISTS idx_pedidos_data ON Pedidos (data_pedido);`).run();

  console.log("Todas as tabelas foram criadas com sucesso!");
}

initDatabase();

export default database;
