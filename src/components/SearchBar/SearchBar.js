import { useState } from 'react';
import './SearchBar.css';


const SearchBar = ({onSearch}) => {

    const [searchInput, setSearchInput] = useState('');


    const typeSearch = (event) => {
        setSearchInput(event.target.value);
    }


    const submitSearch = () => {
        onSearch(searchInput);
    }    


    return (
        <div class="Search-Bar">
            <input 
            placeholder='Enter a Track Title' 
            value = {searchInput}
            onChange={(event) => typeSearch(event)}
            />
            <div class="Search-Button"onClick={submitSearch} >SEARCH</div>
        </div>
    );
}

export default SearchBar;