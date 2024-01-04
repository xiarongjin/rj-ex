import * as vscode from 'vscode'
export class ReactViewProvider implements vscode.WebviewViewProvider {
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
