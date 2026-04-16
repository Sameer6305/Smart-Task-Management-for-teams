import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter — must wrap everything that uses React Router */}
    <BrowserRouter>
      {/* AuthProvider — supplies useAuth() context to the entire tree */}
      <AuthProvider>
        {/* App owns routing + Toaster */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
