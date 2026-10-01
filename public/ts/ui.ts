// Utilitários de interface.

export function $<T extends HTMLElement = HTMLElement>(seletor: string): T {
  const el = document.querySelector<T>(seletor);
  if (!el) throw new Error(`Elemento não encontrado: ${seletor}`);
  return el;
}

export function aviso(mensagem: string, tipo: 'sucesso' | 'erro' | 'info' = 'info'): void {
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

export function formatarMoedas(valor: number): string {
  return `${valor.toLocaleString('pt-BR')} 🪙`;
}

export function mensagemErro(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function carregando(botao: HTMLButtonElement, ativo: boolean): void {
  botao.disabled = ativo;
  botao.classList.toggle('carregando', ativo);
}
