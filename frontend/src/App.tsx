import './App.css'
import MainRoutes from './routes/MainRoutes'
import { ThemeProvider } from "./components/theme-provider";

function App() {


  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <MainRoutes />
      </ThemeProvider>
    </>
  )
}

export default App
