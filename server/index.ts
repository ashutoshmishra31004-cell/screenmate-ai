import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import fs from 'fs';
import express from 'express';
import { fileURLToPath } from 'url';
import { app } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;

// Serve static frontend in standalone mode if dist directory exists
const clientDistPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` ScreenMate AI Server running on port http://localhost:${PORT}`);
  console.log(` API Endpoint: http://localhost:${PORT}/api/analyze-screen`);
  console.log(` Groq API Key Configured: ${process.env.OPENAI_API_KEY ? 'YES (' + process.env.OPENAI_MODEL + ')' : 'NO'}`);
  console.log(`=================================================`);
});
