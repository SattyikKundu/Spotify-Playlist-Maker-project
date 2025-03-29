import SearchBar from "../components/SearchBar/SearchBar.js";
import SearchResults from "../components/SearchResults/SearchResults.js";
import PlayList from "../components/Playlist/Playlist.js";
import './App.css';
import { useState, useEffect } from "react";

import Spotify from "../components/util/Spotify.js";

const App = () => {

  const [input, setInput] = useState('');                 // Used to track Search Box input
  const [accessToken, setAccessToken] = useState(null);   // Used to track access token for Spotify API
  const [searchResults, setSearchResults] = useState([]); // Stores search term output as searchRsults 
  const [forPlaylist, setForPlaylist] = useState([]);     // Stores which searchResult tracks will part of 

  const handleInput = (text) => { // pass this function as a prop for <SearchBar> so
                              // SearchBar.js can fill the 'input' for App() in THIS App.js       
    setInput(text);
  }
  
  useEffect(()=> { // Used to authenticate Spotify API calls when opening App.

    const token = localStorage.getItem('access_token'); // checks if 'access_token' is in localStorage.

    // Checks if 'accessToken' is empty and 'token' is not empty
    if (!accessToken && token) {
          setAccessToken(token);  // set 'access_token' from local Storage as accessToken
        }

    if(!accessToken && !token) { // If there's no set 'accessToken' nor 'access_token' in local storage....

      Spotify.redirectToSpotifyAuth(); // Login to Spotify and go to 'redirecUri' (where your app is)

      /* Upon successful login, user gets redirected to the set 'redirectUri' in Spotify.js.
       * Inside the redirected Url address, the 'code' param needs to be extracted. */

      let urlParams = new URLSearchParams(window.location.search); // Stores URL Params information
      let code = urlParams.get('code');             // extracts from url the value of 'code' parameter

      setAccessToken(Spotify.getToken(code)); // Get token via 'code' and save it to accessToken
    } 
    else { // If token IS in localStorage, set it as 'accessToken'
      setAccessToken(token);
    }
  },[]); // emprty array ([]) ensures Spotify Authentication occurs ONLY ONCE when App first mounts. 


  return (
    <>
    {/* In <h1> below, replaces 'Jamming' */}
    <h1>Spotify PlayList Maker</h1> 

    <div class="App">

      {/* passes handleInput() as prop so <SearchBar> will store 
      search term into 'input' variable here (in App()). */}
      <SearchBar onSearch={handleInput} />

      {/*  Below verifies that Search box works! */}
      {/* <p>`Input from search box click is:${input}`</p> */}

      <div class="App-playlist">
        <SearchResults searchTerm={input}/>
        <PlayList />
      </div>
    </div>
    </>
  );
};
export default App;