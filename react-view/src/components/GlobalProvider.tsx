import React, {
  createContext,
  useContext,
  useState,
  FC,
  ReactNode,
} from 'react'

interface GlobalContextType {
  globalObject: { filesArr?: string[] }
  setGlobalObject: React.Dispatch<React.SetStateAction<{ filesArr?: string[] }>>
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider')
  }
  return context
}
interface GlobalProviderProps {
  children: ReactNode
}

export const GlobalProvider: FC<GlobalProviderProps> = ({ children }) => {
  const [globalObject, setGlobalObject] = useState<{ filesArr?: string[] }>({})
  window.addEventListener(
    'message',
    (event) => {
      // console.log('Received message: ', event.data)
      // console.log(filesArr)
      switch (event.data.type) {
        case 'files':
          console.log(event.data, 'test')
          setGlobalObject({ filesArr: event.data.filesPath })
          break

        default:
          break
      }
    },
    false,
  )
  return (
    <GlobalContext.Provider value={{ globalObject, setGlobalObject }}>
      {children}
    </GlobalContext.Provider>
  )
}
