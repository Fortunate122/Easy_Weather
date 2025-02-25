// import dotenv from 'dotenv';
// import express from 'express';
// import path from 'path';

// dotenv.config();

// // Import the routes
// import routes from './routes/index.js';

// const app = express();

// const PORT = process.env.PORT || 3001;

// // TODO: Serve static files of entire client dist folder
// app.use(express.static(path.join(process.cwd(), 'client', 'dist')));

// // TODO: Implement middleware for parsing JSON and urlencoded form data
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // TODO: Implement middleware to connect the routes
// app.use('/api', routes);

// app.get('*', (_, res) => {
//     res.sendFile(path.join(process.cwd(), 'client', 'dist', 'index.html'));
// });

// // Start the server on the port
// app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Import routes
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Convert `import.meta.url` to `__dirname` (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Absolute path to `client/dist/`
const distPath = path.join(__dirname, '../../client/dist');
console.log('📂 Serving static files from:', distPath);

// ✅ Serve static frontend files
app.use(express.static(distPath));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API routes
app.use('/api', routes);

// ✅ Log request for `index.html`
// app.get('*', (_, res) => {
//     const filePath = path.join(distPath, 'index.html');
//     console.log('📄 Serving index.html from:', filePath);
//     res.sendFile(filePath);
// });

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));


