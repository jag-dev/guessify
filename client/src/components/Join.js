import { useNavigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Join.css";

function Join({name, pid, token}) { 
    const nav = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        nav("/game", {
            state: {
               playlistId: pid,
               token: token,
               name: name,
               gameCode: event.target.username.value
            }
        });
    }
    return(<>
        <div className="container j-container">
            <h1>Enter a Join Code</h1>
            <p>A unique code used to join a specific game</p>
            <form onSubmit={handleSubmit}>
                <input className="j-input" type="text" name="username"/>
                <br/>
                <button className="p-btn j-btn" type="submit">Submit</button>
            </form>
            

        </div>
        
    </>);
}

export default Join;