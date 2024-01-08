import * as vscode from 'vscode'
import { getFileName, output } from './utils'

interface FileTreeNode extends vscode.TreeItem {
  label: string
  children?: FileTreeNode[]
  filePath?: string
}

export function buildTreeFromFilePaths(
  filePaths: vscode.Uri[],
  workspaceRoot: string,
): FileTreeNode[] {
  const arr = workspaceRoot.split('/')
  const root: FileTreeNode = { label: arr[arr.length - 1] }
  const treeNodes: FileTreeNode[] = [root]
  filePaths.forEach((fileUri) => {
    const relativePath = vscode.workspace.asRelativePath(fileUri)
    if (ignoreFolder(relativePath)) {
      return
    }
    const folders = relativePath.split('/')

    let currentFolderNode = root
    folders.forEach((folder) => {
      const existingNode = currentFolderNode.children?.find(
        (node) => node.label === folder,
      )

      if (existingNode) {
        currentFolderNode = existingNode
      } else {
        const newFolderNode: FileTreeNode = {
          label: folder,
          filePath: fileUri.fsPath,
        }
        currentFolderNode.children = currentFolderNode.children || []
        currentFolderNode.children.push(newFolderNode)
        currentFolderNode = newFolderNode
      }
    })
  })

  return treeNodes[0].children || []
}

export const openImgFile = (path: string) => {
  output(path)
}

function ignoreFolder(folderName: string): boolean {
  // 在此处定义要忽略的目录名或条件
  const ignoredFolders = ['node_modules', '.git', '.cache']
  let isIg = false
  ignoredFolders.map((el) => {
    if (folderName.includes(el)) {
      isIg = true
    }
  })
  return isIg
}
export class ImageDataProvider
  implements vscode.TreeDataProvider<FileTreeNode>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    FileTreeNode | undefined | null | void
  > = new vscode.EventEmitter<FileTreeNode | undefined | null | void>()
  readonly onDidChangeTreeData: vscode.Event<
    FileTreeNode | undefined | null | void
  > = this._onDidChangeTreeData.event
  private _extensionPath: string
  constructor(extensionPath: string) {
    this._extensionPath = extensionPath
  }
  refresh(node?: FileTreeNode): void {
    this._onDidChangeTreeData.fire(node)
  }
  getChildren(element?: FileTreeNode): vscode.ProviderResult<FileTreeNode[]> {
    if (!element) {
      const imageFilesPattern = '**/*.{jpg,jpeg,png,gif,bmp}'
      return vscode.workspace.findFiles(imageFilesPattern).then((files) => {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath
        const fileTreeNodes = buildTreeFromFilePaths(files, workspaceRoot || '')
        return fileTreeNodes
      })
    }

    return element.children
  }
  getTreeItem(element: FileTreeNode): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(
      element.label,
      element.children
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None,
    )
    if (element.children) {
      return treeItem
    }

    treeItem.command = {
      command: 'extension.openImgFile',
      title: 'Open MP4 File',
      arguments: [element.filePath],
    }
    return treeItem
  }
}
