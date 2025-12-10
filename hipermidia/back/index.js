import express from "express"
import cors from "cors"
import Service from "./service/service.js"

const app = express()
app.use(cors())
app.use(express.json())


// Estatísticas 
app.get("/estatisticas/:vendedorId", (req, res) => {
  try {
    const meses = req.query.meses || 3;
    const stats = Service.obterEstatisticas(meses, req.params.vendedorId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Produtos Mais Vendidos
app.get("/produtos/mais-vendidos/:vendedorId", (req, res) => {
  try {
    const top = Service.obterProdutosMaisVendidos(req.params.vendedorId);
    res.json(top);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Lista de Produtos do Vendedor
app.get("/produtos/:vendedorId", (req, res) => {
  try {
    const products = Service.obterTodosProdutos(req.params.vendedorId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Lista de Pedidos do Vendedor
app.get("/pedidos/:vendedorId", (req, res) => {
  try {
    const orders = Service.obterPedidos(req.params.vendedorId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Listar Tags
app.get("/tags", (req, res) => {
  try {
    const tags = Service.listarTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Buscar Usuário
app.get("/usuarios/:id", (req, res) => {
  try {
    const usuario = Service.buscarUsuario(req.params.id);
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ error: "Usuário não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})


// Criar Produto
app.post("/produtos", (req, res) => {
  try {
    const newProduct = Service.criarProduto(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Deletar Produto
app.delete("/produtos/:id", (req, res) => {
  try {
    const success = Service.deletarProduto(req.params.id);
    if (success) {
      res.status(200).json({ message: "Produto excluído" });
    } else {
      res.status(404).json({ error: "Produto não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Adicionar Tag
app.post("/tags", (req, res) => {
  try {
    const tag = Service.adicionarTag(req.body.nome);
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Login
app.post("/login", (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = Service.consultarUsuario(email, senha);
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000")
})