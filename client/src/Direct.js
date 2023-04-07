import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import GameView from './GameView';

const Direct = () => {
    return(
        <BrowserRouter>
            <Routes>
                <Route index element={<App/>} />
                <Route path="/game" element={<GameView/>}/>
            </Routes>
        </BrowserRouter>
    );
    
    
}

export default Direct;