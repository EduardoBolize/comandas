import { app, BrowserWindow } from 'electron';
import expressApp from './server.js';  // Adicionar .js para garantir que o caminho é interpretado corretamente

let mainWindow;

function createWindow() {
    // Cria uma janela de navegação.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // Ajuste conforme necessário para suas necessidades de segurança
        }
    });

    // Inicia o servidor Express na porta 3000
    expressApp.listen(3000, () => {
        console.log('Express server listening on port 3000');
    });

    // Carrega a interface do usuário do Express na janela do Electron
    mainWindow.loadURL('http://localhost:3000/');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
