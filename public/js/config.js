// ===================================================================
// CONFIGURAÇÃO DO FRONT-END
// ===================================================================
// true  → o front usa um "back-end falso" (mock.ts) salvo no navegador.
//         Serve para ver a loja funcionando antes do seu PHP existir.
// false → o front chama a sua API PHP de verdade.
// Depois de alterar, rode `npm run build` (ou edite também public/js/config.js).
export const MODO_MOCK = true;
// Endereço base da sua API PHP. Todas as rotas do contrato são somadas a ele.
//
// Com rotas "bonitas" (exige .htaccess / rewrite para o front controller):
//   '/teste_securyte/api'           → /teste_securyte/api/itens/3
//
// Sem rewrite, passando a rota por query string para o index.php:
//   '/teste_securyte/index.php?rota=' → /teste_securyte/index.php?rota=/itens/3
export const API_BASE = '/teste_securyte/api';
