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
        const trackUris = playList.map((track) => track.uri);
        await Spotify.savePlaylist(playListName, trackUris, setPlaylist);
    } 

    return (
        <div class="Playlist">
            <input 
                // Updated playListName as user types
                placeholder='Enter New Playlist Name...' 
                value={playListName}
                onChange={(event) => updateName(event)}    
            />
            <div className="PlayList-Display">
              {/* .map() used to display all current tracks in Playlist */}
              { 
              (!playList || playList.length===0)
              ? (<p>No tracks added yet...</p>)
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
                {
                    /* Button shows only if playList and name exists 
                       and their lengths are greater than 0. */
                    (playList && playList.length > 0 && playListName && playListName.length>0)
                    ? <div className='submit-button' onClick={() => submitPlaylist()}>SUBMIT Playlist</div>
                    : null          
                }
            </div>
        </div>
    );
}

export default PlayList;