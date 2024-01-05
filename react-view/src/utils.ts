const vscode = acquireVsCodeApi()

interface MsgData {
  type: 'init'
  text: string
}
export const postMsg = (data: MsgData) => {
  vscode.postMessage(data)
}
