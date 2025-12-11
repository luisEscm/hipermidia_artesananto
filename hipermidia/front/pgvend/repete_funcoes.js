export function formatarMoeda(value){
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function buscarUsuarioLogado() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
    return usuarioLogado;   
}