// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { SidebarInputProvider } from './sidebar'
// import WebSocket from 'ws'
// import { showInfo } from './utils'
import { ReactViewProvider } from './reactview'
import { MP4FilesTreeDataProvider, openMP4File } from './videotree'
import { ImageDataProvider, openImgFile } from './imgtree'
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const sidebarInputProvider = new SidebarInputProvider(context.extensionPath)

  // 开发环境下热更新，生产环境中需去除

  const reactView = new ReactViewProvider(context.extensionPath)
  // const protocol = 'ws'
  // const hostAndPath = 'localhost:3000'
  // const socket = new WebSocket(`${protocol}://${hostAndPath}`)
  // let count = 0
  // socket.addEventListener('message', async ({ data }) => {
  //   count++
  //   showInfo('socket' + count)
  //   setTimeout(() => {
  //     reactView.updateWebview()
  //   }, 500)
  // })
  const videoTreeDataProvider = new MP4FilesTreeDataProvider(
    context.extensionPath,
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.refreshTreeView', () => {
      videoTreeDataProvider.refresh()
    }),
  )

  // 监听工作区文件夹变动事件
  vscode.workspace.onDidChangeWorkspaceFolders(() => {})

  // 监听文件被删除事件
  vscode.workspace.onDidDeleteFiles((event) => {})

  // 监听文件被创建事件
  vscode.workspace.onDidCreateFiles((event) => {})

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('mp4FilesWebView', reactView),
    vscode.window.registerWebviewViewProvider(
      'sidebarInput',
      sidebarInputProvider,
    ),
    vscode.commands.registerCommand('extension.openMP4File', openMP4File),
    vscode.commands.registerCommand('extension.openImgFile', openImgFile),
  )
  vscode.window.createTreeView('mp4FilesView', {
    treeDataProvider: videoTreeDataProvider,
  })

  const imgTree = new ImageDataProvider(context.extensionPath)
  vscode.window.createTreeView('imgFilesView', {
    treeDataProvider: imgTree,
  })
}

// This method is called when your extension is deactivated
export function deactivate() {}
