import { useState } from 'react';
import Track from '../Track/Track';
import Spotify from '../util/Spotify.js';
import './Playlist.css'; 

const PlayList = ({playList, setPlaylist}) => {

    const[playListName, setPlaylistName] = useState(''); // stores name of playlist as user types

    const updateName = (event) => { // function updates playlist name as user types
        setPlaylistName(event.target.value);
    }

    const removeTrack = (trackId) => {     // function to drop track from current playlist
        const shallowCopy = [...playList]; // save shallow copy
        const newPlaylist = shallowCopy.filter((track) => track.id !== trackId); // return all tracks except for removed track
        setPlaylist(newPlaylist);          // save new playlist without dropped track
    }

    const submitPlaylist = async () => { // used to submit playlist to Spotify account

        if(playList && playList.length > 0 && playListName && playListName.length>0) {
            const trackUris = playList.map((track) => track.uri);
            await Spotify.savePlaylist(playListName, trackUris, setPlaylist);
            window.scrollTo({ top: 0, behavior: 'smooth'});
            alert(`You have successfully submited playlist: '${playListName}'.`);
            setPlaylistName('');
        } 
        else {
            alert('You need a playlist name and at least 1 track to submit!\nAlso, you need to be logged in to your Spotify account.');
        }    
    } 

    return (
        <div class="Playlist">
            <input 
                // Updated playListName as user types
                placeholder='Enter Playlist Name...' 
                value={playListName}
                onChange={(event) => updateName(event)}    
            />
            <div className="PlayList-Display">
              {/* .map() used to display all current tracks in Playlist */}
              { 
              (!playList || playList.length===0)
              ? (<p>Then, Add a Playlist Name and at Least 1 Track to Enable Saving Playlist...</p>)
              : (playList.map((track) => (
                <Track
                  key={track.id}
                  track={track}
                  removeTrack={removeTrack}
                />
              )))
               }
            </div>
            <div className='button-space'>
              <div className='submit-button' onClick={() => submitPlaylist()}>Save To Spotify</div>
            </div>
        </div>
    );
}

export default PlayList;