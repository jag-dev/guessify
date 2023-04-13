<p align="center"><img src="../other/img/spotify.jpeg" height="100"></p>
<p align="center"><img src="../other/img/guessify.png"></p>
<p align="center">Authors: James Guiden, Alec Montesano, Owen Conlon</p>

# Front-End
This is the client-side of the Guessify application. It was bootstrapped using [Create React App](https://github.com/facebook/create-react-app) to serve front-end functionality to the users via a NodeJS runtime environment.

## Installation
Firstly, you will need to generate a client ID to interact with and access Spotify's services
* Go to your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
* Create a new app
* Copy your newly generated client ID

Then, you will need to setup environment variables
* Create a .env file in this folder (client)
* Add the following variable: ```REACT_APP_CLIENT_ID=```
* Add your client ID as the variable value

Finally, you will need to install the required package dependencies

> npm install --save nodejs

> npm install --save axios

> npm install --save bootstrap

> npm install --save react-router-dom

> npm install --save react-spotify-embed

> npm install --save socket.io-client

> npm install --save @fortawesome/react-fontawesome

> npm install --save @fortawesome/free-solid-svg-icons

> npm install --save @fortawesome/fontawesome-svg-core


## Startup
How that you have your environment and project structure setup, you are ready to start the front-end
* Open a terminal and navigate to the client folder
* Use ```npm start``` to start the project up
* Navigate to [http://localhost:3000](http://localhost:3000) in order to view it in the browser



