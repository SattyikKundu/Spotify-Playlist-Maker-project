import React from 'react';   // import for creating react components
import { createRoot } from 'react-dom/client'; // used for rendering components to the DOM

import App from './App/App.js';

const root = createRoot(document.getElementById("root"));

root.render(<App/>); // This renders <App /> onto the DOM.
