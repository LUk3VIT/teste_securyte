// Tela de login e cadastro (public/index.html)

import { api } from './api.js';
import { MODO_MOCK } from './config.js';
import { obterUsuario, salvarUsuario } from './sessao.js';
import { $, aviso, carregando, mensagemErro } from './ui.js';

// Já "logado"? Vai direto para a loja.
if (obterUsuario()) location.href = 'loja.html';

if (MODO_MOCK) $('#aviso-mock').hidden = false;

// ---------- Abas Entrar / Criar conta ----------
const abas = document.querySelectorAll<HTMLButtonElement>('.aba-auth');
abas.forEach((aba) => {
  aba.addEventListener('click', () => {
    abas.forEach((a) => a.classList.toggle('ativa', a === aba));
    const alvo = aba.dataset.alvo;
    document.querySelectorAll<HTMLFormElement>('.form-auth').forEach((f) => {
      f.hidden = f.id !== alvo;
    });
  });
});

// ---------- Login ----------
const formLogin = $<HTMLFormElement>('#form-login');
formLogin.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const dados = new FormData(formLogin);
  const botao = formLogin.querySelector<HTMLButtonElement>('button[type=submit]')!;
  carregando(botao, true);
  try {
    const usuario = await api.login(String(dados.get('usuario')), String(dados.get('senha')));
    salvarUsuario(usuario);
    location.href = 'loja.html';
  } catch (e) {
    aviso(mensagemErro(e), 'erro');
  } finally {
    carregando(botao, false);
  }
});

// ---------- Cadastro ----------
const formCadastro = $<HTMLFormElement>('#form-cadastro');
formCadastro.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const dados = new FormData(formCadastro);
  const botao = formCadastro.querySelector<HTMLButtonElement>('button[type=submit]')!;
  carregando(botao, true);
  try {
    await api.cadastro(
      String(dados.get('nome')), String(dados.get('email')), String(dados.get('senha')),
    );
    aviso('Conta criada! Agora é só entrar.', 'sucesso');
    formCadastro.reset();
    document.querySelector<HTMLButtonElement>('.aba-auth[data-alvo="form-login"]')!.click();
  } catch (e) {
    aviso(mensagemErro(e), 'erro');
  } finally {
    carregando(botao, false);
  }
});
