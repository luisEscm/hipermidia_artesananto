export function formatarMoeda(value){
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buscarUsuarioLogado() {
    return JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
    
}

export function envLogin(){
  const usuarioLogado = buscarUsuarioLogado();
  if (usuarioLogado === null) {  
    window.location.href = '../index.html';
    return;
  }
  return usuarioLogado;
}

export function sairConta(){
    localStorage.clear()
    window.location.href = "../index.html"
}

//para o filtro de busca da aba de produtos
function normalizar(str) {
  return (str || "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function atualizarBusca(valor) {
  const termo = normalizar(valor);
  const itens = document.querySelectorAll('.produto-item'); // ajuste ao seu seletor
  itens.forEach(item => {
    const nome = normalizar(item.dataset.nome || item.querySelector('.produto-nome')?.textContent);
    item.style.display = nome.includes(termo) ? '' : 'none';
  });
}

//avisos na pagina do vendedor
export function mostrarAvisos(titulo, mensagem) {
  const container = document.querySelector('.aviso_geral');
  const elTitulo = document.getElementById('info_aviso');
  const elTexto = document.getElementById('info_texto');
  const btn = document.getElementById('bt_aviso');
  if (!container || !elTitulo || !elTexto || !btn) return;

  elTitulo.textContent = titulo;
  elTexto.textContent = mensagem;

  const t = String(titulo || '').toLowerCase();
  if (t.includes('erro')) {
    elTitulo.style.backgroundColor = '#e74c3c';
  } else if (t.includes('conclu') || t.includes('sucesso') || t.includes('ok')) {
    elTitulo.style.backgroundColor = '#2ecc71';
  } else {
    elTitulo.style.backgroundColor = 'aqua'; 
  }

  container.style.display = 'flex';

  const fechar = () => {
    container.style.display = 'none';
    btn.onclick = null;
  };

  btn.onclick = fechar;
}
window.mostrarAvisos = mostrarAvisos;