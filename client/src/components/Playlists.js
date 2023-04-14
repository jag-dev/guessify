import React, { useState } from "react";
import axios from "axios";

import Options from './Options';
import "../css/Playlists.css";
import "bootstrap/dist/css/bootstrap.min.css";

const PLAYLIST_ENDPOINT = "https://api.spotify.com/v1/me/playlists";

function Playlists({accessToken}) {
    const [token, setToken] = useState(accessToken);
    const [name, setName] = useState("");
    const [playlistId, setPlaylistId] = useState("");
    const [playlistData, setPlaylistData] = useState({});
    const [viewingPlaylist, setViewingPlaylist] = useState(false);

    const logout = () => {
        setToken("");
        setPlaylistData({});
        setViewingPlaylist(false);
        window.localStorage.removeItem("token");
        window.location.reload(false);
    }

    const getPlaylists = () => {
        axios.get(PLAYLIST_ENDPOINT, {
            headers: { Authorization: "Bearer " + token } 
        }).then((response) => {
            setPlaylistData(response.data);
        }).catch((error) => {
            console.log(error);
        });
        setViewingPlaylist(true);
    }

    const handleName = (event) => {
        event.preventDefault();
        setName(event.target.username.value);
        getPlaylists();
    }

    if (playlistId !== "") {
        return(<>
            <button className="logout-btn lo" onClick={logout}>Logout</button>
            <Options name={name} pid={playlistId} token={token}/>
        </>);
    }

    
    return(
        <div className="playlist-wrapper">
            <button className="logout-btn" onClick={logout}>Logout</button>
            {viewingPlaylist ? 
                <h2>Select Playlists</h2>
                :
                <form onSubmit={handleName}>
                    <h3>Enter a Name</h3>
                    <input className="j-input" type="text" name="username"/>
                    <br/>
                    <button className="p-btn" type="submit">Pick Playlists</button> 
                </form>
                
            }
            <div className="container">
                <div className="row">
                    { playlistData?.items ? 
                        playlistData.items.map((item) => 
                            <div key={item.id} className="col-sm-3">
                                <div className="card">
                                    <img className="card-img-top" src={item.images[0].url} alt="playlist artwork"></img>
                                    <div className="card-body">
                                        <h5 className="card-title">{item.name}</h5>
                                        <p className="card-text">{item.tracks.total} Songs</p>
                                        <button onClick={() => setPlaylistId(item.id)} className="btn btn-primary">Use</button>
                                    </div>
                                    
                                </div>
                            </div>
                        )
                        : null 
                    }
                </div>
            </div>
        </div>         
    );
}

export default Playlists;