import * as vscode from 'vscode'
import { executeShellCommand, getMP4Files, output } from './utils'
export class MP4FilesTreeDataProvider
  implements vscode.TreeDataProvider<MP4File>
{
  private _extensionPath: string

  constructor(extensionPath: string) {
    this._extensionPath = extensionPath
  }
  getTreeItem(element: MP4File): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  getChildren(element?: MP4File): vscode.ProviderResult<MP4File[]> {
    if (element) {
      return [] // 返回空数组，即叶子节点无子节点
    }

    return getMP4FilesInWorkspace(this._extensionPath)
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
}

export function openMP4File(extensionPath: string, mp4Path: string) {
  output(mp4Path)
  executeShellCommand(`sh ${extensionPath}/src/info.sh ${mp4Path}`).then(() => {
    // console.log('执行完毕')
    vscode.window
      .showInputBox({
        prompt: '请输入转码后视频的宽度',
        placeHolder: '例如 640 720 1920 等',
      })
      .then((width) => {
        if (width) {
          // 在这里根据用户输入的值执行相应的操作
          // vscode.window.showInformationMessage(`你输入的是：${width}`)
          output(`输入的宽度是：${width}`)
          vscode.window
            .showInputBox({
              prompt: '请输入其他视频转码参数',
              placeHolder: '-crf 20',
            })
            .then((input) => {
              if (input) {
                output(`输入的其他参数是：${input}`)
              }
              output('正在准备中')
              executeShellCommand(
                `sh ${extensionPath}/src/convert.sh ${mp4Path} -w ${width} ${input}`,
              ).then(() => {
                output('已完成转码!请到视频原目录查看')
              })
            })
        } else {
          // vscode.window.showWarningMessage('未提供有效输入！')
        }
      })
  })

  // console.log(extensionPath, mp4Path)

  // vscode.window.showInformationMessage(args)
}
function getFileName(uri: vscode.Uri): string {
  const pathSegments = uri.path.split('/')
  return pathSegments[pathSegments.length - 1]
}
async function getMP4FilesInWorkspace(
  extensionPath: string,
): Promise<MP4File[]> {
  const workspaceFolders = vscode.workspace.workspaceFolders
  const mp4Files: MP4File[] = []

  if (workspaceFolders) {
    const files = await getMP4Files()

    for (const file of files) {
      const mp4File = new MP4File(getFileName(file), file.fsPath, extensionPath)
      mp4Files.push(mp4File)
    }
  }

  return mp4Files
}
