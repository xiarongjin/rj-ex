import * as vscode from 'vscode'
import {
  executeShellCommand,
  getExtension,
  getFileName,
  getMP4Files,
  output,
  showInfo,
} from './utils'
export class MP4FilesTreeDataProvider
  implements vscode.TreeDataProvider<MP4File | FileCategory>
{
  private _extensionPath: string
  private _onDidChangeTreeData: vscode.EventEmitter<MP4File | undefined> =
    new vscode.EventEmitter<MP4File | undefined>()
  readonly onDidChangeTreeData: vscode.Event<MP4File | undefined> =
    this._onDidChangeTreeData.event
  private categories: Map<string, MP4File[]>

  constructor(extensionPath: string) {
    this._extensionPath = extensionPath
    this.categories = new Map<string, MP4File[]>()
  }

  async refresh() {
    // this.categories = new Map<string, MP4File[]>()

    // const files = await getMP4Files()
    // for (const file of files) {
    //   const fileExt = getExtension(file.fsPath)
    //   if (!this.categories.has(fileExt)) {
    //     this.categories.set(fileExt, [])
    //   }

    //   const categoryFiles = this.categories.get(fileExt)
    //   if (categoryFiles) {
    //     const mp4File = new MP4File(
    //       getFileName(file),
    //       file.fsPath,
    //       this._extensionPath,
    //     )
    //     categoryFiles.push(mp4File)
    //   }
    // }

    this._onDidChangeTreeData.fire(undefined)
  }

  refreshCreatedFiles(createdFiles: readonly vscode.Uri[]) {
    this.refresh()
  }

  refreshDeletedFiles(deletedFiles: readonly vscode.Uri[]) {
    this.refresh()
  }

  getTreeItem(
    element: MP4File | FileCategory,
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    // console.log(element)

    return element
  }

  async getChildren(
    element?: MP4File | FileCategory,
  ): Promise<(MP4File | FileCategory)[] | null | undefined> {
    // console.log(element)
    if (!element) {
      this.categories = new Map<string, MP4File[]>()

      const files = await getMP4Files()
      for (const file of files) {
        const fileExt = getExtension(file.fsPath)
        if (!this.categories.has(fileExt)) {
          this.categories.set(fileExt, [])
        }

        const categoryFiles = this.categories.get(fileExt)
        if (categoryFiles) {
          const mp4File = new MP4File(
            getFileName(file),
            file.fsPath,
            this._extensionPath,
          )
          categoryFiles.push(mp4File)
        }
      }
      const categoryNodes: FileCategory[] = []
      this.categories.forEach((files, category) => {
        files = files.sort((a, b) => a.label.localeCompare(b.label))
        const categoryNode = new FileCategory(category)
        categoryNode.children = files
        categoryNodes.push(categoryNode)
      })

      return categoryNodes.sort((a, b) =>
        (a.label as string).localeCompare(b.label as string),
      )
    } else if (element instanceof FileCategory) {
      // 返回分类下的文件

      return element.children
    } else {
      return [] // 叶子节点无子节点
    }
  }
}

class FileCategory extends vscode.TreeItem {
  public children: MP4File[] = []

  constructor(category: string) {
    super(category, vscode.TreeItemCollapsibleState.Collapsed)
  }
}
class MP4File extends vscode.TreeItem {
  private _extensionPath: string
  constructor(
    public readonly label: string,
    public readonly path: string,
    extensionPath: string,
  ) {
    super(label)
    this.tooltip = path
    this._extensionPath = extensionPath
    this.command = {
      command: 'extension.openMP4File',
      title: 'Open MP4 File',
      arguments: [this._extensionPath, path],
    }
    this.iconPath = {
      light: vscode.Uri.file(this._extensionPath + `/movie-w.svg'`),
      dark: vscode.Uri.file(this._extensionPath + '/movie.svg'),
    }
  }
  // 右键 目前看来在 vscode 中不允许被注册

  // get contextMenuProvider() {
  //   return {
  //     provideContextMenu: (item: vscode.TreeItem) => {
  //       const menuItems = []

  //       // 添加右键菜单项
  //       menuItems.push({
  //         label: 'Custom Action',
  //         command: 'extension.rightClick',
  //         arguments: [this],
  //       })
  //       console.log(item)

  //       return menuItems
  //     },
  //   }
  // }
}

export function openMP4File(extensionPath: string, mp4Path: string) {
  output(mp4Path)
  executeShellCommand(`sh ${extensionPath}/media/info.sh ${mp4Path}`).then(
    () => {
      // console.log('执行完毕')
      if (getExtension(mp4Path) === 'mp4') {
        vscode.window
          .showInputBox({
            prompt: '请输入转码后视频的宽度/或者输入码率进行视频压缩处理',
            placeHolder:
              '视频宽度： 640 720 1920 等/码率 2500k 5000k 等，码率需以 k 结束',
          })
          .then((width) => {
            if (width) {
              if (width?.includes('k')) {
                output('正在准备中...')
                showInfo('正在准备中...')
                executeShellCommand(
                  `sh ${extensionPath}/media/minimp4.sh ${mp4Path} ${width}`,
                ).then(() => {
                  output('已完成压缩!请到视频原目录查看')
                  showInfo('已完成压缩!请到视频原目录查看')
                  vscode.commands.executeCommand('extension.refreshTreeView')
                  // this.refresh()
                })
                return
              }
              output(`输入的宽度是：${width}`)
            } else {
              output(`需要输入一个宽度`)
              return
            }
            vscode.window
              .showInputBox({
                prompt: '请输入其他视频转码参数',
                placeHolder: '-crf 20',
              })
              .then((input) => {
                if (input) {
                  output(`输入的其他参数是：${input}`)
                }
                output('正在准备中...')
                showInfo('正在准备中...')
                executeShellCommand(
                  `sh ${extensionPath}/media/convert.sh ${mp4Path} ${
                    width ? '-w ' + width : ''
                  } ${input}`,
                ).then(() => {
                  output('已完成转码!请到视频原目录查看')
                  showInfo('已完成转码!请到视频原目录查看')
                  vscode.commands.executeCommand('extension.refreshTreeView')
                  // this.refresh()
                })
              })
          })
      } else {
        vscode.window
          .showInputBox({
            prompt: '请输入转码后视频的宽度',
            placeHolder: '例如 640 720 1920 等',
          })
          .then((width) => {
            if (width) {
              output(`输入的宽度是：${width}`)
            } else {
              output(`需要输入一个宽度`)
              return
            }
            vscode.window
              .showInputBox({
                prompt: '请输入其他视频转码参数',
                placeHolder: '-crf 20',
              })
              .then((input) => {
                if (input) {
                  output(`输入的其他参数是：${input}`)
                }
                output('正在准备中...')
                showInfo('正在准备中...')
                executeShellCommand(
                  `sh ${extensionPath}/media/convert.sh ${mp4Path} ${
                    width ? '-w ' + width : ''
                  } ${input}`,
                ).then(() => {
                  output('已完成转码!请到视频原目录查看')
                  showInfo('已完成转码!请到视频原目录查看')
                  vscode.commands.executeCommand('extension.refreshTreeView')
                  // this.refresh()
                })
              })
          })
      }
    },
  )

  // console.log(extensionPath, mp4Path)

  // vscode.window.showInformationMessage(args)
}
