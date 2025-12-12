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