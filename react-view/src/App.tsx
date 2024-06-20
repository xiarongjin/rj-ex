import React, { useEffect, useState } from 'react'
import { Modal, Tree, message } from 'antd'
import type { GetProps, TreeDataNode } from 'antd'
import './App.css'
import {
  getFilesArr,
  getTreeDataMap,
  postMsg,
  writeClipboardText,
} from './utils'
import { CopyOutlined } from '@ant-design/icons'
import { FileGroup, filesItems } from './components/MyBoard'
import { useGlobalContext } from './components/GlobalProvider'
import Search, { SearchProps } from 'antd/es/input/Search'

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>

const { DirectoryTree } = Tree
// console.log(getTreeDataMap(getFilesArr()))
postMsg({ type: 'init', text: 'hello vscode' })
const App: React.FC = () => {
  const { globalObject, setGlobalObject } = useGlobalContext()

  // console.log(globalObject.filesArr)
  const [treeData, setTreeData] = useState<TreeDataNode[]>([])
  const [treeDataView, setTreeDataView] = useState<TreeDataNode[]>([])
  // const treeData: TreeDataNode[] = []
  useEffect(() => {
    console.log(globalObject.filesArr, 'tset')
    if (import.meta.env.DEV) {
      setGlobalObject({ filesArr: getFilesArr() })
    }
    if (globalObject.filesArr) {
      const treeDataMap = getTreeDataMap(globalObject.filesArr)
      const treeDataStatic: TreeDataNode[] = []
      treeDataMap.forEach((v) => {
        treeDataStatic.push(v)
      })
      setTreeData(treeDataStatic)
    }
  }, [globalObject.filesArr])

  const [messageApi, contextHolder] = message.useMessage()

  const [select, setSelect] = useState<TreeDataNode[]>([])
  const [selectLeaf, setSelectLeaf] = useState<TreeDataNode[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  let filesMap = new Map<string, filesItems>()

  useEffect(() => {
    // 筛选掉非子叶节点
    const files = select.filter((el) => el.isLeaf)
    setSelectLeaf(files)
  }, [select])

  const getFilesMap = (map: Map<string, filesItems>) => {
    filesMap = map
  }

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    console.log(filesMap)
    postMsg({
      type: 'filesMap',
      text: '需处理的视频 Map',
      filesMap: Array.from(filesMap.values()),
    })
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const onSelect: DirectoryTreeProps['onSelect'] = (__, info) => {
    // console.log('Trigger Select', keys, info)
    // const dataNodes = info.selectedNodes as TreeDataNode[]
    setSelect(info.selectedNodes as TreeDataNode[])
  }

  // const onExpand: DirectoryTreeProps['onExpand'] = (keys, info) => {
  // console.log('Trigger Expand', keys, info)
  // }
  const [searchKey, setSearchKey] = useState<string>('')
  useEffect(() => {
    const filterFilesArr = globalObject.filesArr?.filter((el) => {
      return el.includes(searchKey)
    })

    if (filterFilesArr) {
      const treeDataMap = getTreeDataMap(filterFilesArr)
      const treeDataStatic: TreeDataNode[] = []
      treeDataMap.forEach((v) => {
        treeDataStatic.push(v)
      })
      setTreeDataView(treeDataStatic)
    }
  }, [searchKey, treeData])
  const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
    setSearchKey(value)
  }

  return (
    <div style={{ minWidth: '600px' }}>
      {contextHolder}
      <Search
        placeholder="input search text"
        onSearch={onSearch}
        style={{ width: 200 }}
      />
      <DirectoryTree
        multiple
        defaultExpandAll
        onSelect={onSelect}
        // onExpand={onExpand}
        onContextMenu={(e) => {
          e.preventDefault()
          if (selectLeaf?.length > 0) {
            showModal()
          }
        }}
        treeData={treeDataView}
        titleRender={(node) => (
          <>
            <>{node.title}</>
            <CopyOutlined
              style={{ marginLeft: '40px' }}
              onClick={async (e) => {
                e.stopPropagation()
                writeClipboardText(node.title as string)
                  .then(() => {
                    messageApi.open({
                      type: 'success',
                      content: '文件名复制成功',
                    })
                  })
                  .catch((error) => {
                    messageApi.open({
                      type: 'error',
                      content: error,
                    })
                  })
              }}
            />
          </>
        )}
      />
      <Modal
        title="已选择"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{ minWidth: '400px' }}
      >
        <>
          <FileGroup
            selectLeaf={selectLeaf}
            setFilesMap={getFilesMap}
          ></FileGroup>
        </>
      </Modal>
    </div>
  )
}

export default App
