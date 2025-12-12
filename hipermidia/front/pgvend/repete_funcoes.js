export function formatarMoeda(value){
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buscarUsuarioLogado() {
    return JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
    
}

export function envLogin(){
  const usuarioLogado = buscarUsuarioLogado();
  if (usuarioLogado === null) {  
    window.location.href = '../compra_publico.html';
    return;
  }
  return usuarioLogado;
}

export function sairConta(){
    localStorage.clear()
    window.location.href = "../compra_publico.html"
}