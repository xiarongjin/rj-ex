import { TreeDataNode } from 'antd'
import { filesItems } from './components/MyBoard'

let vscodeApi = window
try {
  // @ts-expect-error vscode
  vscodeApi = acquireVsCodeApi()
} catch (error) {
  /* empty */
}

interface MsgData {
  type: 'init' | 'filesMap'
  text: string
  filesMap?: filesItems[]
}
export const postMsg = (data: MsgData) => {
  vscodeApi.postMessage(data)
  console.log(data)
}

const filesArr: string[] = [
  '/Users/xiarongjin/Desktop/upup/extension/test/src/assets/videos/test_320.flv',
  '/Users/xiarongjin/Desktop/upup/extension/test/src/assets/videos/4k-1_944.flv',
  '/Users/xiarongjin/Desktop/upup/extension/test/src/assets/videos/test_2500k.mp4',
  '/Users/xiarongjin/Desktop/upup/extension/test/src/assets/videos/test.mp4',
  '/Users/xiarongjin/Desktop/upup/extension/test/src/assets/videos/3.m4v',
  '/Users/xiarongjin/Desktop/upup/extension/test/src/assets/videos/cn_mo.mp4',
  '/Users/xiarongjin/Desktop/upup/extension/test/src/assets/videos/9-16.mov',
  '/Users/xiarongjin/Desktop/upup/extension/test/src/assets/videos/cn_mo_640.flv',
  '/Users/xiarongjin/Desktop/upup/extension/test/src/assets/videos/cn_mo_320.flv',
  '/Users/xiarongjin/Desktop/upup/extension/test/src/assets/videos/particle-pc_1920.flv',
  '/Users/xiarongjin/Desktop/upup/extension/test/2_640.flv',
  '/Users/xiarongjin/Desktop/upup/extension/test/2.m4v',
]
export const getFilesArr = () => {
  return filesArr
}
export async function writeClipboardText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.error(error)
  }
}

export function getFileName(path: string): string {
  const pathSegments = path.split('/')
  return pathSegments[pathSegments.length - 1]
}
export function getExtension(filePath: string): string {
  const extStart = filePath.lastIndexOf('.')
  return filePath.substring(extStart).toLowerCase().replace('.', '')
}

export const getTreeDataMap = (filesArr: string[]) => {
  const treeDataMap = new Map<string, TreeDataNode>()
  filesArr.map((el) => {
    const key = getExtension(el)
    const title = getFileName(el)
    const value = treeDataMap.get(key)
    if (value) {
      value.children?.push({ title, key: el, isLeaf: true })
    } else {
      treeDataMap.set(key, {
        title: key,
        key,
        children: [{ title, key: el, isLeaf: true }],
      })
    }
  })

  return treeDataMap
}
