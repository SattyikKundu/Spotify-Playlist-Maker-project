import './SearchResults.css';
import { useEffect, useState } from 'react';
import Spotify from '../util/Spotify';

//const SearchResults = ({searchTerm, searchOutput, token}) => {
    const SearchResults = ({searchTerm, token}) => {

    const [searchResults, setSearchResults] = useState([]); // Stores and tracks Search Results in array

    //const [testOuput, setTestOutput] = useState('');

//    const trackSearch = async (searchTerm) => {}

    useEffect(()=> {
        //setTestOutput(Spotify.returnSearchResults(searchTerm));
        setSearchResults(Spotify.returnSearchResults(searchTerm));
    },[searchTerm]);


    return (
        <div class="Search-Results">
            <h2> Results </h2>
            <p> Input is: {searchTerm}</p>
           {/* <p> Formatted input is: {testOuput}</p> */}
            <p> Search Results is: {searchResults}</p>
        </div>
    )

}

export default SearchResults;