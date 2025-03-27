/*  These are helper functions for the Spotify object/class in the main Spotify.js file.
 *  They're placed here for organization and space saving.
 */

/* 1st, create Code Verifier, which is a high-entrophy cryptographic random
 * string with 43-128 characters. See function(s) below, which will be implemented later.
 */

export const generateRandomString = (length) => {  // Generate random string for provided length

    // Pool of possible random characters for string ( 26 uppercase, 26 lowercase, & 10 digits = 62 chars )
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


/* 2nd, after the code verifier is generated using the above function, it needs to be 'hashed/transformed'
 * via SHA256 algorithm. This value will be sent within authorization request.
 */

export const sha256 = async (plain) => { // Define asynchronous function that takes plain text string as input

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

/* 3rd, below function 'base64encode' returns the base64 representation
   of the digest calculated with previous sha256() function. */

// Define a function to base64-url-encode binary input (like SHA-256 hash)
export const base64encode = (input) => {

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

