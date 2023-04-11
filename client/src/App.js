import React, { useEffect, useState } from "react";
import Playlists from './Playlists';

import "./css/App.css"
import spotifyLogo from './img/Spotify.jpeg'

function App() {
  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState("");

  useEffect(() => {
      const hash = window.location.hash;
      let token = window.localStorage.getItem("token");

      if (!token && hash) {
          token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];

          window.location.hash = "";
          window.localStorage.setItem("token", token);
      }

      setToken(token);

  }, [])

  return (
      <div className="app">
          <header className="app-header">
            <div class="title">
              <h1>Guessify</h1>
              <h3>Spotify Guessing Game</h3>
            </div>
            
            <div class="logo-wrapper">
              <img src={spotifyLogo} alt="Spotify Logo" />
            </div>
            
            { !token ?
              <div class="connect-wrapper">
                <p>Connect your Spotify account to start playing!</p>
                <button class="connect-btn"><a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Play Now</a></button>
              </div>
              :
              <Playlists accessToken={token}/>
            }
              
          </header>
      </div>
  );
}

export default App;