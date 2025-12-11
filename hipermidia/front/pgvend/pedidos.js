import { formatarMoeda, buscarUsuarioLogado} from './repete_funcoes.js';
const usuarioLogado = buscarUsuarioLogado();
function formatarData(data){
  if (!data) return '';
  const s = String(data).trim();
  const parts = s.split('-');
  if (parts.length !== 3) return s; 
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}


function statusIcone(status){
  const s = String(status || '').toLowerCase();
  if(s.includes('conclu')) return `<span class="icone concluido">✔️ ${status}</span>`;
  if(s.includes('envi')) return `<span class="icone enviado">📦 ${status}</span>`;
  if(s.includes('process')) return `<span class="icone processando">🔄 ${status}</span>`;
  return `<span class="icone pendente">⏱️ ${status}</span>`;
}



function updateResumo(pedidos){
  const total = pedidos.length;
  const pendentes = pedidos.filter(p => /pendente/i.test(p.status)).length;
  const processando = pedidos.filter(p => /process/i.test(p.status)).length;
  const enviados = pedidos.filter(p => /envi/i.test(p.status)).length;

  const idMap = {
    res_total: total,
    res_pendentes: pendentes,
    res_processando: processando,
    res_enviados: enviados
  };
  Object.keys(idMap).forEach(id => {
    const el = document.getElementById(id);
    if(el) el.textContent = idMap[id];
  });

}

function renderPedidos(pedidos){
  const body = document.querySelector('.tab_pedidos #add_tab')
  if(!body) return;
  body.innerHTML = '';
  pedidos.forEach((p,i) => {
    const num = `${i+1}`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="top_rank">${num}</div></td>
      <td>${p.cliente}</td>
      <td>${p.produto}</td>
      <td>${p.qtd}</td>
      <td class="valor_total">${formatarMoeda(p.total)}</td>
      <td>${statusIcone(p.status)}</td>
      <td>${formatarData(p.data)}</td>
    `;
    body.appendChild(tr);
  });
}

async function fetcheRender(){
  if (usuarioLogado === null) {  
    window.location.href = '../login.html';
    return;
  }
  try {

    const res = await fetch(`http://localhost:3000/pedidos/${usuarioLogado.id}`);
    if(!res.ok) throw new Error('erro ao buscar pedidos');
    const data = await res.json();
    renderPedidos(data);
    updateResumo(data);
  } catch (err) {
    console.error('Erro ao carregar pedidos', err);
  }
}

document.addEventListener('DOMContentLoaded', fetcheRender);


