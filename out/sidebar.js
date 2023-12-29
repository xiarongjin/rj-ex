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
exports.SidebarInputProvider = void 0;
const vscode = __importStar(require("vscode"));
const utils_1 = require("./utils");
function pullGitRepository(repoUrl, currentDirectory) {
    return (0, utils_1.executeShellCommand)(`git clone ${repoUrl} ${currentDirectory}`);
}
class SidebarInputProvider {
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
                    const repoUrl = data.preset;
                    const repoName = data.name;
                    const currentDirectory = (0, utils_1.getCurrentDirectory)() + '/' + repoName;
                    try {
                        pullGitRepository(repoUrl, currentDirectory).then(() => {
                            console.log('clone finish');
                            (0, utils_1.showInfo)('clone finish');
                            (0, utils_1.executeShellCommand)(`rm -rf ${currentDirectory}/.git`).then(() => {
                                // showInfo("rm .git",500);
                                if (data.new) {
                                    (0, utils_1.showInfo)('正在初始化仓库～');
                                    (0, utils_1.executeShellCommand)(`git init && git add . && git commit -m "first commit" && git branch -M master`, currentDirectory).then(() => {
                                        (0, utils_1.showInfo)('正在与新仓库关联～');
                                        (0, utils_1.executeShellCommand)(`git remote add origin ${data.new} && git push -u origin master`, currentDirectory).then(() => {
                                            (0, utils_1.showInfo)('关联并推送成功！');
                                        });
                                    });
                                }
                            });
                        });
                    }
                    catch (error) {
                        (0, utils_1.alertInfo)(error + '');
                    }
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
        const scriptUri = vscode.Uri.file(vscode.Uri.joinPath(vscode.Uri.file(this._extensionPath), 'media', 'script.js').fsPath);
        const scriptSrc = this._webviewView?.webview.asWebviewUri(scriptUri);
        const content = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.Uri.file(this._extensionPath), 'media', 'index.html'));
        let fileContent = Buffer.from(content)
            .toString('utf-8')
            .replace('<script></script>', `<script src="${scriptSrc}"></script>`);
        return fileContent;
    }
}
exports.SidebarInputProvider = SidebarInputProvider;
//# sourceMappingURL=sidebar.js.map