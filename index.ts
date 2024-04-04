type FnCallback = (listaClientes: Cliente[]) => void
type MenuOpcoes = {
    [opc: string]: {
        texto: string,
        fnCallback: FnCallback | (() => void),
    }
}

type Cliente = {
    id: number,
    nome: string,
    cpf: string,
    telefone: string,
    endereco: string
}


// Controles e dados
let matemAplicacaoAtiva: boolean = true
const mockDbClientes: Cliente[] = []


// Utilitários
const trataPromptNullOuVazio = (textoPrompt: string): string => {
    let valorPrompt: string | null = prompt(textoPrompt)
    while(valorPrompt === null || valorPrompt === '') {
        valorPrompt = prompt(`Valor inválido!\n${textoPrompt}`)
    }
    return valorPrompt
}

const montaMenu = (): MenuOpcoes => {
    try {
        
        const menuOpcoesMap: MenuOpcoes = {
            '1': {texto: 'Cadastrar Cliente', fnCallback: cadastrarCliente},
            '2': {texto: 'Listar Clientes', fnCallback: listarClientes},
            '3': {texto: 'Atualizar Cliente', fnCallback: atualizarCliente},
            '4': {texto: 'Deletar Cliente', fnCallback: deletarCliente},
            '5': {texto: 'Sair', fnCallback: sair}
        }

        return menuOpcoesMap

    } catch (error) {
        throw new Error(`Erro ao montar menu: ${error}`)
    }

}

const capturaPromptMenu = (menuMap: MenuOpcoes): string => {
    try {

        let opcoes = []
        let menuTexto = 'Selecione uma das opções abaixo:\n\n'
        for (const key in menuMap) {
            opcoes.push(key)
            const opcao = menuMap[key];
            menuTexto += `${key}. ${opcao.texto}\n`
        }

        const menuSelecionado = trataPromptNullOuVazio(menuTexto)
        // Tratando erro de input com chamada recursiva
        if (!menuSelecionado || !opcoes.includes(menuSelecionado)) {
            alert(`Opção ${menuSelecionado} inválida. Na próxima tela selecione uma opção válida.`);
            return capturaPromptMenu(menuMap)
        }

        return menuSelecionado

    } catch (error) {
        throw error
    }

}


// CRUD
const cadastrarCliente = (listaClientes: Cliente[]) => {
    const textoAoresentacao = `Cadastrar Cliente\n====================================\n\n`
    const nome = trataPromptNullOuVazio(`${textoAoresentacao}Passo 1\nInforme o nome do cliente:`)
    const cpf = trataPromptNullOuVazio('Passo 2\nInforme o CPF:')
    const telefone = trataPromptNullOuVazio('Passo 3\nInforme o telefone:')
    const endereco = trataPromptNullOuVazio('Passo 4\nInforme o endereço:')
    const idMaximo = listaClientes.length > 0 ? Math.max(...listaClientes.map(cli => cli.id)) : 0
    const novoId = idMaximo + 1
    const novoCliente: Cliente = {id: novoId, nome, cpf, telefone, endereco}
    listaClientes.push(novoCliente)
    alert(`Cliente ${nome} cadastro com sucesso!`)
}

const listarClientes = (listaClientes: Cliente[]) => {
    
    if (listaClientes.length === 0) {
        alert('Não há clientes cadastrados')
    } else {
        const textoAoresentacao = `Lista de Clientes (${listaClientes.length}):\n====================================\n\n`
        const listaComoTexto = listaClientes.map(cliente => `Nome: ${cliente.nome} \nID: ${cliente.id}  |  CPF: ${cliente.cpf}  |  Telefone: ${cliente.telefone}\nEndereço: ${cliente.endereco}\n\n`)
        alert(textoAoresentacao + listaComoTexto.join("====================================\n\n"))
    }
    
}

const atualizarCliente = () => {
}

const deletarCliente = (listaClientes: Cliente[]) => {
    const textoAoresentacao = `Deletar Cliente\n====================================\n\n`
    const cpf = trataPromptNullOuVazio(`${textoAoresentacao}Informe o CPF do cliente que deseja deletar:`)
    const clienteDeletar = listaClientes.find(cliente => cliente.cpf === cpf)
    if (clienteDeletar) {
        listaClientes.splice(listaClientes.indexOf(clienteDeletar), 1)
        alert(`Cliente com CPF ${cpf} deletado com sucesso!`)
    } else {
        let continua = prompt(`Cliente com CPF ${cpf} não localizado.\nDigite 1 para tentar novamente:`)
        if(continua && continua === '1') {
            deletarCliente(listaClientes)
        }
    }
}

const sair = () => {
    matemAplicacaoAtiva = false
    alert('Aplicação encerrada!')
}

// Início da execução
const main = (): void => {
    try {

        const menuMap = montaMenu()
        const opcaoSelecionada = capturaPromptMenu(menuMap)
        console.log(opcaoSelecionada)

        menuMap[opcaoSelecionada].fnCallback(mockDbClientes)
        console.log(mockDbClientes)
        
        if (matemAplicacaoAtiva) {
            main()
        }

    } catch (error) {
        console.error(error)
    }
}
main()