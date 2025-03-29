import SearchBar from "../components/SearchBar/SearchBar.js";
import SearchResults from "../components/SearchResults/SearchResults.js";
import PlayList from "../components/Playlist/Playlist.js";

import './App.css';

import { useState } from "react";

const App = () => {

  const [input, setInput] = useState(''); // Used to track search Box input

  const handleInput = (text) => { // pass this function as a prop for <SearchBar> so
                              // SearchBar.js can fill the 'input' for App() in THIS App.js       
    setInput(text);
  }
  
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
        <SearchResults />
        <PlayList />
      </div>
    </div>
    </>
  );
};
export default App;