import React, { useEffect, useState } from "react";
import Join from './Join';
import Create from './Create';

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Options.css";

function Options({name, pid, token}) {
    const [choice, setChoice] = useState("");

    if (choice == "create") { return(<Create name={name} pid={pid} token={token}/>); }
    if (choice == "join") { return(<Join name={name} pid={pid} token={token}/>); }


    return(<>
        <div class="container o-container">
            <h1>Select an Option</h1>
            <p>Join or create a new game</p>
            <button onClick={() => setChoice("create")} class="p-btn o-btn">Create</button>
            <button onClick={() => setChoice("join")} class="p-btn o-btn">Join</button>
        </div>
    </>);
}

export default Options;