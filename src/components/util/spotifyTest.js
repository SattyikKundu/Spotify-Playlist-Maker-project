import React, { useEffect, useState } from 'react';
import { getToken, redirectToSpotifyAuth } from '../../../../Spotify_original_reference';

const SpotifyTest = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    // Show current debug state
    setDebugInfo({
      code,
      codeVerifier: localStorage.getItem('code_verifier'),
      storedToken: localStorage.getItem('access_token')
    });

    // If we got redirected with a code from Spotify, exchange it for a token
    if (code && !accessToken) {
      getToken(code)
        .then((token) => {
          if (token) {
            setAccessToken(token);
            window.history.replaceState({}, document.title, '/'); // Clean up URL
          } else {
            setError('Access token was not returned.');
          }
        })
        .catch((err) => {
          setError('Token exchange failed: ' + err.message);
        });
    }

    // If a token is already saved, load it into state
    const token = localStorage.getItem('access_token');
    if (token && !accessToken) {
      setAccessToken(token);
    }
  }, [accessToken]);

  useEffect(() => {
    const fetchData = async (token) => {
      try {
        const res = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });

        const status = res.status;

        if (!res.ok) {
          const errorText = await res.text();

          setDebugInfo((prev) => ({
            ...prev,
            status,
            message: errorText,
            token,
          }));

          if (status === 401) {
            // 🧠 401 = token expired, so clear and re-auth
            localStorage.removeItem('access_token');
            localStorage.removeItem('code_verifier');
            setAccessToken(null); // trigger re-auth
            redirectToSpotifyAuth(); // start flow again
          } else {
            throw new Error('Spotify API error');
          }

          return;
        }

        const json = await res.json();
        setData(json);

        setDebugInfo((prev) => ({
          ...prev,
          status,
          message: 'Success',
          token,
        }));
      } catch (err) {
        setError('Error fetching data: ' + err.message);
      }
    };

    if (accessToken && !data) {
      fetchData(accessToken);
    }
  }, [accessToken, data]);

  return (
    <div>
      <h1>Spotify API Test</h1>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {debugInfo && (
        <div style={{ background: '#fff0f0', padding: '1rem', marginBottom: '1rem' }}>
          <strong>Debug Info:</strong>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

      {data && (
        <div>
          <h2>✅ Raw Profile Response:</h2>
          <pre style={{ background: '#f4f4f4', padding: '1rem' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {!data && !error && accessToken && <p>🔄 Fetching Spotify data...</p>}
    </div>
  );
};

export default SpotifyTest;
