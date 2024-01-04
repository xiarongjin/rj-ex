// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { SidebarInputProvider } from './sidebar'
import { TreeItem } from 'vscode'
import WebSocket from 'ws'
import { showInfo } from './utils'
import { ReactViewProvider } from './reactview'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const sidebarInputProvider = new SidebarInputProvider(context.extensionPath)
  const reactView = new ReactViewProvider(context.extensionPath)
  const protocol = 'ws'
  const hostAndPath = 'localhost:3000'
  const socket = new WebSocket(`${protocol}://${hostAndPath}`)
  let count = 0
  socket.addEventListener('message', async ({ data }) => {
    count++
    showInfo('socket' + count)
    setTimeout(() => {
      reactView.updateWebview()
    }, 500)
  })

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('other', reactView),
    vscode.window.registerWebviewViewProvider(
      'sidebarInput',
      sidebarInputProvider,
    ),
  )
}

// This method is called when your extension is deactivated
export function deactivate() {}
