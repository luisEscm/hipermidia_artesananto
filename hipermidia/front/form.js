const form = document.getElementById('form_produtos');
const tagContainer = document.getElementById('tag_container');
const inputTag = document.getElementById('nova_tag');
const btnAddTag = document.getElementById('adicionar_tag');

let tags = [];

// Adicionar tag
btnAddTag.addEventListener('click', () => {
  const nome = inputTag.value.trim();
  if (nome && !tags.includes(nome)) {
    tags.push(nome);
    renderTags();
    inputTag.value = '';
  }
});

function renderTags() {
  tagContainer.innerHTML = '';
  tags.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'tag_produto';
    span.textContent = tag;
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
    vendedor_id: 1, // Hardcoded por enquanto
    nome: document.getElementById('nome_produto').value,
    descricao: document.getElementById('descricao_produto').value,
    preco: Number(document.getElementById('preco_produto').value),
    quantidade: Number(document.getElementById('quantidade_produto').value),
    imagem: document.getElementById('url_imagem').value,
    tags: tags
  };

  try {
    const res = await fetch('http://localhost:3000/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(produto)
    });

    if (res.ok) {
      alert('Produto salvo com sucesso!');
      window.location.href = 'venda.html';
    } else {
      const err = await res.json();
      alert('Erro ao salvar: ' + (err.error || 'Erro desconhecido'));
    }
  } catch (error) {
    alert('Erro de conexão: ' + error.message);
  }
});
