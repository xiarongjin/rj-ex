// export const MyBoard = (props: { selectLeaf: TreeDataNode }) => {}

import { Flex, Input, Radio } from 'antd'
import { ReactNode, useEffect, useState } from 'react'
import type { RadioChangeEvent, TreeDataNode } from 'antd'

export interface filesItems {
  title?: string
  key: string
  url?: string
  crf?: number
  width?: number
  type?: string
  options?: string
}

export const FileGroup = (props: {
  selectLeaf: TreeDataNode[]
  setFilesMap: (map: Map<string, filesItems>) => void
}) => {
  const filesMap = new Map()
  const setNewItem = (item: filesItems) => {
    filesMap.set(item.key, item)
    props.setFilesMap(filesMap)
  }
  return (
    <>
      <Flex style={{ marginTop: '4px' }}>
        <div style={{ width: '120px', paddingRight: '10px' }}>文件名</div>
        <div style={{ width: '80px' }}>crf</div>
        <div style={{ width: '80px', marginLeft: '4px' }}>宽度</div>
        <div style={{ width: '200px', marginLeft: '4px' }}>格式</div>
        <div style={{ width: '140px', marginLeft: '4px' }}>其他参数</div>
      </Flex>
      {props.selectLeaf.map((el) => {
        return (
          <div key={el.key}>
            <FileItem
              item={el}
              title={el.title as React.ReactNode}
              setNewItem={setNewItem}
            ></FileItem>
          </div>
        )
      })}
    </>
  )
}

export const FileItem = (props: {
  item: TreeDataNode
  title: ReactNode
  setNewItem: (item: filesItems) => void
}) => {
  const [value1, setValue1] = useState('flv')
  const onChange1 = ({ target: { value } }: RadioChangeEvent) => {
    setValue1(value)
  }
  // const plainOptions = ['flv', 'mp4']

  const [crf, setCrf] = useState(20)
  const [width, setWidth] = useState(640)
  const [options, setOptions] = useState('')
  useEffect(() => {
    props.setNewItem({
      key: props.item.key as string,
      crf: crf,
      width: width,
      type: (props.title as string).includes('.flv') ? 'mp4' : value1,
      options,
    })
  }, [crf, value1, props, width, options])

  // const filesMap = props.filesMap?.set(props.item.key as string, {
  //   key: props.item.key as string,
  // })
  // props.setFilesMap(filesMap)
  return (
    <Flex style={{ marginTop: '4px' }}>
      <div style={{ width: '120px', paddingRight: '10px' }}>{props.title}</div>
      <Input
        placeholder="20"
        variant="filled"
        size="small"
        value={crf}
        onChange={(e) => {
          setCrf(Number(e.target.value))
        }}
        max="25"
        min="16"
        type="number"
        style={{ width: '80px' }}
      />
      <Input
        placeholder="640"
        variant="filled"
        size="small"
        value={width}
        onChange={(e) => {
          setWidth(Number(e.target.value))
        }}
        type="number"
        style={{ width: '80px', marginLeft: '4px' }}
      />
      <Flex style={{ width: '200px', marginLeft: '10px' }}>
        <Radio.Group
          options={
            (props.title as string).includes('.flv') ? ['mp4'] : ['flv', 'mp4']
          }
          onChange={onChange1}
          value={(props.title as string).includes('.flv') ? 'mp4' : value1}
        />
      </Flex>
      <Input
        placeholder="其他参数"
        variant="filled"
        size="small"
        value={options}
        onChange={(e) => {
          setOptions(e.target.value)
        }}
        type="number"
        style={{ width: '140px', marginLeft: '4px' }}
      />
    </Flex>
  )
}
