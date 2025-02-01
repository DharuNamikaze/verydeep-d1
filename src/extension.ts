// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ollama from 'ollama'; // Ensure correct import

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
    <title>DeepChat</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }
        body {
            background: #1e1e1e;
            color: #fff;
            display: flex;
            flex-direction: column;
            height: 100vh;
            justify-content: space-between;
        }
        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            padding: 20px;
        }
        .message {
            max-width: 80%;
            padding: 12px 15px;
            margin: 10px;
            border-radius: 10px;
            word-wrap: break-word;
            font-size: 16px;
        }
        .user-message {
            align-self: flex-end;
            background: rgb(0, 132, 255);;
            color: #000;
        }
        .bot-message {
            align-self: flex-start;
            background: #333;
            color: #fff;
        }
        .input-container {
            display: flex;
            padding: 10px;
            background: #252525;
            border-top: 1px solid #333;
        }
        textarea {
            flex: 1;
            background: #333;
            color: #fff;
            border: 1px solid #444;
            border-radius: 5px;
            padding: 10px;
            font-size: 16px;
            resize: none;
            outline: none;
        }
        button {
            background:rgb(0, 132, 255);
            color: #000;
            border: none;
            padding: 10px 15px;
            margin-left: 10px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            transition: 0.3s;
            font-weight: bold;
        }
        button:hover {
            background: #00cca3;
        }
        .stop-btn {
            background: #ff4444;
        }
        .stop-btn:hover {
            background: #cc0000;
        }
    </style>
</head>
<body>

    <div class="chat-container" id="chat">
        <div class="message bot-message">Hello! Ask me anything.</div>
    </div>

    <div class="input-container">
        <textarea id="prompt" placeholder="Ask something deep..." rows="1"></textarea>
        <button id="ask">Ask</button>
        <button id="stop" class="stop-btn">O</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let chatActive = false;
        const chatContainer = document.getElementById("chat");

        function addMessage(text, sender) {
            const msgDiv = document.createElement("div");
            msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
            msgDiv.textContent = text;
            chatContainer.appendChild(msgDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        document.getElementById("ask").addEventListener("click", () => {
            const inputText = document.getElementById("prompt").value.trim();
            if (!inputText || chatActive) return;

            addMessage(inputText, "user");
            document.getElementById("prompt").value = "";
            chatActive = true;

            vscode.postMessage({ command: "chat", text: inputText });
            addMessage("Thinking...", "bot");
        });

        document.getElementById("stop").addEventListener("click", () => {
            chatActive = false;
            vscode.postMessage({ command: "stopChat" });
            addMessage("Chat stopped.", "bot");
        });

        window.addEventListener("message", (event) => {
            const { command, text } = event.data;
            if (command === "chatResponse" && chatActive) {
                document.querySelector(".bot-message:last-child").textContent = text;
                chatActive = false;
            }
        });
    </script>

</body>
</html>

`;
}

// This method is called when your extension is deactivated
export function deactivate() {}