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
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const sidebar_1 = require("./sidebar");
const vscode_1 = require("vscode");
class MyTreeDataProvider {
    rootElement;
    constructor(rootElement) {
        this.rootElement = rootElement;
    }
    getTreeItem(element) {
        return element; // 返回一个树节点
    }
    getChildren(element) {
        // 返回相应节点的子节点数组
        // if (!element) {
        //   // 根节点的子节点
        //   return [new TreeItem('Node 1'), new TreeItem('Node 2')]
        // } else if (element.label === 'Node 1') {
        //   // Node 1 的子节点
        //   return [new TreeItem('Child 1'), new TreeItem('Child 2')]
        // }
        return [new vscode_1.TreeItem('Child 1'), new vscode_1.TreeItem('Child 2')]; // 其他节点暂无子节点
    }
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    const sidebarInputProvider = new sidebar_1.SidebarInputProvider(context.extensionPath);
    const myTreeDataProvider = new MyTreeDataProvider(new vscode_1.TreeItem('Root Node'));
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('sidebarInput', sidebarInputProvider));
    vscode.window.registerTreeDataProvider('other', myTreeDataProvider);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map