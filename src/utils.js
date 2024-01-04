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
exports.getCurrentDirectory = exports.executeShellCommand = exports.alertInfo = exports.showInfo = void 0;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
function showInfo(info, delay) {
    const infoMessage = vscode.window.setStatusBarMessage(info);
    if (delay && delay > 0) {
        setTimeout(() => {
            infoMessage.dispose(); // 隐藏信息消息
        }, delay);
    }
}
exports.showInfo = showInfo;
function alertInfo(info) {
    vscode.window.showInformationMessage(info);
}
exports.alertInfo = alertInfo;
function executeShellCommand(command, cwd) {
    return new Promise((resolve, reject) => {
        const childProcess = (0, child_process_1.exec)(command, { cwd: cwd });
        // 监听标准输出数据事件
        childProcess.stdout?.on('data', (data) => {
            const output = data.toString();
            // 处理输出信息
            console.log(output);
            showInfo(output);
        });
        // 监听标准错误输出数据事件
        childProcess.stderr?.on('data', (data) => {
            const errorOutput = data.toString();
            // 处理错误信息
            console.error(errorOutput);
            showInfo(errorOutput);
        });
        // 监听子进程的关闭事件
        childProcess.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            }
            else {
                reject(new Error(`Command execution failed with code ${code}`));
            }
        });
    });
}
exports.executeShellCommand = executeShellCommand;
function getCurrentDirectory() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        // 获取第一个工作区的根路径
        const workspaceFolder = workspaceFolders[0];
        return workspaceFolder.uri.fsPath;
    }
    // 如果没有打开的工作区，则返回活动编辑器中打开的文件的所在目录
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        const activeFilePath = activeTextEditor.document.uri.fsPath;
        return (vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri)?.uri
            .fsPath ?? activeFilePath);
    }
    // 如果都没找到，则返回默认的工作目录（通常是插件所在的目录）
    return __dirname;
}
exports.getCurrentDirectory = getCurrentDirectory;
//# sourceMappingURL=utils.js.map