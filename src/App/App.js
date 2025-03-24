import SearchBar from "../components/SearchBar/SearchBar.js";
import SearchResults from "../components/SearchResults/SearchResults.js";
import PlayList from "../components/Playlist/Playlist.js";

import './App.css';

/* In <h1> below, replaces 'Jamming' */
const App = () => {
  return (
    <>
    <h1>Spotify PlayList Maker</h1> 
    <div class="App">
      <SearchBar />
      <div class="App-playlist">
        <SearchResults />
        <PlayList />
      </div>
    </div>
    </>
  );
};
export default App;