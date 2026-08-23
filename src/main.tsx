import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App'
import { AppProvider } from './context/app'
import { WorkspaceProvider } from './context/workspace'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <WorkspaceProvider>
          <App />
        </WorkspaceProvider>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
