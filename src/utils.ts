import * as vscode from 'vscode'
import { exec } from 'child_process'
export function showInfo(info: string, delay?: number) {
  const infoMessage = vscode.window.setStatusBarMessage(info)
  if (delay && delay > 0) {
    setTimeout(() => {
      infoMessage.dispose() // 隐藏信息消息
    }, delay)
  }
}

export function alertInfo(info: string) {
  vscode.window.showInformationMessage(info)
}
const outputChannel = vscode.window.createOutputChannel('create zn template')
export function output(str: string) {
  outputChannel.appendLine(str)
}

export function executeShellCommand(command: string, cwd?: string) {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command, { cwd: cwd })

    // 监听标准输出数据事件
    childProcess.stdout?.on('data', (data) => {
      const output = data.toString()
      // 处理输出信息
      // console.log(output)
      // showInfo(output)
      outputChannel.append(output)
    })

    // 监听标准错误输出数据事件
    childProcess.stderr?.on('data', (data) => {
      const errorOutput = data.toString()
      // 处理错误信息
      // console.error(errorOutput)
      // showInfo(errorOutput)
      outputChannel.append(errorOutput)
    })

    // 监听子进程的关闭事件
    childProcess.on('close', (code) => {
      if (code === 0) {
        // outputChannel.show()
        resolve(code)
      } else {
        reject(new Error(`Command execution failed with code ${code}`))
      }
    })
  })
}

export function getCurrentDirectory() {
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

export const getMP4Files = async () => {
  const filePattern = '**/*.{mp4,mov,m4v,flv}'
  const files = await vscode.workspace.findFiles(filePattern)
  return files
}

export function getFileName(uri: vscode.Uri): string {
  const pathSegments = uri.path.split('/')
  return pathSegments[pathSegments.length - 1]
}
export function getExtension(filePath: string): string {
  const extStart = filePath.lastIndexOf('.')
  return filePath.substring(extStart).toLowerCase().replace('.', '')
}
