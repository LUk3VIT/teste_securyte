// Camada de comunicação com o back-end.
// Toda chamada à API passa por aqui, então é aqui que você vê exatamente
// o que o front envia (e o que vai aparecer no Burp).

import { API_BASE, MODO_MOCK } from './config.js';
import { mockRequisicao } from './mock.js';
import type {
  CompraPayload, CompraResultado, Item, ItemInventario, ItemPayload, RespostaApi, Usuario,
} from './tipos.js';

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Query = Record<string, string | number>;

function montarUrl(rota: string, query?: Query): string {
  let url = API_BASE + rota;
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).map(([k, v]) => [k, String(v)]),
    ).toString();
    url += (url.includes('?') ? '&' : '?') + qs;
  }
  return url;
}

async function requisicao<T>(metodo: Metodo, rota: string, corpo?: unknown, query?: Query): Promise<T> {
  if (MODO_MOCK) {
    const r = await mockRequisicao(metodo, rota, corpo, query);
    if (!r.sucesso) throw new Error(r.erro ?? 'Erro desconhecido');
    return r.dados as T;
  }

  const resposta = await fetch(montarUrl(rota, query), {
    method: metodo,
    headers: corpo !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    credentials: 'same-origin', // envia o cookie de sessão do PHP (PHPSESSID)
  });

  const texto = await resposta.text();
  let json: RespostaApi<T>;
  try {
    json = JSON.parse(texto);
  } catch {
    // O PHP devolveu algo que não é JSON (warning, var_dump, erro fatal...).
    // Mostramos no console para facilitar o debug do back-end.
    console.error(`[API] ${metodo} ${rota} → resposta não é JSON (HTTP ${resposta.status}):\n`, texto);
    throw new Error(`Resposta inválida do servidor (HTTP ${resposta.status}). Veja o console.`);
  }

  if (!resposta.ok || !json.sucesso) {
    throw new Error(json.erro ?? `Erro HTTP ${resposta.status}`);
  }
  return json.dados as T;
}

export const api = {
  // ---------- Autenticação ----------
  cadastro: (nome: string, email: string, senha: string) =>
    requisicao<Usuario>('POST', '/auth/cadastro', { nome, email, senha }),

  login: (usuario: string, senha: string) =>
    requisicao<Usuario>('POST', '/auth/login', { usuario, senha }),

  logout: () => requisicao<null>('POST', '/auth/logout'),

  // ---------- Usuário ----------
  buscarUsuario: (id: number) => requisicao<Usuario>('GET', `/usuarios/${id}`),

  // ---------- Itens da loja (CRUD) ----------
  listarItens: () => requisicao<Item[]>('GET', '/itens'),
  criarItem: (item: ItemPayload) => requisicao<Item>('POST', '/itens', item),
  atualizarItem: (id: number, item: ItemPayload) => requisicao<Item>('PUT', `/itens/${id}`, item),
  excluirItem: (id: number) => requisicao<null>('DELETE', `/itens/${id}`),

  // ---------- Loja ----------
  comprar: (compra: CompraPayload) => requisicao<CompraResultado>('POST', '/loja/comprar', compra),
  inventario: (usuarioId: number) =>
    requisicao<ItemInventario[]>('GET', '/inventario', undefined, { usuario_id: usuarioId }),
};
