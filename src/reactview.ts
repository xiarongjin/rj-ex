import * as vscode from 'vscode'
import { executeShellCommand, getMP4Files, output, showInfo } from './utils'
interface filesItems {
  title?: string
  key: string
  url?: string
  crf?: number
  width?: number
  type?: string
  options?: string
}
function* customIterator(arr: filesItems[]) {
  for (let i = 0; i < arr.length; i++) {
    yield arr[i]
  }
}
export class ReactViewProvider implements vscode.WebviewViewProvider {
  private _webviewView: vscode.WebviewView | undefined
  private _extensionPath: string

  constructor(extensionPath: string) {
    this._extensionPath = extensionPath
  }
  public updateFiles() {
    getMP4Files().then((files) => {
      const filesPath = files.map((el) => {
        return el.path.replace(this._extensionPath, '')
      })
      this._webviewView?.webview.postMessage({
        type: 'files',
        filesPath: filesPath,
      })
    })
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
    this._webviewView.title = 'auto video webView'
    const that = this
    // Listen for messages from the webview
    this._webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case 'init':
          this.updateFiles()
          break
        case 'filesMap':
          console.log(message, 'test')

          const filesMap = message.filesMap as filesItems[]

          const iterator = customIterator(filesMap)

          function executeNext() {
            const result = iterator.next()
            // const filesItem = result.value as filesItems

            // executeShellCommand(
            //   `sh ${that._extensionPath}/media/convert.sh ${filesItem.key} ${
            //     filesItem.width ? '-w ' + filesItem.width : ''
            //   } ${filesItem.crf ? '-crf ' + filesItem.crf : ''} ${
            //     filesItem.options
            //   }`,
            // ).then(() => {
            //   output('已完成转码!请到视频原目录查看')
            //   showInfo('已完成转码!请到视频原目录查看')
            //   // vscode.commands.executeCommand('extension.refreshTreeView')
            //   that.updateWebview()
            // })
            if (!result.done) {
              console.log('Executing element:', result.value)
              const filesItem = result.value as filesItems
              if (filesItem.type === 'flv') {
                executeShellCommand(
                  `sh ${that._extensionPath}/media/convert.sh ${
                    filesItem.key
                  } ${filesItem.width ? '-w ' + filesItem.width : ''} ${
                    filesItem.crf ? '-crf ' + filesItem.crf : ''
                  } ${filesItem.options}`,
                ).then(() => {
                  output('已完成转码!请到视频原目录查看')
                  showInfo('已完成转码!请到视频原目录查看')
                  // vscode.commands.executeCommand('extension.refreshTreeView')
                  that.updateFiles()
                  executeNext()
                })
              } else {
                executeShellCommand(
                  `sh ${that._extensionPath}/media/convert.sh ${
                    filesItem.key
                  } ${filesItem.width ? '-w ' + filesItem.width : ''} ${
                    filesItem.crf ? '-crf ' + filesItem.crf : ''
                  } ${filesItem.options} -fmt mp4`,
                ).then(() => {
                  output('已完成转码!请到视频原目录查看')
                  showInfo('已完成转码!请到视频原目录查看')
                  // vscode.commands.executeCommand('extension.refreshTreeView')
                  that.updateFiles()
                  executeNext()
                })
              }

              // setTimeout(executeNext, 1000) // 模拟延迟执行
            } else {
              console.log('Iteration completed.')
            }
          }
          executeNext()
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
    const cssUri = vscode.Uri.file(
      vscode.Uri.joinPath(
        vscode.Uri.file(this._extensionPath),
        'react-view/dist',
        'index.css',
      ).fsPath,
    )
    const cssSrc = this._webviewView?.webview.asWebviewUri(cssUri)
    const content = await vscode.workspace.fs.readFile(
      vscode.Uri.joinPath(
        vscode.Uri.file(this._extensionPath),
        'react-view/dist',
        'index.html',
      ),
    )

    let html = Buffer.from(content).toString('utf-8')

    const matchResult = html.match(/src="([^"]*)"/)
    if (matchResult) {
      const scriptUri = vscode.Uri.file(
        vscode.Uri.joinPath(
          vscode.Uri.file(this._extensionPath),
          'react-view/dist',
          matchResult[1],
        ).fsPath,
      )
      const scriptSrc = this._webviewView?.webview.asWebviewUri(scriptUri)
      if (scriptSrc) {
        html = html.replace(matchResult[1], `${scriptSrc}`)
      }
    }

    const hrefArr = html.match(/href="([^"]*)"/g)
    hrefArr?.map((el) => {
      const res = el.match(/"([^"]*)"/)
      if (res) {
        const resUri = vscode.Uri.file(
          vscode.Uri.joinPath(
            vscode.Uri.file(this._extensionPath),
            'react-view/dist',
            res[1],
          ).fsPath,
        )

        const resSrc = this._webviewView?.webview.asWebviewUri(resUri)
        if (resSrc) {
          html = html.replace(res[1], `${resSrc}`)
        }
      }
    })
    // return addCss.replaceAll('/assets/', publicAssets.fsPath)
    return html
  }
}
