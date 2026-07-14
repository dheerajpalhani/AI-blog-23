import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App.jsx'

// React 19 findDOMNode compatibility patch for react-quill
if (ReactDOM) {
  const patchFindDOMNode = (el) => {
    if (el == null) return null;
    if (el instanceof HTMLElement) return el;
    return el.current || el;
  };
  if (!ReactDOM.findDOMNode) {
    ReactDOM.findDOMNode = patchFindDOMNode;
  }
  if (ReactDOM.default && !ReactDOM.default.findDOMNode) {
    ReactDOM.default.findDOMNode = patchFindDOMNode;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
