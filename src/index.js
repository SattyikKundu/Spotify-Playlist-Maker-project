import React from 'react';
import { createRoot } from 'react-dom/client';

// More imports to add later.............

const root = createRoot(document.getElementById("root"));

const render = () => {
    root.render(
        <>
        <App />
        </>
    );
}

root.subscribe(render);