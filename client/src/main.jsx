import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ContextProvider from './context/ContextProvider.jsx';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ContextProvider>
            <App />
        </ContextProvider>
    </React.StrictMode>
)