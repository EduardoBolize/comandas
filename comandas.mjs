import express from 'express';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let comandas = [];

let itensPadrao = [
    { nome: 'Strong Mint', preco: 5 },
    { nome: 'Pizza', preco: 20 },
    { nome: 'Hambúrguer', preco: 15 },
    { nome: 'Batata Frita', preco: 10 },
    // { nome: 'Outro', preco: null } // Adicionando uma opção "Outro" sem preço definido
];

// Função para calcular o valor total de uma comanda
function calcularValorTotal(comanda) {
    let total = 0;
    for (const item of comanda.itens) {
        total += item.preco * item.quantidade; // Adiciona o preço total de cada item ao total da comanda
    }
    return total;
}

// Rota raiz - Página inicial com lista de comandas abertas e formulário para abrir nova comanda
app.get('/', (req, res) => {
    res.send(`
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
            }
            h1 {
                margin-top: 2.5%;
                margin-bottom: 2.5%;
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
                background-color: #f2f2f2;
                border-radius: 5px;
                padding: 10px;
                margin-right: 10px; /* Adiciona um espaço entre as colunas */
            }
            .comandas-col:last-child {
                margin-right: 0; /* Remove o espaço da última coluna */
            }
            .comandas-col:hover {
                background-color: #e0e0e0;
            }
            .comandas-col h2 {
                margin-bottom: 10px;
            }
            .comandas-col ul {
                list-style-type: none;
                padding: 0;
            }
            .comandas-col li {
                margin-bottom: 5px;
            }
            .comandas-link {
                display: block;
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                margin-bottom: 10px;
                border: none;
                cursor: pointer;
                border-radius: 5px;
                text-decoration: none;
                transition: background-color 0.3s;
            }
            .comandas-link:hover {
                background-color: #45a049;
            }
            .comandas-link.fechada {
                background-color: #FF5733;
            }
            .comandas-link.fechada:hover {
                background-color: #e74c3c;
            }
            .comandas-form {
                flex: 0 0 40%; /* Largura fixa para o formulário */
                text-align: left;
            }
            .comandas-form h2 {
                margin-bottom: 10px;
            }
            .comandas-form form {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            .comandas-form label {
                margin-bottom: 5px;
            }
            .comandas-form input[type="text"] {
                padding: 5px;
                width: 100%;
                margin-bottom: 10px;
            }
            .comandas-form button {
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                border: none;
                cursor: pointer;
                border-radius: 5px;
                transition: background-color 0.3s;
            }
            .comandas-form button:hover {
                background-color: #45a049;
            }
        </style>
        <h1>Comandas</h1>
        <div class="comandas-container">
            <div class="comandas-col">
                <h2>Comandas Abertas</h2>
                <ul>
                    ${comandas
                        .filter(comanda => comanda.status === 'aberta')
                        .map(comanda => `<li><a class="comandas-link" href="/comandas/${comanda.id}">${comanda.nomeCliente} - Valor Total: R$ ${calcularValorTotal(comanda)}</a></li>`).join('')
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
                    <button type="submit">Exportar para TXT</button>
                </form>
            </div>
            <div class="comandas-col">
                <h2>Comandas Fechadas</h2>
                <ul>
                    ${comandas
                        .filter(comanda => comanda.status === 'fechada')
                        .map(comanda => `<li><a class="comandas-link fechada" href="/comandas/${comanda.id}">${comanda.nomeCliente} - Fechada - Valor Total: R$ ${calcularValorTotal(comanda)}</a></li>`).join('')
                    }
                </ul>
            </div>
        </div>
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


// Rota para visualizar uma comanda específica (incluindo comandas fechadas)
app.get('/comandas/:idComanda', (req, res) => {
    const { idComanda } = req.params;
    const comanda = comandas.find(comanda => comanda.id === idComanda);
    if (!comanda) {
        return res.status(404).send('Comanda não encontrada');
    }

    let options = itensPadrao.map(item => `<option value="${item.nome}" data-preco="${item.preco}">${item.nome} - R$ ${item.preco}</option>`).join('');
    options += `<option value="Outro" data-preco="">Outro</option>`;

    const pagamentoOptions = ['dinheiro', 'pix', 'cartao_credito', 'debito'].map(metodo => `<option value="${metodo}">${metodo}</option>`).join('');

    res.send(`
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
            }
            h1 {
                margin-top: 4%;
                margin-bottom: 2.5%;
            }
            h2 {
                margin-bottom: 10px;
            }
            ul {
                list-style-type: none;
                padding: 0;
            }
            li {
                margin-bottom: 5px;
            }
            .comanda-link {
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                margin: 10px;
                border: none;
                cursor: pointer;
                border-radius: 5px;
                text-decoration: none;
                display: inline-block;
            }
            .comanda-link:hover {
                background-color: #45a049;
            }
            button, a {
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                margin: 10px;
                border: none;
                cursor: pointer;
                border-radius: 5px;
                text-decoration: none;
            }
            button:hover, a:hover {
                background-color: #45a049;
            }
            form {
                display: inline-block;
                margin-top: 10px;
            }
            label {
                display: block;
                margin-bottom: 5px;
            }
            select, input[type="number"], input[type="text"] {
                margin-bottom: 10px;
                padding: 5px;
            }
            input[type="number"] {
                width: 60px;
            }
            .container {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                flex-wrap: wrap;
                padding: 20px;
            }
            .coluna {
                flex: 1;
                min-width: 300px;
                margin: 0 10px;
            }
            .coluna-center {
                flex: 1;
                min-width: 300px;
                margin: 0 10px;
                text-align: center;
            }
        </style>
        <h1>Comanda de ${comanda.nomeCliente}${comanda.status === 'fechada' ? ' - Fechada' : ''}</h1>
        <div class="container">
            <div class="coluna">
                <h2>Itens</h2>
                <ul>
                    ${comanda.itens.map(item => `
                        <li>${item.nome} (${item.quantidade}x) - R$ ${item.preco * item.quantidade} 
                            <button class="remover-item" data-comanda-id="${idComanda}" data-item-id="${item.id}">Remover</button>
                        </li>`).join('')}
                </ul>
            </div>
            <div class="coluna-center">
                <h2>Adicionar Item</h2>
                <form action="/comandas/${idComanda}/itens" method="post">
                    <select name="nomeItem" id="nomeItem" onchange="mostrarCampos(this)">
                        ${options}
                    </select>
                    <input type="text" name="novoNomeItem" id="novoNomeItem" placeholder="Nome do item" style="display:none;">
                    <input type="number" name="quantidade" id="quantidade" value="1" min="1" style="width: 60px;">
                    <input type="number" name="preco" id="preco" placeholder="Preço" style="display:none;">
                    <button type="submit">Adicionar Item</button>
                </form>
            </div>
            <div class="coluna">
                <h2>Fechar Comanda</h2>
                <form action="/comandas/${idComanda}/fechar" method="post">
                    <label for="metodoPagamento">Método de Pagamento:</label>
                    <select name="metodoPagamento" id="metodoPagamento">
                        ${pagamentoOptions}
                    </select>
                    <button type="submit">Fechar Comanda</button>
                </form>
                ${comanda.status === 'fechada' ? `<form action="/comandas/${idComanda}/reabrir" method="post">
                    <button type="submit">Reabrir Comanda</button>
                </form>` : ''}
            </div>
        </div>
        <br>
        <a href="/" class="comanda-link">Voltar para lista de comandas</a>
        <script>
            document.querySelectorAll('.remover-item').forEach(button => {
                button.addEventListener('click', () => {
                    const comandaId = button.getAttribute('data-comanda-id');
                    const itemId = button.getAttribute('data-item-id');
                    fetch('/comandas/' + comandaId + '/itens/' + itemId, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (response.ok) {
                            // Atualizar a página após a remoção do item
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

    // Atualiza o status da comanda para fechada e define o método de pagamento
    comanda.status = 'fechada';
    comanda.metodoPagamento = metodoPagamento;

    res.redirect('/');
});

// Rota para fechar uma comanda
app.put('/comandas/:idComanda/fechar', (req, res) => {
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
    // Aqui você pode adicionar lógica para exportar os dados para um arquivo txt
    res.send(`Comanda fechada. Valor Total: R$ ${valorTotalVendido}. Método de Pagamento: ${metodoPagamento}`);
});

// Função para exportar as informações da comanda para um arquivo TXT
function exportarParaTxt(comanda) {
    const dataAtual = new Date();
    const dataFormatada = `${dataAtual.getDate()}-${dataAtual.getMonth() + 1}-${dataAtual.getFullYear()}`;
    const nomeArquivo = `comanda_${comanda.id}_${dataFormatada}.txt`;
    const diretorio = './registros'; // O diretório já está definido diretamente
    const caminhoArquivo = path.join(diretorio, nomeArquivo);

    // Escrever informações da comanda no arquivo
    let conteudo = `Comanda de ${comanda.nomeCliente}`;
    if (!comanda.fechada) {
        conteudo += ' (ABERTA)';
    }
    conteudo += ` - ${dataFormatada}\n`;
    conteudo += '----------------------------------------\n';
    let valorTotal = 0; // Variável para calcular o valor total da comanda
    for (const item of comanda.itens) {
        if (item.quantidade > 0) { // Considera apenas os itens vendidos (com quantidade maior que zero)
            const valorTotalItem = item.preco * item.quantidade; // Calcula o valor total do item multiplicando o preço pela quantidade
            conteudo += `${item.nome} (Quantidade: ${item.quantidade}) - R$ ${valorTotalItem.toFixed(2)}\n`; // Adiciona a quantidade e o valor total multiplicado pela quantidade no arquivo TXT
            valorTotal += valorTotalItem; // Adiciona o valor total do item ao valor total da comanda
        }
    }
    conteudo += '----------------------------------------\n';
    conteudo += `Valor Total: R$ ${valorTotal.toFixed(2)}\n`; // Adiciona o valor total da comanda
    if (comanda.fechada) { // Se a comanda estiver fechada, adiciona a forma de pagamento
        conteudo += `Método de Pagamento: ${comanda.metodoPagamento}\n`;
    }

    // Escrever no arquivo
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

    // Verifica se a pasta 'registros' existe, se não, cria
    if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta);
    }

    let conteudo = '';
    let totalVendido = 0;
    let totalPorPagamento = { dinheiro: 0, pix: 0, cartao_credito: 0, debito: 0 };

    // Adiciona informações de cada comanda ao conteúdo do arquivo
    comandas.forEach(comanda => {
        conteudo += `Comanda de ${comanda.nomeCliente} - Valor Total: R$ ${calcularValorTotal(comanda).toFixed(2)} - Método de Pagamento: ${comanda.metodoPagamento}\n`;
        comanda.itens.forEach(item => {
            conteudo += `${item.nome} (Quantidade: ${item.quantidade}) - R$ ${item.total.toFixed(2)}\n`; // Adiciona a quantidade de itens e o valor total do item multiplicado pela quantidade no arquivo TXT
            totalVendido += item.total;

            // Adiciona o valor ao total por forma de pagamento
            totalPorPagamento[comanda.metodoPagamento] += item.total;
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

    // Escreve o conteúdo no arquivo
    fs.writeFile(caminhoCompleto, conteudo, err => {
        if (err) {
            return res.status(500).send('Erro ao exportar as informações');
        }
        res.send(`
            Informações exportadas com sucesso para ${caminhoCompleto}<br>
            <a href="/">Voltar para a lista de comandas</a>
        `);
    });
});

// Execute a função de exportação de comandas automaticamente a cada uma hora
setInterval(() => {
    exportarComandasParaTxt();
}, 60 * 60 * 1000); // 1 hora em milissegundos

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

// Função para definir a cor da comanda fechada de acordo com o método de pagamento
function definirCorComanda(comanda) {
    switch (comanda.metodoPagamento) {
        case 'cartao_credito':
            return 'azul';
        case 'dinheiro':
            return 'verde';
        case 'debito':
            return 'laranja';
        case 'pix':
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
