type Cliente = {
    id: number,
    nome: string,
    cpf: string,
    telefone: string,
    endereco: string
};

type FnCallback = (listaClientes: Cliente[], idRecebido?: number) => void;

type RetornoValidacao = {type: "sucesso", valor: string} | { type: "erro", mensagem: string}
type FnValidacao = (input: string) => RetornoValidacao//| {mensagem: string, erro: boolean};

type MenuOpcoes = {
    [opc: string]: {
        texto: string,
        fnCallback: FnCallback | (() => void),
    }
};


// Controles e dados
let matemAplicacaoAtiva: boolean = true;
const mockDbClientes: Cliente[] = [];


// Utilitários

const validaTelefone = (telefoneRecebido: string): RetornoValidacao => {
    if (telefoneRecebido.trim().length !== 9 ||  /^[0-9]+$/.test(telefoneRecebido) === false) {
        return {type: "erro" , mensagem: "Telefone com formato ou caracteres inválidos"}
    }

    return {type: "sucesso", valor: telefoneRecebido}
}

const validaCPF = (cpfRecebido: string): RetornoValidacao  => {

    if (cpfRecebido.trim().length !== 11 ||  /^[0-9]+$/.test(cpfRecebido) === false) {
        return {type: "erro" , mensagem: "CPF com tamanho incorreto ou caracteres inválidos"}
    }

    let multiplicadorInicial = 2
    let cpfArray = cpfRecebido.split('').map(char => parseInt(char))
    let dig2 = cpfArray.pop()
    let dig1 = cpfArray.pop()
   
    let dig1Calculado = (11 - cpfArray.reverse().reduce((prev, atual, index) => atual * (multiplicadorInicial + index) + prev, 0) % 11) 
    let dig1Valido = dig1! === (dig1Calculado > 9 ? 0 : dig1Calculado)
    
    let dig2Valido = false
    if (dig1Valido) {
        cpfArray.unshift(dig1!)
        let dig2Calculado = (11 - cpfArray.reduce((prev, atual, index) => atual * (multiplicadorInicial + index) + prev, 0) % 11) 
        dig2Valido = dig2! === (dig2Calculado > 9 ? 0 : dig2Calculado)
    }
    
    if (dig1Valido===false || dig2Valido===false) {
        return {type: "erro" , mensagem: "CPF com DV inválido"}
        
    }
    
    return {type: "sucesso", valor: cpfRecebido}
}

const trataPrompt = (textoPrompt: string, permiteCancelar?: boolean, valorDefault?: string,  validacaoFn?: FnValidacao, mensagemCancelamento?: string): string => {
    try {
     
        let textoCancelar = permiteCancelar ? '\n* Clique em "Cancelar" para sair' : ''
        let valorPrompt: string | null = prompt(`${textoPrompt}${textoCancelar}`, valorDefault);
        
        if (permiteCancelar && valorPrompt === null) {
            throw new Error(mensagemCancelamento ?? 'Operação cancelada');
        } 

        if (valorPrompt === null || valorPrompt === ''){
            alert('Valor Inválido! Tente novamente');
            return trataPrompt(textoPrompt, permiteCancelar, valorDefault, validacaoFn);
        }
        
        if (validacaoFn) {
            let resultadoValidacao = validacaoFn(valorPrompt);
            if (resultadoValidacao.type === "erro") {
                alert(`Valor Inválido! ${resultadoValidacao.mensagem}`);
                return trataPrompt(textoPrompt, permiteCancelar, valorDefault, validacaoFn);
            }
            valorPrompt = resultadoValidacao.valor
        }

        return valorPrompt;
    } catch (error) {
        throw error
    }
}



const idNaoLocalizado = (fnCallback: FnCallback, id: number, listaClientes: Cliente[]) => {
    let mensagem = isNaN(id) ? 
    'Valor inválido.\nDigite um ID válido: (ou clique em "Cancelar" para sair)' : 
    `Cliente com ID ${id} não localizado.\nInforme um ID diferente: (ou clique em "Cancelar" para sair)` 
    let continua = prompt(mensagem);
    if(continua) {
        fnCallback(listaClientes, parseInt(continua));
    } else {
        alert("Operação cancelada")
    }
}

const montaMenu = (): MenuOpcoes => {
    try {
        
        const menuOpcoesMap: MenuOpcoes = {
            '1': {texto: 'Cadastrar Cliente', fnCallback: cadastrarCliente},
            '2': {texto: 'Listar Clientes', fnCallback: listarClientes},
            '3': {texto: 'Exibir Detalhes do Cliente', fnCallback: detalharCliente},
            '4': {texto: 'Atualizar Cliente', fnCallback: atualizarCliente},
            '5': {texto: 'Deletar Cliente', fnCallback: deletarCliente},
            '6': {texto: 'Sair', fnCallback: sair}
        };

        return menuOpcoesMap;

    } catch (error) {
        throw new Error(`Erro ao montar menu: ${error}`);
    }

}

const capturaPromptMenu = (menuMap: MenuOpcoes): string => {
    try {
        
        let menuTexto = 'Selecione uma das opções abaixo:\n====================================\n';
        for (const key in menuMap) {
            const opcao = menuMap[key];
            menuTexto += `${key}. ${opcao.texto}\n`;
        }

        const menuSelecionado = trataPrompt(menuTexto, true, undefined , undefined, "Aplicação encerrada!");

        // Tratando erro de input com chamada recursiva
        if (!Object.keys(menuMap).includes(menuSelecionado)) {
            alert(`Opção ${menuSelecionado} inválida. Na próxima tela selecione uma opção válida.`);
            return capturaPromptMenu(menuMap);
        }

        return menuSelecionado;

    } catch (error) {
        throw error;
    }

}


// CRUD
const cadastrarCliente = (listaClientes: Cliente[]) => {
    try {
        const textoAoresentacao = `Cadastrar Cliente\n====================================\n\n`;
        const nome = trataPrompt(`${textoAoresentacao}Passo 1/4\nInforme o nome do cliente:`, true);
        const cpf = trataPrompt('Passo 2/4\nInforme o CPF (apenas números):', true, undefined, validaCPF);
        const telefone = trataPrompt('Passo 3/4\nInforme o telefone (com 9 dígitos e apenas números):', true, undefined, validaTelefone);
        const endereco = trataPrompt('Passo 4/4\nInforme o endereço:', true);

        const idMaximo = listaClientes.length > 0 ? Math.max(...listaClientes.map(cli => cli.id)) : 0;
        const novoId = idMaximo + 1;

        const novoCliente: Cliente = {id: novoId, nome, cpf, telefone, endereco};
        listaClientes.push(novoCliente);

        alert(`Cliente ${nome} cadastro com sucesso!`);

    } catch (error: any) {
        alert(error.message)
    }
    

}

const listarClientes = (listaClientes: Cliente[]) => {
    
    if (listaClientes.length === 0) {
        alert('Não há clientes cadastrados');
    } else {
        const textoAoresentacao = `Lista de Clientes (${listaClientes.length}):\n====================================\n\n`;
        const listaComoTexto = listaClientes.map(cliente => `ID: ${cliente.id} | Nome: ${cliente.nome} |  CPF: ${cliente.cpf}\n`);
        alert(textoAoresentacao + listaComoTexto.join("====================================\n"));
    }
    
}

const detalharCliente = (listaClientes: Cliente[], idRecebido?: number) => {
    try {
        const textoAoresentacao = `Detalhar Cliente\n====================================\n\n`;
        const id = idRecebido ?? parseInt(trataPrompt(`${textoAoresentacao}Informe o ID do cliente que deseja exibir:`, true));
        const clienteExibir = listaClientes.find(cliente => cliente.id === id);
        if (clienteExibir) {
            alert(`ID: ${clienteExibir.id}\nNome: ${clienteExibir.nome}\nCPF: ${clienteExibir.cpf}\nTelefone: ${clienteExibir.telefone}\nEndereço: ${clienteExibir.endereco}`);
        } else {
            idNaoLocalizado(detalharCliente, id, listaClientes);2
        }
    } catch (error: any) {
        alert(error.message)
    }
}

const atualizarCliente = (listaClientes: Cliente[], idRecebido?: number) => {
    try {
    
        const textoAoresentacao = `Atualizar Cliente\n====================================\n\n`;
        const id = idRecebido ?? parseInt(trataPrompt(`${textoAoresentacao}Informe o ID do cliente que deseja atualizar:`, true));
        const clienteAtualizar = listaClientes.find(cliente => cliente.id === id);

        if (clienteAtualizar) {

            let novoNome = trataPrompt(`${textoAoresentacao}Passo 1/4\nAtualize o valor para o nome:`, true, clienteAtualizar.nome);
            let novoCpf = trataPrompt(`Passo 2/4\nAtualize o valor para o cpf:`, true, clienteAtualizar.cpf, validaCPF);
            let novoTelefone = trataPrompt(`Passo 3/4\nAtualize o valor para o telefone:`, true, clienteAtualizar.telefone, validaTelefone);
            let novoEndereco = trataPrompt(`Passo 4/4\nAtualize o valor para o endereço:`, true, clienteAtualizar.endereco);

            clienteAtualizar.nome = novoNome 
            clienteAtualizar.cpf = novoCpf
            clienteAtualizar.telefone = novoTelefone
            clienteAtualizar.endereco = novoEndereco

            alert(`Cliente com ID ${id} atualizado com sucesso!`);

        } else {
            idNaoLocalizado(atualizarCliente, id, listaClientes);
        }

    } catch (error: any) {
        alert(error.message)
    }
        
}

const deletarCliente = (listaClientes: Cliente[], idRecebido?: number) => {
    try {
        const textoAoresentacao = `Deletar Cliente\n====================================\n\n`;
        const id = idRecebido ?? parseInt(trataPrompt(`${textoAoresentacao}Informe o ID do cliente que deseja deletar:`, true));
        const clienteDeletar = listaClientes.find(cliente => cliente.id === id);
        if (clienteDeletar) {
            listaClientes.splice(listaClientes.indexOf(clienteDeletar), 1);
            alert(`Cliente com ID ${id} deletado com sucesso!`);
        } else {
            idNaoLocalizado(deletarCliente, id, listaClientes);
        }
    } catch (error: any) {
        alert(error.message)
    }
}

const sair = () => {
    matemAplicacaoAtiva = false;
    alert('Aplicação encerrada!');
}


// Início da execução
const main = (): void => {
    try {

        const menuMap = montaMenu();
        const opcaoSelecionada = capturaPromptMenu(menuMap);
        console.log(opcaoSelecionada);

        menuMap[opcaoSelecionada].fnCallback(mockDbClientes);
        console.log(mockDbClientes);
        
        if (matemAplicacaoAtiva) {
            main();
        }

    } catch (error:any) {
        alert(error.message)
    } 
}
main();