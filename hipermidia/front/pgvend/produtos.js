
function formatarMoeda(value){
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderizarProdutos(produtos) {
    const container = document.getElementById('lista_produtos')
    if (!container) return;

    container.innerHTML = '';

    produtos.forEach(produto => {
        const tags = (produto.tags || []).map(tag => `<span class="tag_produto">${tag}</span>`).join('');

        const html = `
            <div class="cartao_produto">
                <img src="${produto.imagem}" alt="${produto.nome}" class="img_produto">
                <div class="info_produto">
                    <h3>${produto.nome}</h3>
                    <p class="descricao_produto" style="font-size: 0.9em; color: #666; margin: 5px 0;">${produto.descricao || ''}</p>
                    <div class="tags_produto">${tags}</div>
                    <div class="preco_estoque">
                        <span class="preco">${formatarMoeda(produto.preco)}</span>
                        <span class="estoque">${produto.quantidade} em estoque</span>
                    </div>
                    <div class="botoes_produto">
                        <button class="btn_editar" data-id="${produto.id}">✏️ Editar</button>
                        <button class="btn_excluir" data-id="${produto.id}">🗑️ Excluir</button>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });

    //eventos
     container.querySelectorAll('.btn_editar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        editarProduto(id);
      });
    });
    container.querySelectorAll('.btn_excluir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        abrirExclusao(id);
      });
    });
}

// placeholders simples — substitua pela lógica real
function editarProduto(id){
  window.location.href = `../form.html?id=${id}`;
}



async function excluirProduto(id){

  try {
    const res = await fetch(`http://localhost:3000/produtos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(()=>({ error: 'Erro' }));
      throw new Error(err.error || 'Falha ao excluir');
    }
    // Recarrega a lista do banco
    produtos = await fetchProdutosFromApi();
    renderizarProdutos(produtos);
  } catch (e) {
    alert('Não foi possível excluir o produto: ' + e.message);
  }
}

function abrirExclusao(id) {
    const modal = document.getElementById("confirmar");
    modal.style.display = "flex";

    document.getElementById("btnSim").onclick = () => {
        modal.style.display = "none";
        excluirProduto(id);
    };

    document.getElementById("btnNao").onclick = () => {
        modal.style.display = "none";
    };
}



async function fetchProdutosFromApi(){
    try{
        const res = await window.fetch('http://localhost:3000/produtos/1');
        if(!res.ok) throw new Error('Erro ao buscar produtos');
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    }catch(e){
        console.warn('Não foi possível obter produtos:', e);
        return [];
    }
}



document.addEventListener('DOMContentLoaded', async () => {
   const apiProdutos = await fetchProdutosFromApi();
    renderizarProdutos(apiProdutos);
  
});
