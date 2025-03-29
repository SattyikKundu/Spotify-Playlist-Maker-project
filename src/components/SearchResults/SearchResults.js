import './SearchResults.css';

import { useEffect, useState } from 'react';

const SearchResults = ({searchTerm}) => {

    const [searchResults, setSearchResults] = useState([]); // Stores and tracks Search Results in array

    const trackSearch = async () => {

    }

    return (
        <div class="Search-Results">
            <h2> Results </h2>
        </div>
    )

}

export default SearchResults;