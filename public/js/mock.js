// ===================================================================
// BACK-END FALSO (só para ver o front funcionando com MODO_MOCK = true)
// ===================================================================
// Simula uma API "ingênua", do jeito que muita gente escreve a primeira
// versão: confia em tudo o que o front manda. Os dados ficam no
// localStorage do navegador. Isto NÃO é referência de como fazer o PHP.
//
// Contas de teste:
//   admin@loja.com   / admin123  (admin)
//   jogador@loja.com / 123456    (jogador)
const CHAVE_DB = 'loja_mock_db';
function bancoInicial() {
    return {
        usuarios: [
            { id: 1, nome: 'Admin', email: 'admin@loja.com', senha: 'admin123', perfil: 'admin', moedas: 5000 },
            { id: 2, nome: 'Jogador', email: 'jogador@loja.com', senha: '123456', perfil: 'jogador', moedas: 500 },
        ],
        itens: [
            { id: 1, nome: 'Poção de Vida', descricao: 'Recupera 50 pontos de vida.', preco: 25, estoque: 100, raridade: 'comum' },
            { id: 2, nome: 'Espada de Ferro', descricao: 'Lâmina confiável para iniciantes.', preco: 120, estoque: 30, raridade: 'comum' },
            { id: 3, nome: 'Arco Élfico', descricao: 'Disparos rápidos e precisos.', preco: 380, estoque: 12, raridade: 'raro' },
            { id: 4, nome: 'Armadura de Dragão', descricao: 'Forjada com escamas de dragão ancião.', preco: 1500, estoque: 5, raridade: 'epico' },
            { id: 5, nome: 'Coroa do Rei Caído', descricao: 'Dizem que só existe uma.', preco: 9999, estoque: 1, raridade: 'lendario' },
        ],
        inventario: [{ usuario_id: 2, item_id: 1, quantidade: 3 }],
        proximoId: { usuario: 3, item: 6 },
    };
}
function carregar() {
    try {
        const bruto = localStorage.getItem(CHAVE_DB);
        if (bruto)
            return JSON.parse(bruto);
    }
    catch { /* ignora */ }
    const db = bancoInicial();
    salvar(db);
    return db;
}
function salvar(db) {
    try {
        localStorage.setItem(CHAVE_DB, JSON.stringify(db));
    }
    catch { /* ignora */ }
}
const ok = (dados) => ({ sucesso: true, dados });
const falha = (erro) => ({ sucesso: false, erro });
const semSenha = ({ senha: _s, ...u }) => u;
export async function mockRequisicao(metodo, rota, corpo, query) {
    await new Promise((r) => setTimeout(r, 200)); // simula a rede
    const db = carregar();
    let m;
    // ---------- Autenticação ----------
    if (metodo === 'POST' && rota === '/auth/login') {
        const u = db.usuarios.find((x) => (x.email === corpo.usuario || x.nome === corpo.usuario) && x.senha === corpo.senha);
        return u ? ok(semSenha(u)) : falha('Usuário ou senha inválidos.');
    }
    if (metodo === 'POST' && rota === '/auth/cadastro') {
        if (!corpo.nome || !corpo.email || !corpo.senha)
            return falha('Preencha todos os campos.');
        if (db.usuarios.some((x) => x.email === corpo.email))
            return falha('E-mail já cadastrado.');
        const novo = {
            id: db.proximoId.usuario++, nome: corpo.nome, email: corpo.email, senha: corpo.senha,
            perfil: 'jogador', moedas: 500,
        };
        db.usuarios.push(novo);
        salvar(db);
        return ok(semSenha(novo));
    }
    if (metodo === 'POST' && rota === '/auth/logout')
        return ok(null);
    // ---------- Usuário ----------
    if (metodo === 'GET' && (m = rota.match(/^\/usuarios\/(\d+)$/))) {
        const u = db.usuarios.find((x) => x.id === Number(m[1]));
        return u ? ok(semSenha(u)) : falha('Usuário não encontrado.');
    }
    // ---------- Itens (CRUD) ----------
    if (metodo === 'GET' && rota === '/itens')
        return ok(db.itens);
    if (metodo === 'POST' && rota === '/itens') {
        const item = { id: db.proximoId.item++, ...corpo };
        db.itens.push(item);
        salvar(db);
        return ok(item);
    }
    if ((m = rota.match(/^\/itens\/(\d+)$/))) {
        const id = Number(m[1]);
        const idx = db.itens.findIndex((x) => x.id === id);
        if (idx < 0)
            return falha('Item não encontrado.');
        if (metodo === 'PUT') {
            db.itens[idx] = { ...db.itens[idx], ...corpo, id };
            salvar(db);
            return ok(db.itens[idx]);
        }
        if (metodo === 'DELETE') {
            db.itens.splice(idx, 1);
            db.inventario = db.inventario.filter((x) => x.item_id !== id);
            salvar(db);
            return ok(null);
        }
    }
    // ---------- Loja ----------
    if (metodo === 'POST' && rota === '/loja/comprar') {
        const u = db.usuarios.find((x) => x.id === Number(corpo.usuario_id));
        const item = db.itens.find((x) => x.id === Number(corpo.item_id));
        if (!u || !item)
            return falha('Usuário ou item não encontrado.');
        const qtd = Number(corpo.quantidade);
        const total = Number(corpo.total); // confia no total calculado pelo front
        if (u.moedas < total)
            return falha('Moedas insuficientes.');
        if (item.estoque < qtd)
            return falha('Estoque insuficiente.');
        u.moedas -= total;
        item.estoque -= qtd;
        const inv = db.inventario.find((x) => x.usuario_id === u.id && x.item_id === item.id);
        if (inv)
            inv.quantidade += qtd;
        else
            db.inventario.push({ usuario_id: u.id, item_id: item.id, quantidade: qtd });
        salvar(db);
        return ok({ moedas: u.moedas });
    }
    if (metodo === 'GET' && rota === '/inventario') {
        const uid = Number(query?.usuario_id);
        const lista = db.inventario
            .filter((x) => x.usuario_id === uid)
            .map((x) => {
            const item = db.itens.find((i) => i.id === x.item_id);
            return { item_id: x.item_id, nome: item.nome, raridade: item.raridade, quantidade: x.quantidade };
        });
        return ok(lista);
    }
    return falha(`Rota não encontrada: ${metodo} ${rota}`);
}
// Atalho para o console do navegador: resetarMockDb()
window.resetarMockDb = () => {
    localStorage.removeItem(CHAVE_DB);
    console.info('Banco mock resetado. Recarregue a página.');
};
