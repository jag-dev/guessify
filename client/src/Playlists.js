import React, { useEffect, useState } from "react";
import axios from "axios";

import Options from './Options';
import "./css/Playlists.css";
import "bootstrap/dist/css/bootstrap.min.css";

const PLAYLIST_ENDPOINT = "https://api.spotify.com/v1/me/playlists";

function Playlists({accessToken}) {
    const [token, setToken] = useState("");
    const [name, setName] = useState("");
    const [playlistId, setPlaylistId] = useState("");
    const [playlistData, setPlaylistData] = useState({});
    const [viewingPlaylist, setViewingPlaylist] = useState(false);

    useEffect(() => {
        setToken(accessToken);
    }, []);

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
        console.log(event.target.username.value)
        setName(event.target.username.value);
        getPlaylists();
    }

    if (playlistId != "") {
        return(<>
            <button class="logout-btn lo" onClick={logout}>Logout</button>
            <Options name={name} pid={playlistId} token={token}/>
        </>);
    }

    
    return(
        <div class="playlist-wrapper">
            <button class="logout-btn" onClick={logout}>Logout</button>
            {viewingPlaylist ? 
                <h2>Select Playlists</h2>
                :
                <form onSubmit={handleName}>
                    <h3>Enter a Name</h3>
                    <input class="j-input" type="text" name="username"/>
                    <br/>
                    <button class="p-btn" type="submit">Pick Playlists</button> 
                </form>
                
            }
            <div class="container">
                <div class="row">
                    { playlistData?.items ? 
                        playlistData.items.map((item, i) => 
                            <div class="col-sm-3">
                                <div class="card">
                                    <img class="card-img-top" src={item.images[1].url}></img>
                                    <div class="card-body">
                                        <h5 class="card-title">{item.name}</h5>
                                        <p class="card-text">{item.tracks.total} Songs</p>
                                        <button onClick={() => setPlaylistId(item.id)} class="btn btn-primary">Use</button>
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