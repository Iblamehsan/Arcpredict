import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static assets from built client if available
app.use(express.static(path.join(__dirname, 'dist')));

// API route for status or health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', network: 'Arc Testnet', dapp: 'BetonARC' });
});

// SPA fallback
app.get('*', (_req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('BetonARC Server Running');
    }
  });
});

app.listen(PORT, () => {
  console.log(`BetonARC Server listening on port ${PORT}`);
});
