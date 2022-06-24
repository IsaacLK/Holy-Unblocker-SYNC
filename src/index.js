// import { StrictMode } from 'react';
import App from './App.js';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

const root = createRoot(document.querySelector('#root'));

// <StrictMode>
// https://stackoverflow.com/questions/61254372/my-react-component-is-rendering-twice-because-of-strict-mode

root.render(
	<BrowserRouter>
		<App />
	</BrowserRouter>
);
