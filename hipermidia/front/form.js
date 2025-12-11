const form = document.getElementById('form_produtos');
const tagContainer = document.getElementById('tag_container');
const inputTag = document.getElementById('nova_tag');
const btnAddTag = document.getElementById('adicionar_tag');

let tags = [];

carregarTags();
async function carregarTags(){
  try {
    const res = await window.fetch('http://localhost:3000/tags');
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

// Adicionar tag
btnAddTag.addEventListener('click', () => {
  const nome = inputTag.value.trim();
  if (nome && !tags.includes(nome)) {
    tags.push(nome);
    renderTags();
  }
  inputTag.value = '';
});

function renderTags() {
  tagContainer.innerHTML = '';
  tags.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = `${'+ '+ tag}`;
    console.log(tag)
    span.style.cursor = 'pointer';
    span.title = 'Clique para remover';
    span.onclick = () => removerTag(tag);
    tagContainer.appendChild(span);
  });
}

function removerTag(tag) {
  tags = tags.filter(t => t !== tag);
  renderTags();
}

// Salvar produto
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const produto = {
    vendedor_id: 1, 
    nome: document.getElementById('nome_produto').value,
    descricao: document.getElementById('descricao_produto').value,
    preco: Number(document.getElementById('preco_produto').value),
    quantidade: Number(document.getElementById('quantidade_produto').value),
    imagem: document.getElementById('url_imagem').value,
    tags: tags
  };

  try {
    const resTag = await fetch('http://localhost:3000/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(produto)
    });

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
