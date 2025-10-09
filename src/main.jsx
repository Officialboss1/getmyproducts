import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "antd/dist/reset.css"
import { App as AntApp } from "antd";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AntApp>
    <App />
    </AntApp>
  </StrictMode>,
)
