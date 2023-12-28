import * as vscode from 'vscode'
import { exec } from 'child_process'
function executeShellFile(extensionPath: string) {
  const shellFilePath = vscode.Uri.joinPath(
    vscode.Uri.file(extensionPath),
    'media',
    'preset.sh',
  ).fsPath

  exec(`chmod +x ${shellFilePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(
        `Error setting permissions for shell file: ${shellFilePath}`,
      )
      return
    }

    exec(shellFilePath + '', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing shell file: ${shellFilePath}`)
        return
      }

      console.log(`Output: ${stdout}`)
    })
  })
}

function executeShellCommand(command: string, cwd?: string) {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command, { cwd: cwd })

    // 监听标准输出数据事件
    childProcess.stdout?.on('data', (data) => {
      const output = data.toString()
      // 处理输出信息
      console.log(output)
      showInfo(output)
    })

    // 监听标准错误输出数据事件
    childProcess.stderr?.on('data', (data) => {
      const errorOutput = data.toString()
      // 处理错误信息
      console.error(errorOutput)
      showInfo(errorOutput)
    })

    // 监听子进程的关闭事件
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error(`Command execution failed with code ${code}`))
      }
    })
  })
}

function pullGitRepository(repoUrl: string, currentDirectory: string) {
  return executeShellCommand(`git clone ${repoUrl} ${currentDirectory}`)
}

function showInfo(info: string, delay?: number) {
  const infoMessage = vscode.window.setStatusBarMessage(`${info}`)
  if (delay && delay > 0) {
    setTimeout(() => {
      infoMessage.dispose() // 隐藏信息消息
    }, delay)
  }
}

function getCurrentDirectory() {
  const workspaceFolders = vscode.workspace.workspaceFolders

  if (workspaceFolders && workspaceFolders.length > 0) {
    // 获取第一个工作区的根路径
    const workspaceFolder = workspaceFolders[0]
    return workspaceFolder.uri.fsPath
  }

  // 如果没有打开的工作区，则返回活动编辑器中打开的文件的所在目录
  const activeTextEditor = vscode.window.activeTextEditor
  if (activeTextEditor) {
    const activeFilePath = activeTextEditor.document.uri.fsPath
    return (
      vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri)?.uri
        .fsPath ?? activeFilePath
    )
  }

  // 如果都没找到，则返回默认的工作目录（通常是插件所在的目录）
  return __dirname
}

export class SidebarInputProvider implements vscode.WebviewViewProvider {
  private _webviewView: vscode.WebviewView | undefined
  private _extensionPath: string

  constructor(extensionPath: string) {
    this._extensionPath = extensionPath
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<any>,
    token: vscode.CancellationToken,
  ): void {
    this._webviewView = webviewView
    this._webviewView.webview.options = {
      enableScripts: true,
    }

    // Set the title of the view
    this._webviewView.title = 'init repo'

    // Listen for messages from the webview
    this._webviewView.webview.onDidReceiveMessage((message) => {
      console.log(message)

      switch (message.command) {
        case 'init':
          const data = message.data
          console.log(data)
          const repoUrl = data.preset
          const repoName = data.name
          const currentDirectory = getCurrentDirectory() + '/' + repoName
          // console.log(currentDirectory)

          pullGitRepository(repoUrl, currentDirectory).then(() => {
            console.log('clone finish')
            showInfo('clone finish')
            executeShellCommand(`rm -rf ${currentDirectory}/.git`).then(() => {
              // showInfo("rm .git",500);
              if (data.new) {
                showInfo('正在初始化仓库～')
                executeShellCommand(
                  `git init && git add . && git commit -m "first commit" && git branch -M master`,
                  currentDirectory,
                ).then(() => {
                  showInfo('正在与新仓库关联～')
                  executeShellCommand(
                    `git remote add origin ${data.new} && git push -u origin master`,
                    currentDirectory,
                  ).then(() => {
                    showInfo('关联并推送成功！')
                  })
                })
              }
            })
          })

          // executeShellFile(this._extensionPath);
          // Handle the input data logic
          break
      }
    })

    this.updateWebview()
  }

  public updateWebview() {
    if (this._webviewView) {
      this._webviewView.webview.html = this.getWebviewContent()
    }
  }

  private getWebviewContent(): string {
    const scriptUri = vscode.Uri.file(
      vscode.Uri.joinPath(
        vscode.Uri.file(this._extensionPath),
        'media',
        'script.js',
      ).fsPath,
    )
    const scriptSrc = this._webviewView?.webview.asWebviewUri(scriptUri)

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <style>
            #submit {
              background: #3376cd;
              color: white;
              text-align: center;
              width:80vw;
              margin: auto;
              margin-top: 10px;
              padding: 8px;
            }
            input{
              width: 80vw;
              padding: 8px;
              margin: 5px auto 10px;
            }
          </style>
        </head>
        <body>
          <div>模版地址：</div>
          <input id="preset-repo" placeholder="默认为 preset-app" type="text">
          <div>新项目地址：</div>
          <input id="new-repo" placeholder="不填的话需手动关联" type="text">
          <div>新项目名称：</div>
          <input id="repo-name" type="text" placeholder="默认为 preset-app">
          <button id="submit">Submit</button>
          <script src="${scriptSrc}"></script>
        </body>
        </html>
    `
  }
}
