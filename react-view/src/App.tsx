import { useState } from 'react'
import './App.css'
import { postMsg } from './utils'

postMsg({ type: 'init', text: 'hello vscode' })

function App() {
  const [count, setCount] = useState(0)
  const [files, setFiles] = useState([])
  window.addEventListener('message', (event) => {
    const message = event.data
    console.log(message)
    switch (message.type) {
      case 'files':
        setFiles(message.filesPath)
        break

      default:
        break
    }
  })
  const sendMsg = () => {
    setCount(count + 1)
  }

  const clickFile = (str: string) => {
    console.log(str)
  }

  return (
    <>
      <div>
        <div>{count}</div>
        <div onClick={sendMsg}>send</div>
        {files.map((el) => (
          <div onClick={() => clickFile(el)}>{el}</div>
        ))}
      </div>
    </>
  )
}

export default App
