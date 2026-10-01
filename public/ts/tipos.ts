// Tipos compartilhados pelo front-end.
// Lembrete: estes tipos só existem no editor. Depois do build eles somem,
// e no Burp qualquer campo pode chegar ao servidor com qualquer valor.

export type Perfil = 'jogador' | 'admin';
export type Raridade = 'comum' | 'raro' | 'epico' | 'lendario';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  moedas: number;
}

export interface Item {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  raridade: Raridade;
}

export type ItemPayload = Omit<Item, 'id'>;

export interface ItemInventario {
  item_id: number;
  nome: string;
  raridade: Raridade;
  quantidade: number;
}

export interface CompraPayload {
  usuario_id: number;
  item_id: number;
  quantidade: number;
  preco_unitario: number;
  total: number;
}

export interface CompraResultado {
  moedas: number; // saldo atualizado do usuário
}

// Envelope padrão de TODAS as respostas da API
export interface RespostaApi<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
}
