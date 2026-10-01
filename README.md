# teste_securyte — Loja do Aventureiro

Laboratório de estudo de **segurança em back-end** com PHP (MVC), MySQL e Burp Suite.

- `public/`: front-end pronto (HTML, CSS, TypeScript). Não precisa ser alterado.
- `src/`: back-end PHP em MVC (a ser desenvolvido).
- `docs/contrato-api-v0.md`: especificação das rotas que o back-end precisa implementar.

## Como abrir

Com o Apache do XAMPP ligado: <http://localhost/teste_securyte/public/>

Enquanto o back-end não existe, o front roda em **modo mock** (dados simulados no
navegador). Contas: `admin@loja.com / admin123` e `jogador@loja.com / 123456`.

## Front-end (TypeScript)

O JavaScript compilado já está em `public/js/`, então não é preciso Node para usar.
Para alterar o TypeScript (`public/ts/`):

```bash
npm install
npm run build    # compila uma vez
npm run watch    # recompila a cada alteração
```

Para ligar o front na API real: em `public/ts/config.ts`, mude `MODO_MOCK` para
`false`, ajuste `API_BASE` e rode `npm run build`.

## Plano de branches

Cada branch parte da anterior, acumulando as proteções:

| Branch | Foco |
|---|---|
| `main` (tag `v0-inseguro`) | Loja funcional, zero segurança |
| `seg/01-banco` | Conexão, usuário MySQL com privilégio mínimo, constraints, transações |
| `seg/02-autenticacao` | Hash de senha, sessão no servidor, força bruta, enumeração |
| `seg/03-autorizacao` | IDOR, rotas de admin, mass assignment |
| `seg/04-injecao` | SQL Injection, validação de entrada |
| `seg/05-logica-negocio` | Preço/total no servidor, race condition, replay |
| `seg/06-navegador` | XSS, CSRF, cookies, headers |
| `seg/07-configuracao` | Erros, segredos, arquivos expostos, logs |
