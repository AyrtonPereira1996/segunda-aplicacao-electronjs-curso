// CARREGAR O MODULO ELECTRONJS

const electron = require('electron');

// CARREGAR OS OBJECTOS PARA O PROJECTO
const { app, BrowserWindow, Menu, ipcMain } = electron;

var mainWindow;
var commentWindow;
var commentMenu = null; //PRA NAO TER MENU

app.on('ready', () => {

    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInWorker: true

        },
        title: 'Segunda Aplicação ElectronJS'
    });

    // PARA CARRREGAR O ARQUIVO HTML
    mainWindow.loadURL(`file://${__dirname}/main.html`);

    // ALTERNATIVO mainWindow.loadFile('main.html');

    // FUNÇÃO CAPAZ DE ENTENDER A ESTRUTURA DE TEMPLATE COMO UM MENU 
    // MAS NÃO COLOCARÁ O MENU NA APLICAÇÃO
    const mainMenu = Menu.buildFromTemplate(menuTemplate);

    // FUNÇÃO QUE COLOCARÁ O MENU NA APLICAÇÃO
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on('closed', () => {
        app.quit();
    });
});

// FUNÇÃO QUE PERMITIRA CRIAR UMA NOVA JANELA PARA
// ADICIONAR COMENTÁRIO
function createCommentWindow() {
    commentWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInWorker: true

        },
        width: 500,
        height: 300,
        title: 'Novo comentário'
    });

    commentWindow.loadURL(`file://${__dirname}/comment.html`);
    commentWindow.on('closed', () => {
        commentWindow = null;
    });

    // REMOVENDO O MENU DA JANELA QUE PERMITE ADICIONAR COMENTARIOS
    if (process.plataform !== 'darwin') {
        commentWindow.setMenu(commentMenu);   
    }

}

// PERMITINDO A RECEPÇÃO DO COMENTÁRIO PROVINDO DO .HTML
ipcMain.on('addComment', (event, userComment) => {

    // ENVIANDO O COMENTÁRIO PARA A JANELA PRINCIPAL
    mainWindow.webContents.send('addComment', userComment);
    commentWindow.close();

});

const menuTemplate = [

    // PRIMEIRO MENU DO BARRA DE MENUS
    {
        label: 'Menu Principal',
        submenu: [
            {
                label: 'Adicionar comentário',
                accelerator: 'Ctrl+N',
                click() {
                    createCommentWindow();
                }
            },

            {
                label: 'Sair da App',
                accelerator: 'Ctrl+E',
                click() {            // FUNCAO QUE SERA DISPARADA ASSIM QUE HOUVER CLIQUE
                    app.quit();
                }
            }
        ]
    }

]

// CONDICAO QUE PERMITE QUE O MESMO MENU SEJA O MESMO NO MACOS E WINDOWS
// ADICIONANDO UM OBJECTO VAZIO    
if (process.platform === 'darwin') {
    menuTemplate.unshift({});
}

//ESTRUTURA CONDICIONAL QUE PERMITIRÁ AVALIAR SE ESTÁ EM MODO DE PRODUÇÃO OU
//DESENVOLVIMENTO E ASSIM HABILITAR A FERRAMENTA DE DESENVOLVEDOR 
if (process.env.NODE_ENV !== 'production') {
    //valores da variavel node_Env de ambiente que permite
    //indicar o ambiente em que a aplicação
    //está sendo executada
    // development, production, test, 


    const devTemplate = {

        label: 'DevTools',
        submenu: [
            {
                label: 'Debug',
                accelerator: 'Ctrl+I',
                click(item, focusedWindow) {
                    // IRÁ CHAMAR AS FERRAMENTAS DE DESENVOLVEDOR
                    focusedWindow.toggleDevTools();

                }
            },
            {
                role: 'Reload'
            }
        ]

    };

    //PERMITIRÁ ADICIONAR UMA OPÇÃO DE MENU NO TEMPLATE DE MENU
    menuTemplate.push(devTemplate);

    if(process.platform !== 'darwin'){
        commentMenu = Menu.buildFromTemplate([devTemplate]);
    }

}