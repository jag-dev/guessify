import React, { useEffect, useState } from "react";
import axios from "axios";


import "./css/Playlists.css";
const PLAYLIST_ENDPOINT = "https://api.spotify.com/v1/me/playlists";

function Playlists({accessToken}) {
    const [token, setToken] = useState("");
    const [playlistData, setPlaylistData] = useState({});

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
    }

    return(
        <div class="playlist-container">
            <button class="logout-btn" onClick={logout}>Logout</button>
            <button class="get-btn" onClick={getPlaylists}>Pick Playlists</button>
            { playlistData?.items ? playlistData.items.map((item) => 
                <p>{item.name}</p>) 
              : null 
            }
        </div> 
    );
}

export default Playlists;