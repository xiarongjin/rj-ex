// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { SidebarInputProvider } from './sidebar'
import { TreeItem } from 'vscode'

class MyTreeDataProvider {
  private rootElement
  constructor(rootElement: TreeItem) {
    this.rootElement = rootElement
  }

  getTreeItem(element: TreeItem) {
    return element // 返回一个树节点
  }

  getChildren(element: TreeItem) {
    // 返回相应节点的子节点数组
    // if (!element) {
    //   // 根节点的子节点
    //   return [new TreeItem('Node 1'), new TreeItem('Node 2')]
    // } else if (element.label === 'Node 1') {
    //   // Node 1 的子节点
    //   return [new TreeItem('Child 1'), new TreeItem('Child 2')]
    // }

    return [new TreeItem('Child 1'), new TreeItem('Child 2')] // 其他节点暂无子节点
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const sidebarInputProvider = new SidebarInputProvider(context.extensionPath)
  const myTreeDataProvider = new MyTreeDataProvider(new TreeItem('Root Node'))
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'sidebarInput',
      sidebarInputProvider,
    ),
  )
  vscode.window.registerTreeDataProvider('other', myTreeDataProvider)
}

// This method is called when your extension is deactivated
export function deactivate() {}
