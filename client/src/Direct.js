import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Options from './Options';

const Direct = () => {
    return(
        <BrowserRouter>
            <Routes>
                <Route index element={<App/>} />
                <Route path="/options" element={<App/>}/>
            </Routes>
        </BrowserRouter>
    );
    
    
}

export default Direct;