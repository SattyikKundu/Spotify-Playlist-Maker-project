/*
    The PKCE is the recommended authorization flow for most
    modern mobile app, single page web apps, or any other applications
    where the client secret can't be stored safely.

    The implementation of PKCE extension generally consists of following steps:
    1. Code Challange generation from a Code Verifier
    2. Request authorization from the user and retrieve the authorization code.
    3. Request access token from authorization code.
    4. Lastly, use access token for api calls.


    For full guide on how below code was obtained for PKCE flow, you must see:
    https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
*/

// Import essential helper function for Code Challenge generation from a Code Verifier
import {generateRandomString, sha256, base64encode} from './helpers.js';



const clientId = 'f543695a790649369f8a548e31afb691'; // <= Client ID from Spotify developer account's dashboard
const redirectUri = 'http://localhost:3000';         // <= redirectUri is where the API data gets sent towards.
                                                     // This needs to match 'redirecUri' configured in Spotify's app dashboard.

/* NOTE: The redirectToSpotifyAuth() and getToken() functions in Spotify object
         were created using the provided article as reference: 
         https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

         The article (alongside provided comment below) helps clarify how the overall code works. 
*/

const Spotify = {
                                                    
    // Below is created PKCE Redirect Function — this initiates Spotify auth request *safely*
    // redirectToSpotifyAuth() is needed before using getToken() to utilize other API features
    
    async redirectToSpotifyAuth() {  // self-NOTE: inside object literal ('Spotify'), the function syntax is 'async function(){}'
                                     //     and not 'const redirectToSpotifyAuth = async () => {}' 


      // STEP 1: Code Challange generation from Code verifier
      let codeVerifier = window.localStorage.getItem('code_verifier'); // attempts to get existing code_verifier from local storage. 

      if (!codeVerifier) { // If no codeVerifier exists, generate random 64-char string for 'PKCE code_verifier' 
        codeVerifier = generateRandomString(64);           

        // Saves 'codeVerifier' into 'code_verifier' in localStorage for later use during token exchange
        window.localStorage.setItem('code_verifier', codeVerifier); 
        /*Newly stored code_verifier for later token exchange must match exactly 
          when exchanging the authorization code for an access token*/
      } 

    /* Now utilized and combine helper functions, sha256() 
       and base64encode(), to complete code challenge generation */
      const hashed = await sha256(window.localStorage.getItem('code_verifier')); // Generate hash of code_verifier using imported sha256()
      const codeChallenge = base64encode(hashed);                                // Convert hash to base64url-encoded string — this is our 'code_challenge'
                                                                                 // This is sent as part of auth request and will be matched later by Spotify


      // STEP 2: Request authorization from the user and retrieve the authorization code.                                              

      const authUrl = new URL('https://accounts.spotify.com/authorize'); // New URL object pointd to authorization endpoint

      // Define set of permissions your app is requesting from the user
      // In below case: access to user's private profile and email address                                     
      const scope = 'user-read-private user-read-email';

      const params =  { // Define required PKCE + OAuth query parameters query parameters for authorization request
        response_type: 'code',         // Required: Tells Spotify that We want an authorization code (standard OAuth flow)
        client_id: clientId,           // Required: Your app's registered Client ID 
        redirect_uri: redirectUri,     // Required: Where Spotify sends user after login (Must match URI you listed in Spotify Dashboard)
        scope,                         // Optional: Space-separated list of permissions your app needs
      //state: 'xyz123',               // Optional (but recommended): Random string to prevent CSRF attacks 
        code_challenge_method: 'S256', // Required: Tells Spotify we're using PKCE hashing method SHA-256 for code challenge
        code_challenge: codeChallenge, // Required: The SHA-256 hashed + base64url-encoded version of codeVerifier
        show_dialog: 'true',           // Optional: forces Spotify to show the login/consent screen every time
      }

      /* Convert 'params' object into properly encoded query string like:
      * 'response_type=code&client_id=...&redirect_uri=...&scope=...&code_challenge=...&code_challenge_method=S256'
      * Then attach query string to 'authUrl' object so final URL includes all parameters.
      * Now, the full URL looks like: https://accounts.spotify.com/authorize?response_type=code&client_id=...
      */
      authUrl.search = new URLSearchParams(params).toString();  

      /* Converts complete 'authUrl' (base + query string) to a string,
      * then assign it to 'window.location.href', which immediately navigates browser to URL.
      * This redirects user to Spotify’s authorization page, where they log in and grant access.
      */
      window.location.href = authUrl.toString();

      /* EXTREMELY IMPORTANT: After logging in, the user is redirected to 'redirectUri' which includes
       *                      'code' value in urlParams(ex: http://localhost:3000/?code=ZAXNw5Uww...34hfa9f34...). 
       *                      The 'code' value must be extracted and then used in getToken(code) function.
       */
    },

    
    /* After user accepts authorization request of prev. step, the authorization code 
    * is exchanged for an access token. A POST request must be sent to '/api/token' endpoint.
    */

    // STEP 3: Request access token from authorization code (via below function).
    // STEP 4: Export the 'Spotify' object (at bottom of code) so Spotify API calls and functions can be executed elsewhere.
    // const getToken = async code => {
    async getToken(code) { // Function exchanged authorization code for access token

        // Retrieves original code verifier from localStorage (must match verifier from earlier code challenge).
        const codeVerifier = localStorage.getItem('code_verifier');
      
        const url = "https://accounts.spotify.com/api/token"; // Spotify's token endpoint URL — where we send POST request

        /* Construct payload for POST request to exchange code for access token*/
        const payload = {
          method: 'POST',  // Sends data via POST method
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Required header tells Spotify its being sent form-encoded data
          },
          body: new URLSearchParams({
            client_id: clientId,              // Required: Your app's client ID (from Spotify Developer Dashboard)  
            grant_type: 'authorization_code', // Required: Identifies type of OAuth flow we're using
            code,                             // Required: The authorization code returned by Spotify 
                                                        // after the user logs in and approves access
            redirect_uri: redirectUri,        // Required: Must match 'redirect_uri' used in initial auth request
                                                        // Used for verification — no redirect actually happens at this point
            code_verifier: codeVerifier,      // Required: The original code verifier you generated and stored
                                                        // This must match 'code_challenge' previously sent to Spotify
          }),
        };
          
        const body = await fetch(url, payload); // Sends POST request to Spotify's token endpoint with constructed payload
        const response = await body.json();     // Parse JSON response body to extract access token and other data
      

        // Save the full response from Spotify into localStorage (optional for debugging)
        localStorage.setItem('debug_response', JSON.stringify(response));

        if (!response.access_token) {  // Check if the access_token is missing from response
            
            // If missing, throw error and include entire response for debugging
            throw new Error('No access token returned: ' + JSON.stringify(response));
        }

        // Store access token in localStorage for use in subsequent API calls
        // This token is required in the Authorization header (as a Bearer token)
        localStorage.setItem('access_token', response.access_token);

        return response.access_token;
    },

    // Function to return search Resulting using search Term input

    async returnSearchResults(input, token) {

      let formattedInput = input.trim(); // removes spaces from start and end

      formattedInput = formattedInput.split(/\s+/).join('+'); // Removes spaces between words and joins using '+' signs 

      const endPointUrl = `https://api.spotify.com/v1/search?q=${formattedInput}&type=track`;

      const response = await fetch(
        endPointUrl,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data) {
        return data;
      }

    },

}

export default Spotify;
