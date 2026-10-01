# Contrato da API v0 — Loja do Aventureiro

Este documento é a **especificação do seu back-end**: o front-end (`public/`) já
chama exatamente estas rotas, com estes formatos. Sua missão é implementar cada uma
em PHP (MVC) para que o front funcione com `MODO_MOCK = false`.

> **v0 = zero segurança, de propósito.** Implemente do jeito mais direto possível.
> As fragilidades listadas no fim viram as branches de estudo.

---

## Convenções gerais

| Item | Valor |
|---|---|
| Base | definida em `public/ts/config.ts` → `API_BASE` (padrão: `/teste_securyte/api`) |
| Formato | JSON nos dois sentidos (`Content-Type: application/json`) |
| Corpo da requisição | o PHP **não** preenche `$_POST` com JSON. Pesquise como ler o corpo bruto da requisição e decodificar. |
| Métodos | `GET`, `POST`, `PUT`, `DELETE`. Pesquise como descobrir o método da requisição no PHP. |

### Envelope de resposta (todas as rotas)

Sucesso:
```json
{ "sucesso": true, "dados": <conteúdo da rota> }
```
Erro:
```json
{ "sucesso": false, "erro": "Mensagem legível para o usuário" }
```

O front mostra o texto de `erro` em um aviso. Use também o **código HTTP** adequado
(200, 201, 400, 401, 403, 404, 409, 500): ele vai importar nas próximas branches.

> Dica de debug: se o PHP devolver qualquer coisa que não seja JSON (um warning,
> um `var_dump`), o front mostra "Resposta inválida do servidor" e imprime o
> conteúdo bruto no **console do navegador** (F12).

### Objetos

**Usuario**
```json
{ "id": 2, "nome": "Jogador", "email": "jogador@loja.com", "perfil": "jogador", "moedas": 500 }
```
`perfil` ∈ `"jogador"`, `"admin"`. Usuário novo começa como `jogador` com 500 moedas.

**Item**
```json
{ "id": 1, "nome": "Poção de Vida", "descricao": "Recupera 50 de vida.", "preco": 25, "estoque": 100, "raridade": "comum" }
```
`raridade` ∈ `"comum"`, `"raro"`, `"epico"`, `"lendario"`.

**ItemInventario**
```json
{ "item_id": 1, "nome": "Poção de Vida", "raridade": "comum", "quantidade": 3 }
```

---

## Rotas

### Autenticação

#### `POST /auth/cadastro`
Corpo: `{ "nome": "...", "email": "...", "senha": "..." }`
Resposta: `Usuario` (o recém-criado). E-mail repetido → erro.

#### `POST /auth/login`
Corpo: `{ "usuario": "nome ou e-mail", "senha": "..." }`
Resposta: `Usuario`. Credenciais erradas → erro.

#### `POST /auth/logout`
Sem corpo. Resposta: `dados: null`.

### Usuário

#### `GET /usuarios/{id}`
Resposta: `Usuario`. O front chama ao abrir a loja para atualizar o saldo.

### Itens da loja (CRUD)

#### `GET /itens`
Resposta: `Item[]`.

#### `POST /itens`
Corpo: `{ "nome", "descricao", "preco", "estoque", "raridade" }`
Resposta: `Item` criado (com `id`).

#### `PUT /itens/{id}`
Corpo: igual ao POST. Resposta: `Item` atualizado.

#### `DELETE /itens/{id}`
Resposta: `dados: null`.

### Loja

#### `POST /loja/comprar`
Corpo:
```json
{ "usuario_id": 2, "item_id": 3, "quantidade": 2, "preco_unitario": 380, "total": 760 }
```
Efeito: desconta moedas do usuário, baixa o estoque e soma a quantidade no inventário.
Resposta: `{ "moedas": <saldo atualizado> }`.

#### `GET /inventario?usuario_id={id}`
Resposta: `ItemInventario[]`.

---

## Contas de teste (crie no seu banco)

| Usuário | Senha | Perfil | Moedas |
|---|---|---|---|
| admin@loja.com | admin123 | admin | 5000 |
| jogador@loja.com | 123456 | jogador | 500 |

---

## Pontos frágeis da v0 (não conserte ainda)

Estes pontos são **intencionais**. Na v0, implemente o back-end confiando no que o
front manda. Depois, ataque cada um com o Burp e corrija na branch correspondente.

1. O front envia `usuario_id`, `preco_unitario` e `total` na compra.
2. O inventário e o usuário são buscados por um `id` que vem do cliente.
3. O "login" do front fica no `localStorage` (inclusive `perfil` e `moedas`).
4. A aba de administração é apenas **escondida** para quem não é admin.
5. O front renderiza nome/descrição de itens com `innerHTML`.
6. Não há limite de tentativas de login nem token anti-CSRF.

> Regra de ouro das próximas versões: **o front-end não muda.** Toda a segurança
> tem que nascer no back-end e no banco, ignorando ou validando o que o cliente envia.
