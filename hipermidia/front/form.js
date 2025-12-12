import { envLogin} from './pgvend/repete_funcoes.js'; 

const form = document.getElementById('form_produtos');
const tagContainer = document.getElementById('tag_container');
const inputTag = document.getElementById('nova_tag');
const btnAddTag = document.getElementById('adicionar_tag');
const usuarioLogado = envLogin();
const params = new URLSearchParams(window.location.search);
 
const id = params.get('id');
let tags = [];
let tagsSelecionadas = []; 


carregarTags().then(() => edicaoProduto()).catch(()=>edicaoProduto());

async function carregarTags(){
  try {
    const res = await fetch('http://localhost:3000/tags');
    if(!res.ok) throw new Error('erro ao buscar as tags');
    const idNome = await res.json();
    Object.entries(idNome).forEach(([id, nome]) => {
      tags.push(nome.nome)
    });
    
    renderTags();
  } catch (err) {
    console.error('Erro ao carregar as tags', err);
  }
}

//cadasttra uma nova tag
btnAddTag.addEventListener('click', async () => {
  const nome = inputTag.value.trim();

  if (nome && !tags.includes(nome)) {
    try {
      const res = await fetch('http://localhost:3000/tags', {
        method: 'POST'  ,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      });
      
      if (!res.ok) throw new Error('Erro ao salvar a tag');
      tags.push(nome);
      renderTags();
    } catch (err) {
      console.error('Erro ao adicionar tag', err);
      alert('Erro ao salvar a tag: ' + err.message);
    }
  }
  inputTag.value = '';
});

//rendereizas as tags do form
function renderTags() {
  tagContainer.innerHTML = '';
  tags.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'tag';

    if (tagsSelecionadas.includes(tag)) {
      span.classList.add('selecionada');
    }
    span.textContent = `${'+ '+ tag}`;
    span.style.cursor = 'pointer';
    span.title = 'Clique para selcionar';
    span.onclick = () => selecionarTag(tag);
    tagContainer.appendChild(span);
  });
}

function selecionarTag(tag) {
  if (tagsSelecionadas.includes(tag)) {
    tagsSelecionadas = tagsSelecionadas.filter(t => t !== tag);
  } else {
    tagsSelecionadas.push(tag);
  }
  renderTags();
}

// Salvar produto
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const produto = {
    vendedor_id: usuarioLogado.id, 
    nome: document.getElementById('nome_produto').value,
    descricao: document.getElementById('descricao_produto').value,
    preco: Number(document.getElementById('preco_produto').value),
    quantidade: Number(document.getElementById('quantidade_produto').value),
    imagem: document.getElementById('url_imagem').value,
    tags: tagsSelecionadas
  };
 
  
  try {
      let resTag;
      if (id) {
        resTag = await fetch(`http://localhost:3000/produtos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(produto)
        }); 
      }else {
        resTag = await fetch('http://localhost:3000/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(produto)
        }); 
      }

    if (resTag.ok) {
      alert('Produto salvo com sucesso!');
      window.location.href = 'venda.html';
    } else {
      const err = await resTag.json();
      alert('Erro ao salvar: ' + (err.error || 'Erro desconhecido'));
    }
  } catch (error) {
    alert('Erro de conexão: ' + error.message);
  }
});


//para realizar a edição do produto
async function edicaoProduto() {
  if (!id) return; 

  try {
    const res = await fetch(`http://localhost:3000/produtos/detalhes/${id}`);
    if (!res.ok) throw new Error('Produto não encontrado');
    console.log(res);
    const produto = await res.json();
    console.log('Dados do produto para edição:', produto);

    const elNome = document.getElementById('nome_produto');
    const elDescricao = document.getElementById('descricao_produto');
    const elPreco = document.getElementById('preco_produto');
    const elQuantidade = document.getElementById('quantidade_produto');
    const elImagem = document.getElementById('url_imagem');

    if (elNome) elNome.value = produto.nome || '';
    if (elDescricao) elDescricao.value = produto.descricao || '';
    if (elPreco) elPreco.value = produto.preco ?? '';
    if (elQuantidade) elQuantidade.value = produto.quantidade ?? '';
    if (elImagem) elImagem.value = produto.imagem || '';

    tagsSelecionadas = Array.isArray(produto.tags) ? [...produto.tags] : [];
    renderTags();

  } catch (err) {
    console.error('Erro ao carregar produto para edição', err);
  }
}
