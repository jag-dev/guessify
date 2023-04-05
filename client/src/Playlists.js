import React, { useEffect, useState } from "react";
import axios from "axios";


import "./css/Playlists.css";
import "bootstrap/dist/css/bootstrap.min.css";

const PLAYLIST_ENDPOINT = "https://api.spotify.com/v1/me/playlists";

function Playlists({accessToken}) {
    const [token, setToken] = useState("");
    const [playlistData, setPlaylistData] = useState({});
    const [viewingPlaylist, setViewingPlatlist] = useState(false);

    useEffect(() => {
        setToken(accessToken);
    }, []);

    const logout = () => {
        setToken("");
        setPlaylistData({});
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
        setViewingPlatlist(true);
    }

    
    return(
        <div class="playlist-wrapper">
            <button class="logout-btn" onClick={logout}>Logout</button>
            {viewingPlaylist ? 
                <h2>Select Playlists</h2>
                :
                <button class="p-btn" onClick={getPlaylists}>Pick Playlists</button> 
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
                                        <a href="#" class="btn btn-primary">Use</a>
                                    </div>
                                    
                                </div>
                            </div>
                        )
                      : null 
                    }
                </div>

                {viewingPlaylist ? <button class="p-btn">CONFIRM</button> : null }
            </div>
        </div> 
    );
}

export default Playlists;