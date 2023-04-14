import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './components/App'; 
import GameView from './components/GameView';

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