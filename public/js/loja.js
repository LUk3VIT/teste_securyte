// Painel da loja (public/loja.html): loja, inventário e administração de itens.
import { api } from './api.js';
import { MODO_MOCK } from './config.js';
import { limparUsuario, obterUsuario, salvarUsuario } from './sessao.js';
import { $, aviso, carregando, formatarMoedas, mensagemErro } from './ui.js';
const ROTULO_RARIDADE = {
    comum: 'Comum', raro: 'Raro', epico: 'Épico', lendario: 'Lendário',
};
let usuario;
let itens = [];
// ===================================================================
// Inicialização
// ===================================================================
const salvo = obterUsuario();
if (!salvo) {
    location.href = 'index.html';
}
else {
    usuario = salvo;
    iniciar();
}
async function iniciar() {
    if (MODO_MOCK)
        $('#aviso-mock').hidden = false;
    // [v0-INSEGURO] A aba de admin só é ESCONDIDA no front, com base no
    // perfil salvo no localStorage. As rotas de admin continuam abertas.
    $('#aba-admin').hidden = usuario.perfil !== 'admin';
    configurarAbas();
    configurarFormItem();
    $('#btn-sair').addEventListener('click', sair);
    // Atualiza os dados do usuário a partir do servidor (saldo pode ter mudado).
    // [v0-INSEGURO] O id vem do localStorage: troque e veja os dados de outro jogador.
    try {
        usuario = await api.buscarUsuario(usuario.id);
        salvarUsuario(usuario);
    }
    catch (e) {
        aviso(`Não foi possível atualizar o usuário: ${mensagemErro(e)}`, 'erro');
    }
    renderizarCabecalho();
    await carregarItens();
}
function renderizarCabecalho() {
    $('#nome-usuario').textContent = usuario.nome;
    $('#perfil-usuario').textContent = usuario.perfil === 'admin' ? 'Admin' : 'Jogador';
    $('#perfil-usuario').className = `selo selo-${usuario.perfil}`;
    $('#saldo').textContent = formatarMoedas(usuario.moedas);
}
async function sair() {
    try {
        await api.logout();
    }
    catch { /* segue mesmo assim */ }
    limparUsuario();
    location.href = 'index.html';
}
// ===================================================================
// Abas
// ===================================================================
function configurarAbas() {
    const abas = document.querySelectorAll('.aba');
    abas.forEach((aba) => {
        aba.addEventListener('click', () => {
            abas.forEach((a) => a.classList.toggle('ativa', a === aba));
            document.querySelectorAll('.painel').forEach((p) => {
                p.hidden = p.id !== aba.dataset.alvo;
            });
            if (aba.dataset.alvo === 'painel-inventario')
                carregarInventario();
            if (aba.dataset.alvo === 'painel-admin')
                renderizarTabelaAdmin();
        });
    });
}
// ===================================================================
// Loja
// ===================================================================
async function carregarItens() {
    const grade = $('#grade-itens');
    grade.innerHTML = '<p class="vazio">Carregando itens…</p>';
    try {
        itens = await api.listarItens();
        renderizarLoja();
        renderizarTabelaAdmin();
    }
    catch (e) {
        grade.innerHTML = '<p class="vazio">Não foi possível carregar a loja.</p>';
        aviso(mensagemErro(e), 'erro');
    }
}
function renderizarLoja() {
    const grade = $('#grade-itens');
    if (itens.length === 0) {
        grade.innerHTML = '<p class="vazio">A loja está vazia.</p>';
        return;
    }
    // [v0-INSEGURO] innerHTML com dados vindos do servidor (nome, descrição).
    // Se um item tiver HTML/JS no nome, ele será executado → XSS armazenado.
    grade.innerHTML = itens.map((item) => `
    <article class="carta raridade-${item.raridade}">
      <header>
        <span class="raridade">${ROTULO_RARIDADE[item.raridade] ?? item.raridade}</span>
        <span class="estoque">${item.estoque > 0 ? `${item.estoque} em estoque` : 'Esgotado'}</span>
      </header>
      <h3>${item.nome}</h3>
      <p class="descricao">${item.descricao}</p>
      <div class="preco">${formatarMoedas(item.preco)}</div>
      <form class="form-compra" data-id="${item.id}">
        <input type="number" name="quantidade" value="1" min="1" max="${item.estoque}"
               aria-label="Quantidade" ${item.estoque === 0 ? 'disabled' : ''}>
        <button type="submit" class="botao botao-primario" ${item.estoque === 0 ? 'disabled' : ''}>
          Comprar
        </button>
      </form>
    </article>
  `).join('');
    grade.querySelectorAll('.form-compra').forEach((form) => {
        form.addEventListener('submit', (ev) => {
            ev.preventDefault();
            comprar(form);
        });
    });
}
async function comprar(form) {
    const item = itens.find((i) => i.id === Number(form.dataset.id));
    if (!item)
        return;
    const quantidade = Number(new FormData(form).get('quantidade'));
    // [v0-INSEGURO] Regra de negócio no front: o preço e o total são
    // calculados aqui e enviados ao servidor, junto com o id do usuário.
    const total = item.preco * quantidade;
    if (total > usuario.moedas) {
        aviso('Moedas insuficientes.', 'erro');
        return;
    }
    const botao = form.querySelector('button');
    carregando(botao, true);
    try {
        const resultado = await api.comprar({
            usuario_id: usuario.id,
            item_id: item.id,
            quantidade,
            preco_unitario: item.preco,
            total,
        });
        usuario.moedas = resultado.moedas;
        salvarUsuario(usuario);
        renderizarCabecalho();
        aviso(`Você comprou ${quantidade}× ${item.nome}!`, 'sucesso');
        await carregarItens();
    }
    catch (e) {
        aviso(mensagemErro(e), 'erro');
    }
    finally {
        carregando(botao, false);
    }
}
// ===================================================================
// Inventário
// ===================================================================
async function carregarInventario() {
    const lista = $('#lista-inventario');
    lista.innerHTML = '<p class="vazio">Carregando inventário…</p>';
    try {
        const inv = await api.inventario(usuario.id);
        if (inv.length === 0) {
            lista.innerHTML = '<p class="vazio">Seu inventário está vazio. Que tal visitar a loja?</p>';
            return;
        }
        lista.innerHTML = inv.map((i) => `
      <div class="linha-inventario raridade-${i.raridade}">
        <span class="ponto"></span>
        <span class="nome">${i.nome}</span>
        <span class="raridade">${ROTULO_RARIDADE[i.raridade] ?? i.raridade}</span>
        <span class="quantidade">× ${i.quantidade}</span>
      </div>
    `).join('');
    }
    catch (e) {
        lista.innerHTML = '<p class="vazio">Não foi possível carregar o inventário.</p>';
        aviso(mensagemErro(e), 'erro');
    }
}
// ===================================================================
// Administração de itens (CRUD)
// ===================================================================
function renderizarTabelaAdmin() {
    const corpo = $('#tabela-itens tbody');
    if (itens.length === 0) {
        corpo.innerHTML = '<tr><td colspan="6" class="vazio">Nenhum item cadastrado.</td></tr>';
        return;
    }
    corpo.innerHTML = itens.map((i) => `
    <tr>
      <td>${i.id}</td>
      <td>${i.nome}</td>
      <td><span class="etiqueta raridade-${i.raridade}">${ROTULO_RARIDADE[i.raridade] ?? i.raridade}</span></td>
      <td>${formatarMoedas(i.preco)}</td>
      <td>${i.estoque}</td>
      <td class="acoes">
        <button class="botao botao-pequeno" data-acao="editar" data-id="${i.id}">Editar</button>
        <button class="botao botao-pequeno botao-perigo" data-acao="excluir" data-id="${i.id}">Excluir</button>
      </td>
    </tr>
  `).join('');
    corpo.querySelectorAll('button[data-acao]').forEach((b) => {
        b.addEventListener('click', () => {
            const id = Number(b.dataset.id);
            if (b.dataset.acao === 'editar')
                preencherFormItem(id);
            else
                excluirItem(id, b);
        });
    });
}
function configurarFormItem() {
    const form = $('#form-item');
    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const d = new FormData(form);
        const id = Number(d.get('id')) || 0;
        const payload = {
            nome: String(d.get('nome')),
            descricao: String(d.get('descricao')),
            preco: Number(d.get('preco')),
            estoque: Number(d.get('estoque')),
            raridade: String(d.get('raridade')),
        };
        const botao = form.querySelector('button[type=submit]');
        carregando(botao, true);
        try {
            if (id) {
                await api.atualizarItem(id, payload);
                aviso('Item atualizado.', 'sucesso');
            }
            else {
                await api.criarItem(payload);
                aviso('Item criado.', 'sucesso');
            }
            limparFormItem();
            await carregarItens();
        }
        catch (e) {
            aviso(mensagemErro(e), 'erro');
        }
        finally {
            carregando(botao, false);
        }
    });
    $('#btn-cancelar-item').addEventListener('click', limparFormItem);
}
function preencherFormItem(id) {
    const item = itens.find((i) => i.id === id);
    if (!item)
        return;
    const form = $('#form-item');
    form.elements.namedItem('id').value = String(item.id);
    form.elements.namedItem('nome').value = item.nome;
    form.elements.namedItem('descricao').value = item.descricao;
    form.elements.namedItem('preco').value = String(item.preco);
    form.elements.namedItem('estoque').value = String(item.estoque);
    form.elements.namedItem('raridade').value = item.raridade;
    $('#titulo-form-item').textContent = `Editando item #${item.id}`;
    $('#btn-cancelar-item').hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function limparFormItem() {
    const form = $('#form-item');
    form.reset();
    form.elements.namedItem('id').value = '';
    $('#titulo-form-item').textContent = 'Novo item';
    $('#btn-cancelar-item').hidden = true;
}
async function excluirItem(id, botao) {
    // Confirmação em dois cliques, sem diálogo do navegador.
    if (botao.dataset.confirmar !== '1') {
        botao.dataset.confirmar = '1';
        botao.textContent = 'Confirmar?';
        setTimeout(() => {
            botao.dataset.confirmar = '';
            botao.textContent = 'Excluir';
        }, 3000);
        return;
    }
    carregando(botao, true);
    try {
        await api.excluirItem(id);
        aviso('Item excluído.', 'sucesso');
        await carregarItens();
    }
    catch (e) {
        aviso(mensagemErro(e), 'erro');
        carregando(botao, false);
    }
}
