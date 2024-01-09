import * as vscode from 'vscode'
import { getFileName, output, showInfo } from './utils'
import sharp, { AvailableFormatInfo, FormatEnum } from 'sharp'

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
  vscode.window
    .showInputBox({
      prompt: '请输入压缩后图片的质量',
      placeHolder: '图片质量等级: 0——100',
    })
    .then((quality) => {
      if (quality) {
        vscode.window
          .showInputBox({
            prompt: '可以输入想要转的格式,多种格式请用逗号(,)隔开',
            placeHolder: 'jpg 或者 jpg,png,webp,avif',
          })
          .then((exts) => {
            if (exts) {
              output('正在准备中...')
              showInfo('正在准备中...')
              miniImg(path, Number(quality), exts)
            }
          })
      } else {
        output('需要输入一个数字')
        showInfo('需要输入一个数字')
      }
    })
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
    this._onDidChangeTreeData.fire(undefined)
  }

  refreshCreatedFiles(createdFiles: readonly vscode.Uri[]) {
    this.refresh()
  }

  refreshDeletedFiles(deletedFiles: readonly vscode.Uri[]) {
    this.refresh()
  }

  getChildren(element?: FileTreeNode): vscode.ProviderResult<FileTreeNode[]> {
    if (!element) {
      const imageFilesPattern = '**/*.{jpg,jpeg,png}'
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

type SupportedFormats = keyof sharp.FormatEnum

export const miniImg = (input: string, quality: number, extsStr?: string) => {
  const uri = vscode.Uri.parse(input)

  const directory = uri.fsPath.substring(0, uri.fsPath.lastIndexOf('/')) + '/'
  const extension = uri.path.substring(uri.path.lastIndexOf('.'))
  const fileName = getFileName(uri).replace(extension, '')
  const exts = extsStr?.split(',') as SupportedFormats[]

  // console.log(directory + fileName + '_' + quality)
  if (quality < 98) {
    const compressionLevel = Math.floor((100 - quality) / 10)
    if (extension === 'png') {
      exts.map((el) => {
        try {
          sharp(input)
            .png({ compressionLevel })
            .toFormat(el)
            .toFile(
              directory + fileName + '_' + quality + '.' + el,
              (err, info) => {
                // 处理完成后的回调函数
                if (err) {
                  showInfo(el + '可能不支持该格式')
                  output(JSON.stringify(err))
                  throw err
                } else {
                  showInfo(el + '格式已完成转换！请到原目录查看')
                }
                // console.log(info)
                output(JSON.stringify(info))
              },
            )
        } catch (error) {
          showInfo(el + '可能不支持该格式')
          output(JSON.stringify(error))
        }
      })
    } else {
      exts.map((el) => {
        if (el === 'png') {
          return
        }
        try {
          sharp(input)
            .jpeg({ quality })
            .toFormat(el)
            .toFile(
              directory + fileName + '_' + quality + '.' + el,
              (err, info) => {
                // 处理完成后的回调函数
                if (err) {
                  showInfo(el + '可能不支持该格式')
                  output(JSON.stringify(err))
                  throw err
                } else {
                  showInfo(el + '格式已完成转换！请到原目录查看')
                }
                // console.log(info)
                output(JSON.stringify(info))
              },
            )
        } catch (error) {
          showInfo(el + '可能不支持该格式')
          output(JSON.stringify(error))
        }
      })
    }
  } else {
    exts.map((el) => {
      try {
        sharp(input)
          .toFormat(el)
          .toFile(directory + fileName + '_' + 100 + '.' + el, (err, info) => {
            // 处理完成后的回调函数
            if (err) {
              showInfo(el + '可能不支持该格式')
              output(JSON.stringify(err))
              // throw err
            } else {
              showInfo(el + '格式已完成转换！请到原目录查看')
            }
            // console.log(info)
            output(JSON.stringify(info))
          })
      } catch (error) {
        showInfo(el + '可能不支持该格式')
        output(JSON.stringify(error))
      }
    })
  }
}

function appendSuffixToFileName(filePath: string, quality: number): string {
  const uri = vscode.Uri.parse(filePath)

  const fileName = uri.fsPath
  const directory = uri.fsPath.substring(0, uri.fsPath.lastIndexOf('/'))
  const extension = uri.path.substring(uri.path.lastIndexOf('.'))
  console.log('File Name:', fileName)
  console.log('Directory:', directory)
  console.log('Extension:', extension)
  console.log(directory + fileName + quality + extension)

  return directory + fileName + quality + extension
}
