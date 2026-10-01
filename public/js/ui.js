// Utilitários de interface.
export function $(seletor) {
    const el = document.querySelector(seletor);
    if (!el)
        throw new Error(`Elemento não encontrado: ${seletor}`);
    return el;
}
export function aviso(mensagem, tipo = 'info') {
    let pilha = document.getElementById('avisos');
    if (!pilha) {
        pilha = document.createElement('div');
        pilha.id = 'avisos';
        document.body.appendChild(pilha);
    }
    const el = document.createElement('div');
    el.className = `aviso aviso-${tipo}`;
    el.textContent = mensagem;
    pilha.appendChild(el);
    setTimeout(() => el.classList.add('saindo'), 3200);
    setTimeout(() => el.remove(), 3600);
}
export function formatarMoedas(valor) {
    return `${valor.toLocaleString('pt-BR')} 🪙`;
}
export function mensagemErro(e) {
    return e instanceof Error ? e.message : String(e);
}
export function carregando(botao, ativo) {
    botao.disabled = ativo;
    botao.classList.toggle('carregando', ativo);
}
