// Script para interações e leitura de status da autenticação

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const alertContainer = document.getElementById('alert-container');

    if (!alertContainer) return;

    // Se o controller redirecionar com erro (?erro=invalido ou ?erro=vazio)
    if (params.has('erro')) {
        const tipoErro = params.get('erro');
        let mensagem = 'Credenciais inválidas. Tente novamente.';

        if (tipoErro === 'vazio') {
            mensagem = 'Por favor, preencha todos os campos.';
        } else if (tipoErro === 'sql') {
            mensagem = 'Erro de banco de dados identificado.';
        }

        alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show rounded-3" role="alert">
                <strong>Acesso negado:</strong> ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }

    // Se redirecionar com sucesso (?sucesso=1)
    if (params.has('sucesso')) {
        alertContainer.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show rounded-3" role="alert">
                <strong>Sucesso:</strong> Operação realizada com sucesso!
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
});
