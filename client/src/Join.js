import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Join.css";

function Join({pid}) {
    const nav = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        nav("/game", {
            state: {
               playlistId: pid,
               gameCode: event.target.username.value
            }
        });
    }
    return(<>
        <div class="container">
            <h1>Enter a Join Code</h1>
            <form onSubmit={handleSubmit}>
                <input class="j-input" type="text" name="username"/>
                <br/>
                <button class="p-btn j-btn" type="submit">Submit</button>
            </form>
            

        </div>
        
    </>);
}

export default Join;