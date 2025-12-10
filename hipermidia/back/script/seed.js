import db from '../config/database.js';

function fmtData(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const seed = db.transaction(() => {
  // Limpa dados (ordem respeitando FKs)
  db.prepare('DELETE FROM Produto_Tags').run();
  db.prepare('DELETE FROM Pedidos').run();
  db.prepare('DELETE FROM Produtos').run();
  db.prepare('DELETE FROM Vendedor').run();
  db.prepare('DELETE FROM Usuarios').run();
  db.prepare('DELETE FROM Tags').run();

  // 5 Tags (todas minúsculas)
  const tags = ['action figure', 'rpg', 'anime', 'feito à mão', 'impressao 3d'];
  const insTag = db.prepare('INSERT INTO Tags (nome) VALUES (?)');
  tags.forEach(t => insTag.run(t));

  const getTag = db.prepare('SELECT id FROM Tags WHERE nome = ?');

  // 5 Usuários (3 vendedores + 2 clientes)
  const insUser = db.prepare(`
    INSERT INTO Usuarios (nome, email, senha, tipo, telefone, endereco)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const usuarios = {
    ana: insUser.run('Ana Artesã', 'ana@exemplo.com', '123456', 'vendedor', '11999990001', 'Rua das Flores, 10').lastInsertRowid,
    bruno: insUser.run('Bruno Maker', 'bruno@exemplo.com', '123456', 'vendedor', '11999990002', 'Av. Impressão, 200').lastInsertRowid,
    carla: insUser.run('Carla 3D', 'carla@exemplo.com', '123456', 'vendedor', '11999990003', 'Rua Resina, 300').lastInsertRowid,
    diego: insUser.run('Diego Cliente', 'diego@exemplo.com', '123456', 'cliente', '11999990004', 'Rua Comprador, 400').lastInsertRowid,
    eva:   insUser.run('Eva Cliente', 'eva@exemplo.com', '123456', 'cliente', '11999990005', 'Av. Cliente, 500').lastInsertRowid,
  };

  // Tabela Vendedor (id diferente do usuario_id)
  const insVend = db.prepare(`
    INSERT INTO Vendedor (usuario_id, nome_loja, endereco_loja)
    VALUES (?, ?, ?)
  `);

  const vendedores = {
    ana: insVend.run(usuarios.ana, 'Ateliê da Ana', 'Rua das Flores, 10').lastInsertRowid,
    bruno: insVend.run(usuarios.bruno, 'Oficina do Bruno', 'Av. Impressão, 200').lastInsertRowid,
    carla: insVend.run(usuarios.carla, 'Studio da Carla', 'Rua Resina, 300').lastInsertRowid,
  };

  // Produtos por vendedor
  const insProd = db.prepare(`
    INSERT INTO Produtos (vendedor_id, nome, descricao, preco, quantidade_estoque, url_imagem)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const produtos = [];

  function addProd(vendId, nome, descricao, preco, qtd, url, tags) {
    const id = insProd.run(vendId, nome, descricao, preco, qtd, url).lastInsertRowid;
    produtos.push({ id, vendedor_id: vendId, nome, descricao, preco, url_imagem: url, tags });
  }

  // Ana
  addProd(vendedores.ana, 'Miniatura Elfa Arqueira', 'Miniatura detalhada de elfa arqueira, pintada à mão.', 120.00, 10, 'https://img.exemplo/elfa.jpg', ['action figure', 'rpg', 'feito à mão']);
  addProd(vendedores.ana, 'Guerreiro de Madeira', 'Escultura rústica de guerreiro feita em madeira nobre.', 90.00, 8, 'https://img.exemplo/guerreiro.jpg', ['feito à mão', 'rpg']);
  addProd(vendedores.ana, 'Mascote Anime em Feltro', 'Boneco de feltro fofinho inspirado em animes.', 60.00, 15, 'https://img.exemplo/mascote.jpg', ['anime', 'feito à mão']);

  // Bruno
  addProd(vendedores.bruno, 'Knight 3D Print', 'Cavaleiro impresso em 3D com alta resolução.', 150.00, 12, 'https://img.exemplo/knight.jpg', ['action figure', 'impressao 3d', 'rpg']);
  addProd(vendedores.bruno, 'Dragon Bust 3D', 'Busto de dragão impresso em 3D, ideal para pintura.', 200.00, 5, 'https://img.exemplo/dragon.jpg', ['impressao 3d', 'rpg']);
  addProd(vendedores.bruno, 'Anime Mecha Kit', 'Kit para montar e pintar de robô estilo anime.', 180.00, 7, 'https://img.exemplo/mecha.jpg', ['anime', 'impressao 3d']);

  // Carla
  addProd(vendedores.carla, 'Mage Resin Figure', 'Figura de mago em resina translúcida.', 160.00, 9, 'https://img.exemplo/mage.jpg', ['action figure', 'rpg']);
  addProd(vendedores.carla, 'Chibi Anime Resin', 'Personagem estilo Chibi feito em resina.', 110.00, 14, 'https://img.exemplo/chibi.jpg', ['anime', 'feito à mão']);
  addProd(vendedores.carla, 'Set Dados RPG em Madeira', 'Conjunto de dados para RPG artesanais em madeira.', 70.00, 20, 'https://img.exemplo/dados.jpg', ['rpg', 'feito à mão']);

  // Associa tags aos produtos
  const insPT = db.prepare('INSERT OR IGNORE INTO Produto_Tags (produto_id, tag_id) VALUES (?, ?)');
  for (const p of produtos) {
    for (const nomeTag of p.tags) {
      const tagId = getTag.get(nomeTag)?.id;
      if (tagId) insPT.run(p.id, tagId);
    }
  }

  // Pedidos (clientes comprando produtos dos vendedores)
  const insPed = db.prepare(`
    INSERT INTO Pedidos (comprador_id, vendedor_id, produto_nome, produto_url_imagem, quantidade, preco, valor_total, data_pedido, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const hoje = new Date();
  const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
  const doisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 2, hoje.getDate());

  const pedidos = [
    // Diego compra de Ana
    { comprador: usuarios.diego, prodIdx: 0, qtd: 2, data: doisMesesAtras, status: 'concluido' },
    { comprador: usuarios.diego, prodIdx: 1, qtd: 1, data: mesPassado, status: 'enviado' },
    // Eva compra de Bruno
    { comprador: usuarios.eva, prodIdx: 3, qtd: 1, data: mesPassado, status: 'concluido' },
    { comprador: usuarios.eva, prodIdx: 4, qtd: 2, data: hoje, status: 'processado' },
    // Diego compra de Carla
    { comprador: usuarios.diego, prodIdx: 8, qtd: 3, data: hoje, status: 'processado' },
    // Mais exemplos
    { comprador: usuarios.eva, prodIdx: 2, qtd: 1, data: hoje, status: 'enviado' },
    { comprador: usuarios.diego, prodIdx: 5, qtd: 1, data: doisMesesAtras, status: 'concluido' },
    { comprador: usuarios.eva, prodIdx: 6, qtd: 1, data: mesPassado, status: 'processado' },
  ];

  for (const ped of pedidos) {
    const p = produtos[ped.prodIdx];
    const total = p.preco * ped.qtd;
    insPed.run(
      ped.comprador,
      p.vendedor_id,
      p.nome,
      p.url_imagem,
      ped.qtd,
      p.preco,
      total,
      fmtData(ped.data),
      ped.status
    );
  }
});

seed();
console.log('Seed concluído com sucesso.');