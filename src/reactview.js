"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactViewProvider = void 0;
const vscode = __importStar(require("vscode"));
class ReactViewProvider {
    _webviewView;
    _extensionPath;
    constructor(extensionPath) {
        this._extensionPath = extensionPath;
    }
    resolveWebviewView(webviewView, context, token) {
        this._webviewView = webviewView;
        this._webviewView.webview.options = {
            enableScripts: true,
        };
        // Set the title of the view
        this._webviewView.title = 'init repo';
        // Listen for messages from the webview
        this._webviewView.webview.onDidReceiveMessage((message) => {
            console.log(message);
            switch (message.command) {
                case 'init':
                    const data = message.data;
                    console.log(data);
                    break;
            }
        });
        this.updateWebview();
    }
    async updateWebview() {
        if (this._webviewView) {
            this._webviewView.webview.html = await this.getWebviewContent();
        }
    }
    async getWebviewContent() {
        const cssUri = vscode.Uri.file(vscode.Uri.joinPath(vscode.Uri.file(this._extensionPath), 'react-view/dist', 'index.css').fsPath);
        const cssSrc = this._webviewView?.webview.asWebviewUri(cssUri);
        const content = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.Uri.file(this._extensionPath), 'react-view/dist', 'index.html'));
        let html = Buffer.from(content).toString('utf-8');
        const matchResult = html.match(/src="([^"]*)"/);
        if (matchResult) {
            const scriptUri = vscode.Uri.file(vscode.Uri.joinPath(vscode.Uri.file(this._extensionPath), 'react-view/dist', matchResult[1]).fsPath);
            const scriptSrc = this._webviewView?.webview.asWebviewUri(scriptUri);
            console.log(scriptSrc);
            if (scriptSrc) {
                html = html.replace(matchResult[1], `${scriptSrc}`);
            }
        }
        const hrefArr = html.match(/href="([^"]*)"/g);
        hrefArr?.map((el) => {
            const res = el.match(/"([^"]*)"/);
            if (res) {
                const resUri = vscode.Uri.file(vscode.Uri.joinPath(vscode.Uri.file(this._extensionPath), 'react-view/dist', res[1]).fsPath);
                const resSrc = this._webviewView?.webview.asWebviewUri(resUri);
                if (resSrc) {
                    html = html.replace(res[1], `${resSrc}`);
                }
            }
        });
        console.log(html);
        // return addCss.replaceAll('/assets/', publicAssets.fsPath)
        return html;
    }
}
exports.ReactViewProvider = ReactViewProvider;
//# sourceMappingURL=reactview.js.map