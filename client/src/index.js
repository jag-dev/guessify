import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './components/App'; 
import GameView from './components/GameView';

import './css/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Routes>
            <Route index element={<App/>} />
            <Route path="/game" element={<GameView/>}/>
        </Routes>
    </BrowserRouter>
);
