// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ollama from 'ollama'; // Ensure correct import

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    const panel = vscode.window.createWebviewPanel(
        'Verydeep Chat',
        'Really Deep Chat',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );
    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(async (message: any) => {
        if (message.command === 'chat') {
            const userPrompt = message.text;
            let responseText = '';

            try {
                const streamResponse = await ollama.chat({
                    model: 'deepseek-r1:latest',
                    messages: [{ role: 'user', content: userPrompt }],
                    stream: true
                });

                for await (const part of streamResponse) {
                    responseText += part.message.content;
                    panel.webview.postMessage({ command: 'chatResponse', text: responseText });
                }
            } catch (err) {
                panel.webview.postMessage({ command: 'chatResponse', text: `Error: ${String(err)}` });
            }
        }
    });

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('verydeep-d1.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Welcome to Deep thoughts with VeryDeep - d1');
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VeryDeep chat</title>
    </head>
    <body>
        <div class="chat">
            <h2>DeepSeek VS Code Extension</h2>
            <textarea type="text" id="prompt" placeholder="Ask something deep..."></textarea> <br><button id="ask">Ask</button>
            <div id="response"></div> <!-- Added id for response div -->
        </div>
        <script>
            const vscode = acquireVsCodeApi();
            document.getElementById('ask').addEventListener('click', () => {
                const inputtext = document.getElementById('prompt').value;
                vscode.postMessage({ command: 'chat', text: inputtext });
            });
            window.addEventListener('message', event => {
                const { command, text } = event.data;
                if (command === 'chatResponse') {
                    document.getElementById('response').innerText = text;
                }
            });
        </script>
    </body>
    </html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}