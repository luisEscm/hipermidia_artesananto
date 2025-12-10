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
    INSERT INTO Produtos (vendedor_id, nome, preco, quantidade_estoque, url_imagem)
    VALUES (?, ?, ?, ?, ?)
  `);

  const produtos = [];

  // Ana
  produtos.push({
    id: insProd.run(vendedores.ana, 'Miniatura Elfa Arqueira', 120.00, 10, 'https://img.exemplo/elfa.jpg').lastInsertRowid,
    vendedor_id: vendedores.ana,
    tags: ['action figure', 'rpg', 'feito à mão'],
    preco: 120.00
  });
  produtos.push({
    id: insProd.run(vendedores.ana, 'Guerreiro de Madeira', 90.00, 8, 'https://img.exemplo/guerreiro.jpg').lastInsertRowid,
    vendedor_id: vendedores.ana,
    tags: ['feito à mão', 'rpg'],
    preco: 90.00
  });
  produtos.push({
    id: insProd.run(vendedores.ana, 'Mascote Anime em Feltro', 60.00, 15, 'https://img.exemplo/mascote.jpg').lastInsertRowid,
    vendedor_id: vendedores.ana,
    tags: ['anime', 'feito à mão'],
    preco: 60.00
  });

  // Bruno
  produtos.push({
    id: insProd.run(vendedores.bruno, 'Knight 3D Print', 150.00, 12, 'https://img.exemplo/knight.jpg').lastInsertRowid,
    vendedor_id: vendedores.bruno,
    tags: ['action figure', 'impressao 3d', 'rpg'],
    preco: 150.00
  });
  produtos.push({
    id: insProd.run(vendedores.bruno, 'Dragon Bust 3D', 200.00, 5, 'https://img.exemplo/dragon.jpg').lastInsertRowid,
    vendedor_id: vendedores.bruno,
    tags: ['impressao 3d', 'rpg'],
    preco: 200.00
  });
  produtos.push({
    id: insProd.run(vendedores.bruno, 'Anime Mecha Kit', 180.00, 7, 'https://img.exemplo/mecha.jpg').lastInsertRowid,
    vendedor_id: vendedores.bruno,
    tags: ['anime', 'impressao 3d'],
    preco: 180.00
  });

  // Carla
  produtos.push({
    id: insProd.run(vendedores.carla, 'Mage Resin Figure', 160.00, 9, 'https://img.exemplo/mage.jpg').lastInsertRowid,
    vendedor_id: vendedores.carla,
    tags: ['action figure', 'rpg'],
    preco: 160.00
  });
  produtos.push({
    id: insProd.run(vendedores.carla, 'Chibi Anime Resin', 110.00, 14, 'https://img.exemplo/chibi.jpg').lastInsertRowid,
    vendedor_id: vendedores.carla,
    tags: ['anime', 'feito à mão'],
    preco: 110.00
  });
  produtos.push({
    id: insProd.run(vendedores.carla, 'Set Dados RPG em Madeira', 70.00, 20, 'https://img.exemplo/dados.jpg').lastInsertRowid,
    vendedor_id: vendedores.carla,
    tags: ['rpg', 'feito à mão'],
    preco: 70.00
  });

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
    INSERT INTO Pedidos (comprador_id, vendedor_id, produto_id, quantidade, preco_unitario, valor_total, data_pedido, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const hoje = new Date();
  const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
  const doisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 2, hoje.getDate());

  const pedidos = [
    // Diego compra de Ana
    { comprador: usuarios.diego, prodIdx: 0, qtd: 2, data: doisMesesAtras, status: 'concluido' },
    { comprador: usuarios.diego, prodIdx: 1, qtd: 1, data: mesPassado, status: 'concluido' },
    // Eva compra de Bruno
    { comprador: usuarios.eva, prodIdx: 3, qtd: 1, data: mesPassado, status: 'concluido' },
    { comprador: usuarios.eva, prodIdx: 4, qtd: 2, data: hoje, status: 'concluido' },
    // Diego compra de Carla
    { comprador: usuarios.diego, prodIdx: 8, qtd: 3, data: hoje, status: 'concluido' },
    // Um pendente para exemplo
    { comprador: usuarios.eva, prodIdx: 2, qtd: 1, data: hoje, status: 'pendente' },
  ];

  for (const ped of pedidos) {
    const p = produtos[ped.prodIdx];
    const preco = p.preco;
    const total = preco * ped.qtd;
    insPed.run(
      ped.comprador,
      p.vendedor_id,
      p.id,
      ped.qtd,
      preco,
      total,
      fmtData(ped.data),
      ped.status
    );
  }
});

seed();
console.log('Seed concluído com sucesso.');