import React, { useEffect, useState } from "react";
import Join from './Join';
import Create from './Create';

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Options.css";

function Options({pid}) {
    const [choice, setChoice] = useState("");

    if (choice == "create") { return(<Create pid={pid}/>); }
    if (choice == "join") { return(<Join pid={pid}/>); }


    return(<>
        <div class="container" style={{marginTop: 3 + 'em'}}>
            <button onClick={() => setChoice("create")} class="p-btn o-btn">Create</button>
            <button onClick={() => setChoice("join")} class="p-btn o-btn">Join</button>
        </div>
    </>);
}

export default Options;