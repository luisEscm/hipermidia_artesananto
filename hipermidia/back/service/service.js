import db from '../config/database.js';

function trucarfinal2(n) {
  return Math.floor(n * 100) / 100;
}

class Service {

  // Estatísticas do vendedor
  
  obterEstatisticas(qtd_meses = 3, vendedorId) {

    const qtdmeses = Number(qtd_meses);
    const qtdMeses = qtdmeses <= 0 ? 0 : qtdmeses > 12 ? 12 : qtdmeses;
    const agora = new Date();
    const anoAtual = String(agora.getFullYear());
    const mesAtual = agora.getMonth() + 1;

    const mesesSelecionados = [];
    for (let i = 0; i < qtdMeses; i += 1) {
      const mes = mesAtual - i;
      if (mes <= 0) break;
      mesesSelecionados.push(String(mes).padStart(2, '0'));
    }

    let receita = 0;
    let pedidos = 0;
    let quantidadeVendida = 0;

    if (mesesSelecionados.length > 0) {
      const marcadores = mesesSelecionados.map(() => '?').join(', ');
      const parametros = [anoAtual, ...mesesSelecionados, vendedorId];

      const estatisticasPeriodo = db.prepare(`
        SELECT 
          SUM(valor_total) AS receita,
          SUM(quantidade) AS quantidadeVendida,
          COUNT(*) AS pedidos
        FROM Pedidos
        WHERE strftime('%Y', data_pedido) = ?
          AND strftime('%m', data_pedido) IN (${marcadores})
          AND vendedor_id = ?
          AND status IN ('concluido', 'enviado', 'processado')
      `).get(...parametros) || {};

      receita = estatisticasPeriodo.receita || 0;
      pedidos = estatisticasPeriodo.pedidos || 0;
      quantidadeVendida = estatisticasPeriodo.quantidadeVendida || 0;
    }

    const mediaMensal = mesesSelecionados.length > 0 ? receita / mesesSelecionados.length : 0;

    return {
      receita : trucarfinal2(receita),
      pedidos,
      quantidadeVendida,
      mediaMensal: trucarfinal2(mediaMensal)
    };
  }

  //rank dos produtos mais vendidos estatistica
  obterProdutosMaisVendidos(vendedorId) {
    const sql = `
      SELECT 
        produto_nome AS nome,
        SUM(quantidade) AS vendidos,
        SUM(valor_total) AS total,
        preco AS unit,
        produto_url_imagem AS imagem
      FROM Pedidos
      WHERE vendedor_id = ?
      GROUP BY produto_nome
      ORDER BY vendidos DESC
    `;
    return db.prepare(sql).all(vendedorId);
  }

  // Listar todos os produtos do vendedor
  obterTodosProdutos(vendedorId) {
    const produtos = db.prepare(`
      SELECT 
        id, 
        nome, 
        descricao,
        preco, 
        quantidade_estoque AS quantidade, 
        url_imagem AS imagem 
      FROM Produtos
      WHERE vendedor_id = ?
    `).all(vendedorId);

    return produtos.map((produto) => {
      const tags = db.prepare(`
        SELECT t.nome 
        FROM Tags t
        JOIN Produto_Tags pt ON t.id = pt.tag_id
        WHERE pt.produto_id = ?
      `).all(produto.id);

      return {
        ...produto,
        tags: tags.map((tag) => tag.nome)
      };
    });
  } 

   // Listar todos os produtos
  obterTodos() {
    const produtos = db.prepare(`
      SELECT 
        id, 
        nome, 
        descricao,
        preco, 
        quantidade_estoque AS quantidade, 
        url_imagem AS imagem,
        vendedor_id
      FROM Produtos
    `).all();

    return produtos.map((produto) => {
      const tags = db.prepare(`
        SELECT t.nome 
        FROM Tags t
        JOIN Produto_Tags pt ON t.id = pt.tag_id
        WHERE pt.produto_id = ?
      `).all(produto.id);

      return {
        ...produto,
        tags: tags.map((tag) => tag.nome)
      };
    });
  } 

  //lista de pedidos realizados
   obterPedidos(vendedorId) {
    const sql = `
      SELECT 
        ped.id,
        u.nome AS cliente,
        ped.produto_nome AS produto,
        ped.quantidade AS qtd,
        ped.valor_total AS total,
        ped.status,
        ped.data_pedido AS data
      FROM Pedidos ped
        JOIN Usuarios u ON ped.comprador_id = u.id
      WHERE ped.vendedor_id = ?
      ORDER BY ped.data_pedido DESC
    `;
    return db.prepare(sql).all(vendedorId);
  }


  //cria o produto e adiciona no banco
  criarProduto(dados) {
    const inserirProduto = db.prepare(`
      INSERT INTO Produtos (vendedor_id, nome, descricao, preco, quantidade_estoque, url_imagem)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const resultado = inserirProduto.run(
      dados.vendedor_id,
      dados.nome,
      dados.descricao,
      dados.preco,
      dados.quantidade,
      dados.imagem
    );

    const idProduto = resultado.lastInsertRowid;

    //verifica se foi adicionado tag no produto
    if (Array.isArray(dados.tags) && dados.tags.length > 0) {
      const buscarTag = db.prepare('SELECT id FROM Tags WHERE nome = ?');
    
      const associarTag = db.prepare(`
        INSERT OR IGNORE INTO Produto_Tags (produto_id, tag_id)
        VALUES (?, ?)
      `);

      const transacao = db.transaction((tags) => {
        tags.forEach((nomeTag) => {
          //normalizar
          const nomeNormalizado = nomeTag.trim().toLowerCase();
          if (!nomeNormalizado){
            return
          };

          const tagExistente = buscarTag.get(nomeNormalizado);

          //se existe a tag
          if (tagExistente) {
            associarTag.run(idProduto, tagExistente.id);
          }
        });
      });

      // Remove duplicatas do array antes de processar
      const tagsUnicas = [...new Set(dados.tags)];
      transacao(tagsUnicas);
    }

    return {
      id: idProduto,
      nome: dados.nome,
      descricao: dados.descricao,
      preco: dados.preco,
      quantidade: dados.quantidade,
      imagem: dados.imagem,
      tags: dados.tags
    };
  }

  // Cria um novo pedido
  criarPedido(dados) {
    // Busca dados do produto para congelar no pedido
    const produto = db.prepare('SELECT * FROM Produtos WHERE id = ?').get(dados.produto_id);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    // Calcula totais
    const preco = produto.preco;
    const quantidade = Number(dados.quantidade);
    const total = preco * quantidade;
    
    // Data atual YYYY-MM-DD
    const data = new Date().toISOString().split('T')[0];
    const status = 'processado';

    const stmt = db.prepare(`
      INSERT INTO Pedidos (
        comprador_id, 
        vendedor_id, 
        produto_nome, 
        produto_url_imagem, 
        quantidade, 
        preco, 
        valor_total, 
        data_pedido, 
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      dados.comprador_id,
      produto.vendedor_id,
      produto.nome,
      produto.url_imagem,
      quantidade,
      preco,
      total,
      data,
      status
    );

    return {
      id: info.lastInsertRowid,
      comprador_id: dados.comprador_id,
      vendedor_id: produto.vendedor_id,
      produto_nome: produto.nome,
      quantidade,
      valor_total: total,
      status
    };
  }

  deletarProduto(id) {
    const produtoExistente = db.prepare('SELECT id FROM Produtos WHERE id = ?').get(id);
    if (!produtoExistente) return false;

    const excluirProduto = db.prepare('DELETE FROM Produtos WHERE id = ?');
    const resultado = excluirProduto.run(id);

    return resultado.changes > 0;
  }

  //retorna as tags existentes no banco
  listarTags() {
      return db.prepare('SELECT * FROM Tags ORDER BY nome ASC').all();
  }

  //adiciona tag no banco
  adicionarTag(nome) {

    const nomeNormalizado = nome.trim().toLowerCase();
    const buscarTag = db.prepare('SELECT * FROM Tags WHERE nome = ?');
    const criarTag = db.prepare('INSERT INTO Tags (nome) VALUES (?)');

    let tag = buscarTag.get(nomeNormalizado);

    if (!tag) {
      const info = criarTag.run(nomeNormalizado);
      tag = { id: info.lastInsertRowid, nome: nomeNormalizado };
    }

    return tag;
  }

  //consulta usuario para login
  consultarUsuario(email, senha) {
    const buscarUsuario = db.prepare('SELECT * FROM Usuarios WHERE email = ?');
    const usuario = buscarUsuario.get(email);

    if (usuario && usuario.senha === senha) {
      const { senha, ...usuariosemsenha } = usuario;
      return usuariosemsenha;
    }

    return null;
  }

  buscarUsuario(id) {
    const buscarUsuario = db.prepare('SELECT * FROM Usuarios WHERE id = ?');
    const usuario = buscarUsuario.get(id);

    if (!usuario) return null;

    const { senha, ...usuariosemsenha } = usuario;

    if (usuario.tipo === 'vendedor') {
      const buscarVendedor = db.prepare('SELECT * FROM Vendedor WHERE usuario_id = ?');
      const vendedor = buscarVendedor.get(id);
      if (vendedor) {
        return { ...usuariosemsenha, vendedor };
      }
    }

    return usuariosemsenha;
  }
}

export default new Service();
