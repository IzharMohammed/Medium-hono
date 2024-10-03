import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import SocketContextProvider from './context/socketContext.tsx'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <SocketContextProvider>
      <App />
      <Toaster/>
    </SocketContextProvider>
  </BrowserRouter>
)
