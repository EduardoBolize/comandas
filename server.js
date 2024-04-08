import express from 'express';
const app = express();
const PORT = 3000;

// Middleware para parsing de JSON e URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let comandas = [];

const itensPadrao = [
    { nome: 'Strong Mint', preco: 5 },
    { nome: 'Pizza', preco: 20 },
    { nome: 'Hambúrguer', preco: 15 },
    { nome: 'Batata Frita', preco: 10 }
];

const pagamentoOptions = ['Dinheiro', 'PIX', 'Crédito', 'Débito']
    .map(metodo => `<option value="${metodo}">${metodo}</option>`).join('');

// Função para calcular o valor total de uma comanda
function calcularValorTotal(comanda) {
    return comanda.itens.reduce((total, item) => total + item.preco * item.quantidade, 0);
}

// Rota raiz - Página inicial com lista de comandas abertas e formulário para abrir nova comanda
app.get('/', (req, res) => {
    res.send(`
        <style>
            body {
                font-family: 'Roboto', sans-serif;
                text-align: center;
                background: #e0e0e0; /* Cor de fundo mais suave */
                color: #333; /* Texto escuro para melhor leitura */
                padding: 20px;
            }
            h1 {
                color: #4CAF50; /* Cor verde para títulos */
                margin-bottom: 20px;
            }
            .comandas-container {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
            }
            .comandas-col {
                flex: 1;
                text-align: left;
                background-color: #fff; /* Fundo branco para as colunas */
                border: 1px solid #ddd; /* Borda sutil */
                border-radius: 8px;
                padding: 20px;
                margin-right: 10px; /* Espaço entre as colunas */
                box-shadow: 0 2px 5px rgba(0,0,0,0.1); /* Sombra sutil */
            }
            .comandas-col:last-child {
                margin-right: 0;
            }
            .comandas-link, .comandas-form button {
                display: block;
                background-color: #4CAF50;
                color: white;
                padding: 12px 24px;
                margin-bottom: 10px;
                border-radius: 8px;
                text-decoration: none;
                border: none;
                cursor: pointer;
                transition: background-color 0.3s;
                text-align: center;
            }
            .comandas-link:hover, .comandas-form button:hover {
                background-color: #45a049; /* Verde mais escuro ao passar o mouse */
            }
            .comandas-link.fechada, .comandas-link.fechada:hover {
                background-color: #FF5733; /* Vermelho para comandas fechadas */
                background-color: #e74c3c; /* Vermelho mais claro ao passar o mouse */
            }
            .comandas-form {
                flex: 0 0 40%;
                text-align: left;
            }
            .comandas-form input[type="text"], .comandas-form select {
                width: 100%;
                padding: 8px;
                margin-bottom: 20px;
                border: 1px solid #ccc;
                border-radius: 4px;
            }
            .action-button {
                background-color: #4CAF50;
                color: white;
                padding: 5px 10px;
                border: none;
                border-radius: 4px;
                transition: background-color 0.3s;
            }
            .action-button:hover {
                background-color: #45a049;
            }
            .action-button.alterar {
                background-color: #dddd16; /* Amarelo para botões de alterar */
            }
            .action-button.excluir {
                background-color: #e31b1b; /* Vermelho para botões de excluir */
            }
            .modal {
                display: none; /* Escondido por padrão */
                position: fixed; /* Fica fixo na tela */
                z-index: 2; /* Sita-se sobre tudo, exceto o modal */
                left: 0;
                top: 0;
                width: 100%; /* Largura total */
                height: 100%; /* Altura total */
                background-color: rgba(0,0,0,0.5); /* Preto com opacidade para escurecer a tela */
                overflow: auto; /* Permite rolagem se necessário */
            }
        
            /* Conteúdo do Modal */
            .modal-content {
                position: relative;
                background-color: #ffffff;
                margin: 10% auto; /* 10% do topo e centralizado horizontalmente */
                padding: 20px;
                border: 1px solid #ccc;
                width: 50%; /* 50% da largura da tela */
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
                animation-name: animatetop;
                animation-duration: 0.4s
            }
        
            /* Adiciona animação */
            @keyframes animatetop {
                from {top: -300px; opacity: 0}
                to {top: 0; opacity: 1}
            }
        
            /* Botão para fechar o modal */
            .close {
                color: #aaaaaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                margin-right: -10px;
                margin-top: -10px;
            }
        
            .close:hover,
            .close:focus {
                color: #000;
                text-decoration: none;
                cursor: pointer;
            }
        
            /* Ajustes no botão */
            .modal-footer {
                padding: 12px 16px;
                text-align: right;
                border-top: 1px solid #e5e5e5;
            }
        
            .modal-footer button {
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
        
            .modal-footer button:hover {
                background-color: #45a049;
            }

            /* Media Queries para Responsividade */
            @media only screen and (max-width: 480px) {
                body {
                    padding: 10px; /* Reduzir o padding geral para mais espaço de tela */
                    font-size: 14px; /* Ajustar o tamanho da fonte geral para melhor legibilidade */
                }
        
                h1, .comandas-link, .comandas-form button, .action-button {
                    font-size: 16px; /* Tamanho da fonte maior para legibilidade */
                }
        
                .comandas-container {
                    flex-direction: column; /* Colunas em bloco, uma abaixo da outra */
                }
        
                .comandas-col, .comandas-form {
        width: 100%; /* Cada coluna usa 100% da largura da tela */
        margin-right: 0;
        margin-bottom: 10px; /* Adiciona margem abaixo */
        box-shadow: none; /* Remove sombra para teste */
    }

    .comandas-form button, .action-button {
        font-size: 16px; /* Aumento do tamanho da fonte para botões */
        padding: 12px 24px; /* Maior área de clique */
    }
        
                /* Estilos do modal ajustados para melhor visualização em smartphones */
                .modal-content {
                    width: 95%; /* Modal quase a largura total para aproveitar o espaço */
                    margin-top: 50px; /* Menos margem superior para que apareça mais centralizado */
                    padding: 15px; /* Padding interno reduzido */
                }
        
                .modal-footer {
                    padding: 10px; /* Padding reduzido no rodapé do modal */
                }
        
                .modal-footer button {
                    font-size: 14px; /* Ajuste no tamanho da fonte do botão no rodapé do modal */
                }
            }
        </style>
        <!-- O Modal -->
        <div id="myModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <p id="modalText">Some text in the Modal..</p>
            </div>
        </div>
        <h1>Comandas</h1>
        <div class="comandas-container">
        <div class="comandas-col">
            <h2>Comandas Abertas</h2>
            <ul>
                ${comandas
            .filter(comanda => comanda.status === 'aberta')
            .map(comanda => `
                        <li class="comanda-item">
                            <div class="comanda-info">
                                <a class="comandas-link" href="/comandas/${comanda.id}">${comanda.nomeCliente} - Valor Total: R$ ${calcularValorTotal(comanda)}</a>
                            </div>
                            <div class="comanda-actions">
                                <button class="action-button alterar" onclick="alterarComanda('${comanda.id}')">Alterar</button>
                                <button class="action-button excluir" onclick="excluirComanda('${comanda.id}')">Excluir</button>
                            </div>
                        </li>
                    `).join('')
                }
            </ul>
        </div>
            <div class="comandas-form">
                <h2>Abrir Nova Comanda</h2>
                <form action="/comandas" method="post">
                    <label for="nomeCliente">Nome do Cliente:</label>
                    <input type="text" id="nomeCliente" name="nomeCliente" required>
                    <button type="submit">Abrir Comanda</button>
                </form>
                <form action="/exportar" method="get">
                    <button id="exportBtn">Exportar Dados</button>
                </form>
            </div>
            <div class="comandas-col">
                <h2>Comandas Fechadas</h2>
                <ul>
                    ${comandas
            .filter(comanda => comanda.status === 'fechada')
            .map(comanda => `
                            <li>
                                <a class="comandas-link fechada" href="/comandas/${comanda.id}">${comanda.nomeCliente} - Fechada - Valor Total: R$ ${calcularValorTotal(comanda)}</a>
                                <button onclick="alterarComanda('${comanda.id}')">Alterar</button>
                                <button onclick="excluirComanda('${comanda.id}')">Excluir</button>
                            </li>
                        `).join('')
        }
                </ul>
            </div>
        </div>
        <script>
            // Pega o modal
            var modal = document.getElementById('myModal');

            // Pega o elemento <span> que fecha o modal
            var span = document.getElementsByClassName("close")[0];

            // Quando o usuário clica no <span> (x), fecha o modal
            span.onclick = function() {
                modal.style.display = "none";
            }

            // Quando o usuário clica em qualquer lugar fora do modal, fecha-o
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }

            // Função para abrir o modal com uma mensagem
            function showModal(message) {
                document.getElementById('modalText').textContent = message;
                modal.style.display = "block";
            }

            document.getElementById('exportBtn').addEventListener('click', function(event) {
                event.preventDefault(); // Impede o comportamento padrão do formulário

                fetch('/exportar')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showModal(data.message); // Exibe o modal com a mensagem de sucesso
                        } else {
                            showModal("Falha ao exportar os dados."); // Exibe o modal com a mensagem de falha
                        }
                    })
                    .catch(error => {
                        showModal("Erro ao exportar: " + error.message); // Exibe o modal com a mensagem de erro
                    });
            });

            // Função para alterar uma comanda
            function alterarComanda(idComanda) {
                // Novo nome que será solicitado ao usuário
                const novoNome = prompt('Digite o novo nome da comanda:');
                if (novoNome !== null && novoNome.trim() !== '') {
                    // Enviar uma requisição PUT para a rota de alterar comanda, passando o ID da comanda e o novo nome
                    fetch('/comandas/' + idComanda + '/nome', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ novoNome })
                    })
                    .then(response => {
                        if (response.ok) {
                            // Se a resposta for bem-sucedida, recarregar a página para exibir o novo nome
                            window.location.reload();
                        } else {
                            console.error('Erro ao alterar o nome da comanda:', response.status);
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao alterar o nome da comanda:', error);
                    });
                }
            }

            // Função para excluir uma comanda com confirmação
            function excluirComanda(idComanda) {
                // Exibir uma mensagem de confirmação ao usuário
                const confirmacao = confirm('Tem certeza que deseja excluir esta comanda?');
                if (confirmacao) {
                    // Enviar uma requisição DELETE para a rota de exclusão de comanda
                    fetch('/excluir-comanda/' + idComanda, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (response.ok) {
                            // Atualizar a página após a exclusão da comanda
                            window.location.reload();
                        } else {
                            console.error('Erro ao excluir a comanda:', response.status);
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao excluir a comanda:', error);
                    });
                }
            }
        </script>
    `);
});

// Rota para criar uma nova comanda
app.post('/comandas', (req, res) => {
    const { nomeCliente } = req.body;
    const novaComanda = {
        id: Date.now().toString(),
        nomeCliente,
        status: 'aberta',
        itens: [],
        valorTotal: 0,
        metodoPagamento: '',
        data: new Date()
    };
    comandas.push(novaComanda);
    res.redirect('/');
});

app.get('/comandas/:idComanda/rachar', (req, res) => {
    const { idComanda } = req.params;
    const comanda = comandas.find(comanda => comanda.id === idComanda);
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }

    // Calcular o valor total da conta e o valor já pago
    const valorTotal = calcularValorTotal(comanda);
    const valorPago = comanda.pagamentos ? comanda.pagamentos.reduce((total, pagamento) => total + pagamento.valor, 0) : 0;

    // Verificar se o valor total da conta já foi totalmente pago
    if (valorPago >= valorTotal) {
        return res.send('Conta já foi totalmente paga');
    }

    // Calcular o valor restante a ser pago
    const valorRestante = valorTotal - valorPago;

    // Renderizar o formulário para pagar o valor restante
    res.send(`
        <style>
            body {
                font-family: 'Roboto', sans-serif;
                text-align: center;
                background: #e0e0e0; /* Cor de fundo mais suave */
                color: #333; /* Texto escuro para melhor leitura */
                padding: 20px;
            }
            h1 {
                color: #4CAF50; /* Cor verde para títulos */
                margin-bottom: 20px;
            }
            p {
                font-size: 16px;
                color: #555; /* Texto mais escuro para contraste */
            }
            form {
                background: #ffffff; /* Fundo branco para o formulário */
                padding: 20px;
                border-radius: 8px;
                display: inline-block;
                border: 1px solid #ccc;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                margin-top: 20px;
            }
            label {
                display: block;
                margin-bottom: 10px;
                font-weight: bold;
            }
            input[type="number"], select {
                width: 100%;
                padding: 8px;
                margin-bottom: 20px;
                border: 1px solid #ccc;
                border-radius: 4px;
            }
            button {
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s;
                width: 100%;
            }
            button:hover {
                background-color: #45a049;
            }
        </style>
        <h1>Rachar Conta</h1>
        <p>Total da conta: R$ ${valorTotal.toFixed(2)}</p>
        <p>Valor já pago: R$ ${valorPago.toFixed(2)}</p>
        <p>Valor restante: R$ ${valorRestante.toFixed(2)}</p>
        <form action="/comandas/${idComanda}/pagar" method="post">
            <label for="valorPagar">Valor a Pagar:</label>
            <input type="number" name="valorPagar" id="valorPagar" min="0.01" max="${valorRestante.toFixed(2)}" step="0.01" required>
            <label for="metodoPagamento">Forma de Pagamento:</label>
            <select name="metodoPagamento" id="metodoPagamento">
                ${pagamentoOptions}
            </select>
            <button type="submit">Pagar</button>
        </form>
    `);
});

app.post('/comandas/:idComanda/pagar', (req, res) => {
    const { idComanda } = req.params;
    const { valorPagar, metodoPagamento } = req.body;
    const comanda = comandas.find(comanda => comanda.id === idComanda);

    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }

    const valorPagarFloat = parseFloat(valorPagar);
    if (isNaN(valorPagarFloat) || valorPagarFloat <= 0) {
        return res.status(400).send('Valor a pagar inválido');
    }

    if (!comanda.pagamentos) {
        comanda.pagamentos = [];
    }

    comanda.pagamentos.push({
        valor: valorPagarFloat,
        metodo: metodoPagamento
    });

    // Redirecionar para a página de rachar conta ou para a página inicial dependendo do saldo restante
    const valorRestante = calcularValorRestante(comanda);
    if (valorRestante > 0) {
        res.redirect(`/comandas/${idComanda}/rachar`);
    } else {
        comanda.status = 'fechada';
        res.redirect('/');
    }
});

// Função para calcular o valor restante na comanda
function calcularValorRestante(comanda) {
    const valorTotal = calcularValorTotal(comanda);
    const totalPago = comanda.pagamentos ? comanda.pagamentos.reduce((total, pagamento) => total + pagamento.valor, 0) : 0;
    return valorTotal - totalPago;
}

// Rota para visualizar o formulário de alteração de um item da comanda
app.get('/comandas/:idComanda/itens/:idItem/editar', (req, res) => {
    const { idComanda, idItem } = req.params;
    const comanda = comandas.find(comanda => comanda.id === idComanda);
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }
    const item = comanda.itens.find(item => item.id === idItem);
    if (!item) {
        return res.status(404).send('Item não encontrado na comanda');
    }
    const options = itensPadrao.map(item => `<option value="${item.nome}" ${item.nome === 'Outro' ? 'disabled' : ''}>${item.nome}</option>`).join('');
    res.send(`
        <h2>Alterar Item</h2>
        <form action="/comandas/${idComanda}/itens/${idItem}/atualizar" method="post">
            <select name="nomeItem">
                ${options}
            </select>
            <input type="number" name="preco" value="${item.preco}" placeholder="Preço">
            <button type="submit">Salvar Alterações</button>
        </form>
    `);
});

// Rota para atualizar um item da comanda
app.post('/comandas/:idComanda/itens/:idItem/atualizar', (req, res) => {
    const { idComanda, idItem } = req.params;
    const { nomeItem, preco } = req.body;
    const comanda = comandas.find(comanda => comanda.id === idComanda);
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }
    const item = comanda.itens.find(item => item.id === idItem);
    if (!item) {
        return res.status(404).send('Item não encontrado na comanda');
    }
    item.nome = nomeItem;
    item.preco = parseFloat(preco);
    res.redirect(`/comandas/${idComanda}`);
});


// Rota para exibir uma comanda e opções para rachar a conta
app.get('/comandas/:idComanda', (req, res) => {
    const { idComanda } = req.params;
    const comanda = comandas.find(comanda => comanda.id === idComanda);
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }

    let options = itensPadrao.map(item => `<option value="${item.nome}" data-preco="${item.preco}">${item.nome} - R$ ${item.preco}</option>`).join('');
    options += `<option value="Outro" data-preco="">Outro</option>`;

    const pagamentoOptions = ['Dinheiro', 'PIX', 'Crédito', 'Débito'].map(metodo => `<option value="${metodo}">${metodo}</option>`).join('');

    res.send(`
        <style>
            body { font-family: 'Roboto', sans-serif; text-align: center; background: #e0e0e0; color: #333; padding: 20px; }
            h1, h2 { color: #4CAF50; margin-bottom: 20px; }
            ul { list-style-type: none; padding: 0; }
            li { margin-bottom: 5px; font-size: 16px; display: flex; align-items: center; justify-content: space-between; }
            .container { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; padding: 20px; }
            .coluna, .coluna-center { flex: 1; min-width: 300px; margin: 0 10px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ccc; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .comanda-link, button, input[type="submit"] { background-color: #4CAF50; color: white; padding: 12px 24px; margin: 10px; border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.3s; text-decoration: none; display: inline-block; width: auto; }
            .comanda-link:hover, button:hover, input[type="submit"]:hover { background-color: #45a049; }
            form { display: flex; flex-direction: column; align-items: center; margin-top: 10px; }
            label { display: block; margin-bottom: 5px; }
            select, input[type="number"], input[type="text"] { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; }
            input[type="number"] { width: auto; }
            .quantity-btn {
                border: none;
                background: none;
                cursor: pointer;
                color: #4CAF50; /* Cor verde para combinar com o tema */
            }
            .quantity-btn:hover {
                color: #45a049;
            }
        </style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <h1>Comanda de ${comanda.nomeCliente}${comanda.status === 'fechada' ? ' - Fechada' : ''}</h1>
        <div class="container">
            <div class="coluna">
                <h2>Itens</h2>
                <ul>
                    ${comanda.itens.map(item => `
                        <li>
                            ${item.nome} (<span id="quantity-${item.id}">${item.quantidade}</span>x) - R$ ${item.preco * item.quantidade}
                            <div>
                                <button class="quantity-btn" onclick="updateItemQuantity('${idComanda}', '${item.id}', 1)"><i class="fas fa-plus"></i></button>
                                <button class="quantity-btn" onclick="updateItemQuantity('${idComanda}', '${item.id}', -1)"><i class="fas fa-minus"></i></button>
                                <button class="remover-item" data-comanda-id="${idComanda}" data-item-id="${item.id}">Remover</button>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="coluna-center">
                <h2>Adicionar Item</h2>
                <form action="/comandas/${idComanda}/itens" method="post">
                    <select name="nomeItem" id="nomeItem" onchange="mostrarCampos(this)">
                        ${options}
                    </select>
                    <input type="text" name="novoNomeItem" id="novoNomeItem" placeholder="Nome do item" style="display:none;">
                    <input type="number" name="quantidade" id="quantidade" value="1" min="1">
                    <input type="number" name="preco" id="preco" placeholder="Preço" style="display:none;">
                    <button type="submit">Adicionar Item</button>
                </form>
            </div>
            <div class="coluna">
                <h2>Pagar Conta</h2>
                <form action="/comandas/${idComanda}/fechar" method="post">
                    <label for="valorPagar">Valor Total a Pagar: R$ ${calcularValorTotal(comanda).toFixed(2)}</label>
                    <input type="number" name="valorPagar" id="valorPagar" value="${calcularValorTotal(comanda).toFixed(2)}" min="0.01" step="0.01" readonly>
                    <label for="metodoPagamento">Forma de Pagamento:</label>
                    <select name="metodoPagamento" id="metodoPagamento">
                        ${pagamentoOptions}
                    </select>
                    <button type="submit">Pagar</button>
                </form>
                ${comanda.status === 'fechada' ? `<form action="/comandas/${idComanda}/reabrir" method="post">
                    <button type="submit">Reabrir Comanda</button>
                </form>` : ''}
                <form action="/comandas/${idComanda}/rachar" method="get">
                    <button type="submit">Pagar em Mais de uma Forma</button>
                </form>
            </div>
        </div>
        <br>
        <a href="/" class="comanda-link">Voltar para lista de comandas</a>
        <script>
            function updateItemQuantity(comandaId, itemId, increment) {
                const quantityDisplay = document.getElementById('quantity-' + itemId);
                let newQuantity = parseInt(quantityDisplay.textContent) + increment; // Usando textContent para pegar apenas o texto
        
                if (newQuantity < 1) {
                    // Confirmação para excluir o item se a quantidade for reduzida a zero
                    if (confirm('Tem certeza que deseja remover este item?')) {
                        removeItem(comandaId, itemId);
                    } else {
                        // Se o usuário cancelar, não fazer nada
                        return;
                    }
                } else {
                    // Atualizar a quantidade na interface do usuário imediatamente
                    quantityDisplay.textContent = newQuantity; // Atualiza apenas o número, sem adicionar 'x'
        
                    // Enviar a atualização para o servidor
                    fetch('/comandas/' + comandaId + '/itens/' + itemId + '/updateQuantity', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ newQuantity })
                    }).then(response => {
                        if (!response.ok) {
                            console.error('Erro ao atualizar quantidade:', response.statusText);
                            throw new Error('Falha ao atualizar a quantidade do item.');
                        }
                        location.reload(); // Recarregar a página para refletir a mudança
                    }).catch(error => {
                        alert('Erro ao atualizar a quantidade do item: ' + error.message);
                    });
                }
            }
        
            function removeItem(comandaId, itemId) {
                fetch('/comandas/' + comandaId + '/itens/' + itemId, {
                    method: 'DELETE'
                }).then(response => {
                    if (!response.ok) {
                        console.error('Erro ao remover item:', response.statusText);
                        throw new Error('Falha ao remover o item.');
                    }
                    location.reload(); // Recarregar a página após remover o item
                }).catch(error => {
                    alert('Erro ao remover o item: ' + error.message);
                });
            }

            document.querySelectorAll('.remover-item').forEach(button => {
                button.addEventListener('click', () => {
                    const comandaId = button.getAttribute('data-comanda-id');
                    const itemId = button.getAttribute('data-item-id');
                    fetch('/comandas/' + comandaId + '/itens/' + itemId, {
                        method: 'DELETE'
                    }).then(response => {
                        if (response.ok) {
                            location.reload();
                        }
                    });
                });
            });

            function mostrarCampos(select) {
                const novoNomeItemInput = document.getElementById('novoNomeItem');
                const precoInput = document.getElementById('preco');
                novoNomeItemInput.style.display = select.value === 'Outro' ? 'inline-block' : 'none';
                precoInput.style.display = select.value === 'Outro' ? 'inline-block' : 'none';
                if (select.value !== 'Outro') {
                    document.getElementById('novoNomeItem').value = select.value;
                }
            }
        </script>
    `);
});

app.post('/comandas/:idComanda/itens/:idItem/updateQuantity', (req, res) => {
    const { idComanda, idItem } = req.params;
    const { newQuantity } = req.body;

    let comanda = comandas.find(com => com.id === idComanda);
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }

    let item = comanda.itens.find(it => it.id === idItem);
    if (!item) {
        return res.status(404).send('Item não encontrado');
    }

    if (newQuantity < 1) {
        const itemIndex = comanda.itens.findIndex(it => it.id === idItem);
        comanda.itens.splice(itemIndex, 1); // Remover item se a quantidade for zero
    } else {
        item.quantidade = newQuantity; // Atualizar quantidade
    }

    res.status(200).send('Quantidade atualizada');
});

app.post('/comandas/:idComanda/rachar', (req, res) => {
    const { idComanda } = req.params;
    const comanda = comandas.find(comanda => comanda.id === idComanda);
    if (!comanda || comanda.status !== 'fechada') {
        return res.status(404).send('Comanda não encontrada ou não está fechada');
    }

    const valorTotalComanda = calcularValorTotal(comanda);
    const pagamentoOptions = ['Dinheiro', 'PIX', 'Crédito', 'Débito'].map(metodo => `<option value="${metodo}">${metodo}</option>`).join('');

    res.send(`
        <h1>Rachar Conta</h1>
        <<p>A conta da comanda ${idComanda} tem um total de R$ ${valorTotalComanda.toFixed(2)}.</p>
        <form action="/comandas/${idComanda}/pagar" method="post">
            <div id="pagamentos-container">
                <div class="pagamento">
                    <label for="valor1">Valor:</label>
                    <input type="number" name="valor1" id="valor1" min="0.01" step="0.01" max="${valorTotalComanda.toFixed(2)}" required>
                    <label for="metodoPagamento1">Método de Pagamento:</label>
                    <select name="metodoPagamento1" id="metodoPagamento1">
                        ${pagamentoOptions}
                    </select>
                </div>
            </div>
            <button type="button" id="adicionar-pagamento">Pagar em mais de uma forma</button>
            <button type="submit">Pagar</button>
        </form>
        <form action="/comandas/${idComanda}/rachar" method="post">
            <button type="submit">Rachar Conta</button>
        </form>
        <script>
            document.getElementById('adicionar-pagamento').addEventListener('click', () => {
                const pagamentosContainer = document.getElementById('pagamentos-container');
                const numPagamentos = pagamentosContainer.children.length;
                const novoPagamento = document.createElement('div');
                novoPagamento.classList.add('pagamento');
                novoPagamento.innerHTML = '
                    <label for="valor${numPagamentos + 1}">Valor:</label>
                    <input type="number" name="valor${numPagamentos + 1}" id="valor${numPagamentos + 1}" min="0.01" step="0.01" max="${(valorTotalComanda - somaValoresPagos()).toFixed(2)}" required>
                    <label for="metodoPagamento${numPagamentos + 1}">Método de Pagamento:</label>
                    <select name="metodoPagamento${numPagamentos + 1}" id="metodoPagamento${numPagamentos + 1}">
                        ${pagamentoOptions}
                    </select>
                ';
                pagamentosContainer.appendChild(novoPagamento);
            });

            function somaValoresPagos() {
                let soma = 0;
                document.querySelectorAll('[name^="valor"]').forEach(input => {
                    soma += parseFloat(input.value);
                });
                return soma;
            }
        </script>
    `);
});

app.post('/comandas/:idComanda/pagar', (req, res) => {
    const { idComanda } = req.params;
    const { valorPagar, metodoPagamento } = req.body;
    const comanda = comandas.find(comanda => comanda.id === idComanda);

    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }

    const valorPagarFloat = parseFloat(valorPagar);
    const valorRestante = calcularValorRestante(comanda);

    if (isNaN(valorPagarFloat) || valorPagarFloat <= 0) {
        return res.status(400).send('Valor a pagar inválido');
    }

    if (valorPagarFloat > valorRestante) {
        return res.status(400).send('Valor a pagar excede o valor restante na comanda');
    }

    if (!comanda.pagamentos) {
        comanda.pagamentos = [];
    }

    comanda.pagamentos.push({
        valor: valorPagarFloat,
        metodo: metodoPagamento
    });

    // Verifica se o total pago agora é igual ou maior que o valor total da comanda
    if (calcularValorRestante(comanda) <= 0) {
        comanda.status = 'fechada'; // Atualiza o status para fechada
    }

    res.redirect('/'); // Redireciona para a tela inicial
});

// Rota para reabrir uma comanda fechada
app.post('/comandas/:idComanda/reabrir', (req, res) => {
    const { idComanda } = req.params;
    const comanda = comandas.find(comanda => comanda.id === idComanda);
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }
    comanda.status = 'aberta';
    res.redirect(`/comandas/${idComanda}`);
});

// Rota para adicionar um item à comanda
app.post('/comandas/:idComanda/itens', (req, res) => {
    const { idComanda } = req.params;
    const { nomeItem, novoNomeItem, quantidade } = req.body;

    let nome = nomeItem;
    let itemPreco;

    // Verificando se o item é "Outro" e ajustando o nome
    if (nomeItem === 'Outro') {
        nome = novoNomeItem;
        itemPreco = req.body.preco ? parseFloat(req.body.preco) : null; // Convertendo o preço para um número de ponto flutuante, se fornecido
    } else {
        const itemSelecionado = itensPadrao.find(item => item.nome === nomeItem);
        if (!itemSelecionado) {
            return res.status(400).send('Item não encontrado');
        }
        itemPreco = itemSelecionado.preco;
    }

    // Verificando se a quantidade é um número válido
    const itemQuantidade = parseInt(quantidade);
    if (isNaN(itemQuantidade) || itemQuantidade <= 0) {
        return res.status(400).send('Quantidade inválida');
    }

    // Verificando se o preço é um número válido
    if (!itemPreco || isNaN(itemPreco) || itemPreco <= 0) {
        return res.status(400).send('Preço inválido');
    }

    // Encontrando a comanda correspondente pelo ID
    const comanda = comandas.find(comanda => comanda.id === idComanda);
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }

    // Criando um novo item
    const item = {
        id: Date.now().toString(),
        nome: nome,
        quantidade: itemQuantidade, // Usando a quantidade convertida
        preco: itemPreco, // Usando o preço convertido
        total: itemPreco * itemQuantidade // Calculando o valor total do item multiplicando o preço pela quantidade
    };

    // Adicionando o novo item à lista de itens da comanda
    comanda.itens.push(item);

    // Redirecionando de volta para a página da comanda
    res.redirect(`/comandas/${idComanda}`);
});

// Rota para fechar uma comanda
app.post('/comandas/:idComanda/fechar', (req, res) => {
    const { idComanda } = req.params;
    const { metodoPagamento } = req.body;
    const comanda = comandas.find(comanda => comanda.id === idComanda && comanda.status === 'aberta');
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada ou já fechada');
    }

    // Salva o valor total vendido e o método de pagamento
    comanda.status = 'fechada';
    comanda.metodoPagamento = metodoPagamento;
    const valorTotalVendido = comanda.valorTotal;

    // Redireciona o usuário de volta para a página inicial após fechar a comanda
    res.redirect('/'); // Redireciona para a página inicial

    // res.send(`Comanda fechada. Valor Total: R$ ${valorTotalVendido}. Método de Pagamento: ${metodoPagamento}`);
});


// Função para exportar as informações da comanda para um arquivo TXT
function exportarParaTxt(comanda) {
    const dataAtual = new Date();
    const dataFormatada = `${dataAtual.getDate()}-${dataAtual.getMonth() + 1}-${dataAtual.getFullYear()}`;
    const nomeArquivo = `comanda_${comanda.id}_${dataFormatada}.txt`;
    const diretorio = './registros';
    const caminhoArquivo = path.join(diretorio, nomeArquivo);

    if (!fs.existsSync(diretorio)) {
        fs.mkdirSync(diretorio);
    }

    let conteudo = `Comanda de ${comanda.nomeCliente}`;
    if (comanda.pagamentos && comanda.pagamentos.length > 1) {
        conteudo += ` - Rachada em ${comanda.pagamentos.length}x`;
    }
    conteudo += ` - Valor Total: R$ ${calcularValorTotal(comanda).toFixed(2)}\n`;
    conteudo += '----------------------------------------\n';

    fs.writeFileSync(caminhoArquivo, conteudo);
    return caminhoArquivo;
}

// Rota para exportar as comandas para um arquivo txt
app.get('/exportar-txt', (req, res) => {
    let caminhosArquivos = [];

    for (const comanda of comandas) {
        const caminhoArquivo = exportarParaTxt(comanda);
        caminhosArquivos.push(caminhoArquivo);
    }

    // Combine todos os arquivos em um único arquivo ZIP
    const zip = new AdmZip();
    for (const caminhoArquivo of caminhosArquivos) {
        zip.addLocalFile(caminhoArquivo);
    }
    const zipBuffer = zip.toBuffer();

    res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="comandas.zip"'
    }).send(zipBuffer);
});

// Rota para exportar as informações para um arquivo de texto
app.get('/exportar', (req, res) => {
    const data = new Date();
    const pasta = './registros';
    const arquivo = `registros_${data.getFullYear()}_${data.getMonth() + 1}_${data.getDate()}.txt`;
    const caminhoCompleto = `${pasta}/${arquivo}`;

    if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta);
    }

    let conteudo = '';
    let totalVendido = 0;
    let totalPorPagamento = { Dinheiro: 0, PIX: 0, Crédito: 0, Débito: 0 };

    // Adiciona informações de cada comanda ao conteúdo do arquivo
    comandas.forEach(comanda => {
        let valorTotalComanda = calcularValorTotal(comanda);
        conteudo += `Comanda de ${comanda.nomeCliente}`;
        if (comanda.pagamentos && comanda.pagamentos.length > 1) {
            conteudo += ` - Rachada em ${comanda.pagamentos.length}x`; // Adiciona a informação sobre a comanda ser rachada
        }
        conteudo += ` - Valor Total: R$ ${valorTotalComanda.toFixed(2)}\n`;
        comanda.itens.forEach(item => {
            conteudo += `${item.nome} (Quantidade: ${item.quantidade}) - R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
            totalVendido += item.preco * item.quantidade;

            // Adiciona o valor ao total por forma de pagamento
            if (comanda.pagamentos) {
                comanda.pagamentos.forEach(pagamento => {
                    totalPorPagamento[pagamento.metodo] = (totalPorPagamento[pagamento.metodo] || 0) + pagamento.valor;
                });
            }
        });
        conteudo += '\n';
    });

    // Adiciona o total vendido ao conteúdo do arquivo
    conteudo += `Total Vendido: R$ ${totalVendido.toFixed(2)}\n`;

    // Adiciona o total por forma de pagamento ao conteúdo do arquivo
    conteudo += `Total por Forma de Pagamento:\n`;
    Object.entries(totalPorPagamento).forEach(([metodo, valor]) => {
        conteudo += `${metodo}: R$ ${valor.toFixed(2)}\n`;
    });

    // Após salvar o arquivo, em vez de enviar o arquivo:
    res.json({ success: true, message: "Dados exportados com sucesso para 'caminho_do_arquivo.txt'" });
});

// Rota para alterar o nome de uma comanda
app.put('/comandas/:idComanda/nome', (req, res) => {
    const { idComanda } = req.params;
    const { novoNome } = req.body;
    const comanda = comandas.find(comanda => comanda.id === idComanda && comanda.status === 'aberta');
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada ou já fechada');
    }
    comanda.nomeCliente = novoNome;
    res.send('Nome da comanda alterado com sucesso');
});

// Rota para alterar o nome de um item em uma comanda
app.put('/comandas/:idComanda/itens/:idItem/nome', (req, res) => {
    const { idComanda, idItem } = req.params;
    const { novoNome } = req.body;
    const comanda = comandas.find(comanda => comanda.id === idComanda && comanda.status === 'aberta');
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada ou já fechada');
    }
    const item = comanda.itens.find(item => item.id === idItem);
    if (!item) {
        return res.status(404).send('Item não encontrado na comanda');
    }
    item.nome = novoNome;
    res.send('Nome do item alterado com sucesso');
});

// Rota para alterar o método de pagamento de uma comanda fechada
app.put('/comandas/:idComanda/metodo-pagamento', (req, res) => {
    const { idComanda } = req.params;
    const { novoMetodo } = req.body;
    const comanda = comandas.find(comanda => comanda.id === idComanda && comanda.status === 'fechada');
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada ou ainda aberta');
    }
    comanda.metodoPagamento = novoMetodo;
    res.send('Método de pagamento da comanda alterado com sucesso');
});

app.delete('/excluir-comanda/:idComanda', (req, res) => {
    const { idComanda } = req.params;

    // Aqui você precisa implementar a lógica para excluir a comanda com o ID fornecido
    // Por exemplo, você pode ter um array de comandas e remover a comanda com o ID correspondente
    // Vou fornecer um exemplo simplificado usando um array de comandas:

    const index = comandas.findIndex(comanda => comanda.id === idComanda);
    if (index !== -1) {
        // Remove a comanda do array
        comandas.splice(index, 1);
        res.sendStatus(204); // Envie uma resposta indicando que a comanda foi excluída com sucesso
    } else {
        res.status(404).send('Comanda não encontrada'); // Se a comanda não for encontrada, envie uma resposta 404
    }
});


// Função para definir a cor da comanda fechada de acordo com o método de pagamento
function definirCorComanda(comanda) {
    switch (comanda.metodoPagamento) {
        case 'Crédito':
            return 'azul';
        case 'Dinheiro':
            return 'verde';
        case 'Débito':
            return 'laranja';
        case 'PIX':
            return 'ciano';
        default:
            return 'cinza';
    }
}

// Rota para adicionar itens a uma comanda existente
app.post('/comandas/:idComanda/itens', (req, res) => {
    const { idComanda } = req.params;
    const { nomeItem, preco } = req.body;
    const comanda = comandas.find(comanda => comanda.id === idComanda);
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }
    comanda.itens.push({ nomeItem, preco: parseFloat(preco) });
    comanda.valorTotal += parseFloat(preco);
    res.redirect(`/comandas/${idComanda}`);
});


// Rota para adicionar um item à lista de itens cadastrados
app.post('/itens', (req, res) => {
    const { nome, preco } = req.body;
    const novoItem = {
        id: Date.now().toString(),
        nome,
        preco
    };
    // Aqui você pode adicionar validações adicionais, se necessário
    itens.push(novoItem);
    res.send('Item cadastrado com sucesso');
});

// Rota para atualizar um item na lista de itens cadastrados
app.put('/itens/:idItem', (req, res) => {
    const { idItem } = req.params;
    const { nome, preco } = req.body;
    const itemIndex = itens.findIndex(item => item.id === idItem);
    if (itemIndex === -1) {
        return res.status(404).send('Item não encontrado');
    }
    // Aqui você pode adicionar validações adicionais, se necessário
    itens[itemIndex].nome = nome;
    itens[itemIndex].preco = preco;
    res.send('Item atualizado com sucesso');
});

// Rota para remover um item da comanda
app.delete('/comandas/:idComanda/itens/:idItem', (req, res) => {
    const { idComanda, idItem } = req.params;
    const comanda = comandas.find(comanda => comanda.id === idComanda);
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }
    const itemIndex = comanda.itens.findIndex(item => item.id === idItem);
    if (itemIndex === -1) {
        return res.status(404).send('Item não encontrado na comanda');
    }
    comanda.itens.splice(itemIndex, 1);
    res.sendStatus(204); // No Content
});


// Rota para remover um item da comanda
app.get('/comandas/:idComanda/itens/:idItem/remover', (req, res) => {
    const { idComanda, idItem } = req.params;
    const comanda = comandas.find(comanda => comanda.id === idComanda);
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }
    const index = comanda.itens.findIndex(item => item.id === idItem);
    if (index === -1) {
        return res.status(404).send('Item não encontrado na comanda');
    }
    const itemRemovido = comanda.itens.splice(index, 1);
    comanda.valorTotal -= itemRemovido[0].preco;
    res.redirect(`/comandas/${idComanda}`);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

export default app; // Exporta o app para uso em outros arquivos