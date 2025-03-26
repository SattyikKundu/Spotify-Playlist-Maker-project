/*
    The PKCE is the recommended authorization flow for most
    modern mobile app, single page web apps, or any other applications
    where the client secret can't be stored safely.

    The implementation of PKCE extension consists of following steps:
    1. Code Challange generation from a Code Verifier
    2. Request authorization from the user and retrieve the authorization code.
    3. Request access token from authorization code.
    4. Lastly, use access token for api calls.


    For full guide on how below code was obtained for PKCE flow, you must see:
    https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
*/

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************** 1.Code Challenge generation from Code Verifier *****************************/
/**********************************************************************************************************/
/**********************************************************************************************************/

/**Create Code Verifier, which is a high-entrophy cryptographic random
 * string with 43-128 characters. See function below.
 */

const generateRandomString = (length) => {  // Generate random string for provided length

    // Pool of possible random characters for string ( 26 uppercase, 26 lowercase, & 10 digits)
    // length = 26 + 26 + 10 = 62
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    /* Generates a Uint8array (unsigned 8-bit integers array (0-255 range)) for given length 
     * and then fills with cryptographically secure random values.
     * Ex: [41, 233, 178, 3, 99, 74, 200, ...]
     */
    const values = crypto.getRandomValues(new Uint8Array(length));


    /* Reducer function converts random values into string 
     * by mapping each value to a character in 'possible' variable.
     */
    return values.reduce(
        (acc,x) => // 'acc' is accumulator which starts with an empty string ("")
                   // 'x' is each random value from 'values' array

             /* Use modulus to keep index within character pool, 
              * then add the selected character to the result string
              */
             acc + possible[x % possible.length], "" //Initial value for accumulator (starts as empty string)

        /* How this ultimately works: 
           Iteration 1:
           -> acc=""
           -> x= 41 → 41 % 62=41 → possible[41]="p" 
           -> Result: acc="p"

           Iteration 2:
           -> acc="p"
           -> x = 233 → 233 % 62 = 47 → possible[47] = "v"
           -> Result: acc="pv"

           Iteration 3:
           -> acc="pv"
           -> x = 178 → 178 % 62 = 54 → possible[54] = "2"
           -> Result: acc="pv2"

           An so forth..........
        */
    );
}

// Finally generates 64-char random string for PKCE code_verifier
const codeVerifier = generateRandomString(64);


/*
Once code verifier is generated, it needs to be 'hashed/transformed'
via SHA256 algorithm. This value will be sent within authorization request.
*/

const sha256 = async (plain) => { // Define asynchronous function that takes plain text string as input

    const encoder = new TextEncoder(); // Creates new TextEncoder to turn string into a Uint8Array (binary data)

    const data = encoder.encode(plain); // Encode input string into sequence of bytes 
                                        // (each letter turned into corresponding UTF-8(Uint8Array) Byte value)
                                        // (e.g., "hello" → [104, 101, 108, 108, 111])

    // Calls the SubtleCrypto API to generate a SHA-256 hash of the input data
    return window.crypto.subtle.digest(
        'SHA-256',  // Specify the hashing algorithm. SHA-256 is a secure 256-bit cryptographic hash function.
        data        // The input to be hashed: a Uint8Array (binary data), typically created by TextEncoder.encode()
    );
}

/* Next, function 'base64encode' returns the base64 representation
   of the digest calculated with previous sha256() function. */

// Define a function to base64-url-encode binary input (like SHA-256 hash)
const base64encode = (input) => {

    /* Convert input(which is ArrayBuffer) into a string:
     * 1. Wrap it in Uint8Array to access individual byte values
     * 2. Use String.fromCharCode(...bytes) to convert byte array to a string of characters
     * 3. Use btoa() (binary to ASCII) to encode the string into Base64.
     */
    return btoa(String.fromCharCode(...new Uint8Array(input)))

        /* The base64 string may include '=', which is used for padding.
           Remove all "=" characters to make it base64url-safe. */
        .replace(/=/g, '')
        .replace(/\+/g, '-')  // Replace "+" with "-" (URL-safe: "+" is not valid in URLs)
        .replace(/\//g, '_'); // Replace "/" with "_" (URL-safe: "/" is not valid in URLs)
}

/* Now combine the previous code pieces to complete code challenge generation */
const hashed = await sha256(codeVerifier);
const codeChallenge = base64encode(hashed);





/**********************************************************************************************************/
/**********************************************************************************************************/
/************* 2. Request authorization from the user and retrieve the authorization code. ****************/
/**********************************************************************************************************/
/**********************************************************************************************************/


/* To request authorization from the user, a GET request must be made to the '/authorize' 
   endpoint. The request should include the same parameters as the authorization 
   code (https://developer.spotify.com/documentation/web-api/tutorials/code-flow),
   including 2 additional parameters: code_challange and code_challenge_method
*/

//let accessToken;                                // used to store access token once retrieved from url
const clientId = 'f543695a790649369f8a548e31afb691'; // <= paste Client ID here from Spotify developer dashboard
const redirectUri = 'http://localhost:3000'; // <= redirectUri is where the API data will be sent towards
                                             // needs to match what is configured on Spotify's app dashboard.

// Define set of permissions your app is requesting from the user
// In this case: access to user's private profile and email address                                     
const scope = 'user-read-private user-read-email';

// Create a URL object pointing to Spotify's authorization endpoint
const authUrl = new URL("https://accounts.spotify.com/authorize")
                                             
// Store code verifier in localStorage for later use during token exchange
window.localStorage.setItem('code_verifier', codeVerifier);

const params =  { // Define required query parameters for PKCE authorization request
    response_type: 'code',      // Required: We want an authorization code (standard OAuth flow)
    client_id: clientId,        // Required: Your app's registered Client ID 
    redirect_uri: redirectUri,  // Required: Must match a URI you listed in Spotify Dashboard
    scope,                      // Optional: Space-separated list of permissions your app needs
  //state: 'xyz123',            // Optional (but recommended): Random string to prevent CSRF attacks 
    code_challenge_method: 'S256', // Required: Tells Spotify we're using SHA-256 for code challenge
    code_challenge: codeChallenge, // Required: The SHA-256 hashed & base64url-encoded version of codeVerifier
}

/* Convert 'params' object into properly encoded query string like:
 * response_type=code&client_id=...&redirect_uri=...&scope=...&code_challenge=...&code_challenge_method=S256
 * Then attach query string to 'authUrl' object so final URL includes all parameters.
 */
authUrl.search = new URLSearchParams(params).toString();

/* Convert the complete 'authUrl' (base + query string) to a string,
 * then assign it to 'window.location.href', which immediately navigates the browser to the URL.
 * This redirects user to Spotify’s authorization page, where they log in and grant access.
 */
window.location.href = authUrl.toString();   

/* If user accepts requested permission, OAuth service redirects user
   back to URL specified in 'redirect_uri' field. This callback should
   contain TWO query parameters within URL: 
   -code  (authorization token that can be exhcanged for an access token)
   -state (value of state parameter supplied in request)
*/

// Below code parses URL to retrieve code parameter
const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get('code');

/* If user doesn't accept request or if error occured, the response 
   query cotains following parmeters:
   - error (reason authorization failed (ex: 'access_denied))
   - state (value of 'state' parameter in request)
   */




/**********************************************************************************************************/
/**********************************************************************************************************/
/**************************** 3. Request access token from authorization code. ****************************/
/**********************************************************************************************************/
/**********************************************************************************************************/

/* After user accepts authorization rqeuest of prev. step, the 
   authorization code is exchanged for an access token.   
   A POST request must be sent to '/api/token' endpoint.
   */

const getToken = async code => { // Function exchanged authorization code for access token

    // Retrieves original code verifier from localStorage.
    // This MUST match what was used to generate the code challenge in the initial authorization step
    const codeVerifier = localStorage.getItem('code_verifier');
  
    // Spotify's token endpoint URL — where we send our POST request
    const url = "https://accounts.spotify.com/api/token";

    /* Construct payload for the POST request to 
     * exchange code for an access token
     */
    const payload = {
      method: 'POST',  // Sending data via POST
      headers: {
        // Required header tells Spotify its being sent form-encoded data
        'Content-Type': 'application/x-www-form-urlencoded',
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
    }
  
    const body = await fetch(url, payload); // Sends POST request to Spotify's token endpoint with constructed payload
    const response = await body.json();     // Parse JSON response body to extract access token and other data
  
    // Store access token in localStorage for use in subsequent API calls
    // This token is required in the Authorization header (as a Bearer token)
    localStorage.setItem('access_token', response.access_token);
}



export default {getToken}; // export function(s) as a bundle for external use.