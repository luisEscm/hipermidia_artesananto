export function formatarMoeda(value){
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buscarUsuarioLogado() {
    return JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
    
}

export function envLogin(){
  const usuarioLogado = buscarUsuarioLogado();
  if (usuarioLogado === null) {  
    window.location.href = '../login.html';
    return;
  }
  return usuarioLogado;
}