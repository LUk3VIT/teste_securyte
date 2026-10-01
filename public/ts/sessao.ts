// "Sessão" do lado do navegador.
//
// [v0-INSEGURO] O usuário logado (incluindo perfil e moedas) fica salvo no
// localStorage, e o front confia nele. Qualquer pessoa pode abrir o DevTools
// e editar esse valor. Quem deve saber quem está logado é o SERVIDOR.

import type { Usuario } from './tipos.js';

const CHAVE = 'loja_usuario';

export function obterUsuario(): Usuario | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as Usuario) : null;
  } catch {
    return null;
  }
}

export function salvarUsuario(u: Usuario): void {
  try { localStorage.setItem(CHAVE, JSON.stringify(u)); } catch { /* ignora */ }
}

export function limparUsuario(): void {
  try { localStorage.removeItem(CHAVE); } catch { /* ignora */ }
}
