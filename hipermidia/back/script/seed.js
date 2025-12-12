import db from '../config/database.js';
//arquivo para popular o banco
function fmtData(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const seed = db.transaction(() => {
  console.log('Iniciando limpeza do banco de dados...');
  //reseta o banco
  db.prepare('DELETE FROM Produto_Tags').run();
  db.prepare('DELETE FROM Pedidos').run();
  db.prepare('DELETE FROM Produtos').run();
  db.prepare('DELETE FROM Vendedor').run();
  db.prepare('DELETE FROM Usuarios').run();
  db.prepare('DELETE FROM Tags').run();

  //começara inserindo as tags
  console.log('Inserindo Tags...');
  const tags = [
    'action figure', 'rpg', 'anime', 'feito à mão', 
    'impressao 3d', 'cyberpunk', 'cenario', 'acessorios', 'decoracao'
  ];
  const insTag = db.prepare('INSERT INTO Tags (nome) VALUES (?)');
  tags.forEach(t => insTag.run(t));

  const getTag = db.prepare('SELECT id FROM Tags WHERE nome = ?');

  
  //inseri os usuarios vendedor e clientes
  //nos teste usa esses ou se cadastrar, o sistema não permite entrar sem logar

  console.log('Inserindo Usuários...');
  const insUser = db.prepare(`
    INSERT INTO Usuarios (nome, email, senha, tipo, telefone, endereco)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const usuarios = {
    ///vendedores
    ana:   insUser.run('Ana Artesã', 'ana@exemplo.com', '123456', 'vendedor', '11999990001', 'Rua das Flores, 10').lastInsertRowid,
    bruno: insUser.run('Bruno Maker', 'bruno@exemplo.com', '123456', 'vendedor', '11999990002', 'Av. Impressão, 200').lastInsertRowid,
    carla: insUser.run('Carla 3D', 'carla@exemplo.com', '123456', 'vendedor', '11999990003', 'Rua Resina, 300').lastInsertRowid,
    fabio: insUser.run('Fábio Pinturas', 'fabio@exemplo.com', '123456', 'vendedor', '11999990006', 'Travessa das Cores, 55').lastInsertRowid, // Novo Vendedor
    
    //clientes
    diego: insUser.run('Diego Cliente', 'diego@exemplo.com', '123456', 'cliente', '11999990004', 'Rua Comprador, 400').lastInsertRowid,
    eva:   insUser.run('Eva Cliente', 'eva@exemplo.com', '123456', 'cliente', '11999990005', 'Av. Cliente, 500').lastInsertRowid,
    gina:  insUser.run('Gina Gamer', 'gina@exemplo.com', '123456', 'cliente', '11999990007', 'Praça dos Jogos, 88').lastInsertRowid, // Novo Cliente
    hugo:  insUser.run('Hugo Colecionador', 'hugo@exemplo.com', '123456', 'cliente', '11999990008', 'Alameda Rara, 99').lastInsertRowid // Novo Cliente
  };

  //perfil vendedor
  const insVend = db.prepare(`
    INSERT INTO Vendedor (usuario_id, nome_loja, endereco_loja)
    VALUES (?, ?, ?)
  `);

  const vendedores = {
    ana:   insVend.run(usuarios.ana, 'Ateliê da Ana', 'Rua das Flores, 10').lastInsertRowid,
    bruno: insVend.run(usuarios.bruno, 'Oficina do Bruno', 'Av. Impressão, 200').lastInsertRowid,
    carla: insVend.run(usuarios.carla, 'Studio da Carla', 'Rua Resina, 300').lastInsertRowid,
    fabio: insVend.run(usuarios.fabio, 'Fábio Miniaturas & Cores', 'Travessa das Cores, 55').lastInsertRowid,
  };

  //produtos
  console.log('Inserindo Produtos...');
  const insProd = db.prepare(`
    INSERT INTO Produtos (vendedor_id, nome, descricao, preco, quantidade_estoque, url_imagem)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const produtos = [];

  function addProd(vendId, nome, descricao, preco, qtd, url, tags) {
    const id = insProd.run(vendId, nome, descricao, preco, qtd, url).lastInsertRowid;
    produtos.push({ id, vendedor_id: vendId, nome, descricao, preco, url_imagem: url, tags });
  }

  //adionar produto com vendedor e tags
  addProd(
    vendedores.ana, 
    'Miniatura Elfa Arqueira', 
    'Miniatura detalhada de elfa arqueira, escala 28mm, pronta para jogar.', 
    120.00, 10, 
    'https://images.tcdn.com.br/img/img_prod/599593/princesa_zara_elfa_guerreira_miniatura_sem_pintura_para_rpg_25462079_1_42e4efed796466be55e8d00e8d165533.jpg', // Miniatura pintada estilo RPG
    ['action figure', 'rpg', 'feito à mão']
  );
  addProd(
    vendedores.ana, 
    'Guerreiro de Madeira', 
    'Escultura rústica de guerreiro feita em madeira nobre envernizada.', 
    90.00, 8, 
    'https://img.elo7.com.br/product/685x685/48C2039/miniatura-de-rpg-guerreiro-tribal-1-impressao-3d-de-resina.jpg', // Soldado de madeira vintage
    ['feito à mão', 'rpg', 'decoracao']
  );
  addProd(
    vendedores.ana, 
    'Mascote Anime em Feltro', 
    'Boneco de feltro fofinho inspirado em mascotes de animes clássicos.', 
    60.00, 15, 
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgn3f9o83BEEjsQqz8mO5h2q8aZPngmRESJDHy4-ztUquZRhHixZGTIt0Igw0-bvcqA6aUQr3-1TAAcT_lz0nTUAnSS9hzqBUd-QKUU-IN_8Qz4puo56TVf6XE8d5645G7rfxwEaU9jRVlkPk-IOQkRA8BHU-ImyPvbZ3oz-W1q6l3rvA8BmyutAIh0Pne7/s1204/one%20piece%20luffy%20boneco%20feltro.jpg', // Gato de crochê/feltro (Amigurumi)
    ['anime', 'feito à mão']
  );

 
  addProd(
    vendedores.bruno, 
    'Cavaleiro 3D Print High-Res', 
    'Cavaleiro impresso em 3D (resina cinza) com resolução 4k, 15cm.', 
    150.00, 12, 
    'https://i.etsystatic.com/35171891/r/il/56542e/5461331458/il_1588xN.5461331458_m54t.jpg', // Miniatura Warhammer cinza
    ['action figure', 'impressao 3d', 'rpg']
  );
  addProd(
    vendedores.bruno, 
    'Busto de Dragão PLA', 
    'Busto de dragão detalhado impresso em PLA, ideal para testar pinturas.', 
    200.00, 5, 
    'https://img-new.cgtrader.com/items/3955106/2223f8d8f6/dragon-bust-3d-model-obj-fbx-stl.jpg', // Estátua de dragão
    ['impressao 3d', 'rpg', 'decoracao']
  );
  addProd(
    vendedores.bruno, 
    'Mecha Robot Kit', 
    'Kit desmontado de robô estilo anime, com articulações funcionais.', 
    180.00, 7, 
    'https://www.moyustore.com/cdn/shop/products/moyustore-diy-3d-metal-fighting-shooter-mecha-assembly-model-kit_2.jpg?v=1629870779', // Robô estilo Gundam
    ['anime', 'impressao 3d', 'action figure']
  );

  addProd(
    vendedores.carla, 
    'Mago com capa Azul', 
    'Figura de mago em com capa azul, efeito de magia.', 
    160.00, 9, 
    'https://i.etsystatic.com/14683970/r/il/6c2659/6446390967/il_1588xN.6446390967_f079.jpg', // Figura mística azulada
    ['action figure', 'rpg']
  );
  addProd(
    vendedores.carla, 
    'Persona Chibi', 
    'Personagem estilo Chibi com cabeça grande e olhos expressivos.', 
    110.00, 14, 
    'https://preview.redd.it/does-anyone-else-think-the-chibi-style-used-in-persona-q-is-v0-8jx7v2hbgezb1.jpg?width=640&crop=smart&auto=webp&s=8ec8ccc90684741f22ffaa9355a53b8dc9f4f649', // Bonecos estilo Funko/Chibi
    ['anime', 'feito à mão']
  );
  addProd(
    vendedores.carla, 
    'Set Dados RPG Artesanais', 
    'Conjunto de dados para RPG feitos de madeira e resina epóxi.', 
    70.00, 20, 
    'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQFPLA9coGcUuhcICPbn6r5sM4daxGxzXKc3cva-iNZVTtua8GUVTldlUQmoKoP', // Dados poliédricos de RPG
    ['rpg', 'feito à mão', 'acessorios']
  );

  addProd(
    vendedores.fabio, 
    'Cenário Ruínas Medievais', 
    'Peça de terreno para wargames, pintada à mão com efeito de musgo.', 
    250.00, 3, 
    'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQWIEGgb_akKMlQYHbZ2z9brfDK_GIoqvT5h_8LNGOX2XDfCAOqmYvs-xdzJNZa', // Cenário de ruínas para miniaturas
    ['cenario', 'rpg', 'feito à mão']
  );
  addProd(
    vendedores.fabio, 
    'Busto Hacker Cyberpunk', 
    'Busto escala 1/10 de hacker cyberpunk com leds instalados.', 
    300.00, 2, 
    'https://miniset.net/files/styles/set_preview_500_box/public/set/jdr-mmf707079-0.png?itok=Oayfvv2r', // Estética Neon/Cyberpunk
    ['cyberpunk', 'impressao 3d', 'decoracao']
  );
  addProd(
    vendedores.fabio, 
    'Torre de Dados Caveira', 
    'Torre para rolar dados em formato de crânio.', 
    130.00, 10, 
    'https://media.printables.com/media/prints/56081/images/555745_3c7effb0-ac07-4cc8-b029-46f14d789f1b/thumbs/inside/1600x1200/jpg/08-deserts-kiss-diorama-dice-tower.webp', // Caveira detalhada
    ['acessorios', 'rpg', 'impressao 3d']
  );

  //associar tag e produto
  console.log('Associando Tags aos Produtos...');
  const insPT = db.prepare('INSERT OR IGNORE INTO Produto_Tags (produto_id, tag_id) VALUES (?, ?)');
  for (const p of produtos) {
    for (const nomeTag of p.tags) {
      const tagId = getTag.get(nomeTag)?.id;
      if (tagId) insPT.run(p.id, tagId);
    }
  }

  //pedidos
  console.log('Gerando Pedidos...');
  const insPed = db.prepare(`
    INSERT INTO Pedidos (comprador_id, vendedor_id, produto_nome, produto_url_imagem, quantidade, preco, valor_total, data_pedido, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const hoje = new Date();
  const ontem = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1);
  const semanaPassada = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 7);
  const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
  const doisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 2, hoje.getDate());

  const pedidos = [
    
    { comprador: usuarios.diego, prodIdx: 0, qtd: 2, data: doisMesesAtras, status: 'concluido' }, 
    { comprador: usuarios.diego, prodIdx: 1, qtd: 1, data: mesPassado, status: 'enviado' },     
    { comprador: usuarios.diego, prodIdx: 8, qtd: 3, data: hoje, status: 'processado' },        
    { comprador: usuarios.diego, prodIdx: 5, qtd: 1, data: doisMesesAtras, status: 'concluido' }, 

    { comprador: usuarios.eva, prodIdx: 3, qtd: 1, data: mesPassado, status: 'concluido' },     
    { comprador: usuarios.eva, prodIdx: 4, qtd: 2, data: hoje, status: 'processado' },           
    { comprador: usuarios.eva, prodIdx: 2, qtd: 1, data: hoje, status: 'enviado' },            
    { comprador: usuarios.eva, prodIdx: 6, qtd: 1, data: mesPassado, status: 'concluido' },     

    { comprador: usuarios.gina, prodIdx: 10, qtd: 1, data: semanaPassada, status: 'concluido' }, 
    { comprador: usuarios.gina, prodIdx: 9, qtd: 2, data: ontem, status: 'enviado' },           
    { comprador: usuarios.gina, prodIdx: 11, qtd: 1, data: hoje, status: 'pendente' },          

   
    { comprador: usuarios.hugo, prodIdx: 10, qtd: 1, data: mesPassado, status: 'processado' },  
    { comprador: usuarios.hugo, prodIdx: 3, qtd: 5, data: doisMesesAtras, status: 'concluido' }, 
    { comprador: usuarios.hugo, prodIdx: 7, qtd: 3, data: hoje, status: 'processado' },        
  ]
  for (const ped of pedidos) {
    const p = produtos[ped.prodIdx];
    if (!p) {
        console.warn(`Produto index ${ped.prodIdx} não encontrado para pedido de ${ped.comprador}`);
        continue;
    }
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