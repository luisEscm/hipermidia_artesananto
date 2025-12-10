function formatarMoeda(value){
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

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
    const res = await fetch(`http://localhost:3000/estatisticas/2?meses=${meses}`);  
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

document.addEventListener('DOMContentLoaded', () => {
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


