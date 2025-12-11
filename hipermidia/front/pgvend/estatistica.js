import { formatarMoeda, buscarUsuarioLogado} from './repete_funcoes.js';
const usuarioLogado = buscarUsuarioLogado();  
function atualizarEstatisticas(stats = {}) {

  const elTotal = document.getElementById('total_produtos');
  const elReceita = document.getElementById('receita_total');
  const elPedidos = document.getElementById('pedidos_concluidos');
  const elMedia = document.getElementById('media_mensal');

  if (elTotal && stats.totalProdutos != null) elTotal.textContent = stats.totalProdutos;
  if (elReceita && stats.receita != null) elReceita.textContent = formatarMoeda(stats.receita);
  if (elPedidos && stats.pedidos != null) elPedidos.textContent = stats.pedidos;
  if (elMedia && stats.mediaMensal != null) elMedia.textContent = formatarMoeda(stats.mediaMensal);

}


async function buscarEAtualizarEstatisticas(meses = 3) {
  try {
    
    //const url = `http://localhost:3000/estatisticas${vendorSegment}?meses=${encodeURIComponent(meses)}`;
    const res = await fetch(`http://localhost:3000/estatisticas/${usuarioLogado.id}?meses=${meses}`);  
    if (!res.ok) throw new Error('erro ao buscar os dados');
    const data = await res.json();
    
    atualizarEstatisticas({
      totalProdutos: data.quantidadeVendida,
      receita: data.receita,
      pedidos: data.pedidos,
      mediaMensal: data.mediaMensal,
    });
  } catch (e) {
    console.warn('Não foi possível obter estatísticas:', e);
  }
}

async function fetchTopVendidos() {
  try {
    const res = await fetch(`http://localhost:3000/produtos/mais-vendidos/${usuarioLogado.id}`);
    if (!res.ok) throw new Error('erro ao buscar top vendidos');
    const data = await res.json();
    return data;
  }
  catch (e) {
    console.warn('Não foi possível obter top vendidos:', e);
    return [];
  }
}

function renderTopVendidos(items){
  const container = document.getElementById('top_vendidos_list');
  if(!container) return;
  container.innerHTML = '';

  if (!items || items.length === 0) {
    const emptyHtml = `<div class="empty_top">Você ainda não vendeu nehum produto até o momento</div>`;
    container.insertAdjacentHTML('beforeend', emptyHtml);
    return;
  }

  items.forEach((p, i) => {
    const rank = `${i+1}º`;
    const html = `
      <div class="top_item">
        <div class="top_rank">${rank}</div>
        <img class="top_img" src="${p.imagem}" alt="${p.nome}">
        <div class="top_info">
          <div class="top_nome">${p.nome}</div>
          <div class="top_sub">${p.vendidos} unidade(s) vendidas</div>
        </div>
        <div class="top_precos">
          <div class="top_total">${formatarMoeda(p.total)}</div>
          <div class="top_unit">${formatarMoeda(p.unit)}/un</div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}


document.addEventListener('DOMContentLoaded', () => {
  if (usuarioLogado === null) {  
    window.location.href = '../login.html';
    return;
  }
  fetchTopVendidos().then(renderTopVendidos);

  const inputMeses = document.getElementById('meses_input');
  const textoMeses = document.getElementById('inj_meses');

  if (inputMeses && textoMeses) {
    inputMeses.addEventListener('input', () => {
      const v = inputMeses.value;
      textoMeses.textContent = `Estatísticas dos últimos ${v} meses do ano`;
    });
    
    
    inputMeses.addEventListener('change', () => {
       buscarEAtualizarEstatisticas(inputMeses.value);
    });
  }

  buscarEAtualizarEstatisticas();
});


