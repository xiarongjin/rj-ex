import * as vscode from 'vscode'

import {
  alertInfo,
  executeShellCommand,
  getCurrentDirectory,
  showInfo,
} from './utils'

function pullGitRepository(repoUrl: string, currentDirectory: string) {
  return executeShellCommand(`git clone ${repoUrl} ${currentDirectory}`)
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
          try {
            pullGitRepository(repoUrl, currentDirectory).then(() => {
              console.log('clone finish')
              showInfo('clone finish')
              executeShellCommand(`rm -rf ${currentDirectory}/.git`).then(
                () => {
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
                },
              )
            })
          } catch (error) {
            alertInfo(error + '')
          }

          break
      }
    })

    this.updateWebview()
  }

  public async updateWebview() {
    if (this._webviewView) {
      this._webviewView.webview.html = await this.getWebviewContent()
    }
  }

  private async getWebviewContent(): Promise<string> {
    const scriptUri = vscode.Uri.file(
      vscode.Uri.joinPath(
        vscode.Uri.file(this._extensionPath),
        'media',
        'script.js',
      ).fsPath,
    )
    const scriptSrc = this._webviewView?.webview.asWebviewUri(scriptUri)
    const cssUri = vscode.Uri.file(
      vscode.Uri.joinPath(
        vscode.Uri.file(this._extensionPath),
        'media',
        'index.css',
      ).fsPath,
    )
    const cssSrc = this._webviewView?.webview.asWebviewUri(cssUri)
    const content = await vscode.workspace.fs.readFile(
      vscode.Uri.joinPath(
        vscode.Uri.file(this._extensionPath),
        'media',
        'index.html',
      ),
    )
    const addJs = Buffer.from(content)
      .toString('utf-8')
      .replace('<script></script>', `<script src="${scriptSrc}"></script>`)
    const addCss = addJs.replace(
      '<styleFile></styleFile>',
      `<link rel="stylesheet" type="text/css" href="${cssSrc}">`,
    )
    return addCss
  }
}
