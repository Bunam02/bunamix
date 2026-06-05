import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Log incoming requests
  app.use(async (req, res, next) => {
    const fs = await import('fs');
    fs.appendFileSync('/tmp/debug_reqs2.txt', `${new Date().toISOString()} ${req.method} ${req.url} | Ref: ${req.headers.referer} | Origin: ${req.headers.origin}\n`);
    next();
  });

  // Add a proxy for YouTube API
  app.get(["/api/media/playlists", "*/api/media/playlists"], async (req, res) => {
    try {
      const { id } = req.query;
      const key = process.env.YOUTUBE_API_KEY || "AIzaSyC4usA02zFbvFOKIbTIwXiVKTvT_QGRqro";
      
      console.log(`Fetching playlist info for: ${id}`);
      let url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${encodeURIComponent(id as string)}&key=${key}`;
      
      const headers: any = {};
      if (req.headers.referer) headers['Referer'] = req.headers.referer;
      if (req.headers.origin) headers['Origin'] = req.headers.origin;

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('YouTube API error response:', errorData);
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      console.error('Proxy Error (playlists):', e.message);
      res.status(500).json({ error: { message: e.message } });
    }
  });

  app.get(["/api/media/playlistItems", "*/api/media/playlistItems"], async (req, res) => {
    try {
      const { playlistId, pageToken } = req.query;
      const key = process.env.YOUTUBE_API_KEY || "AIzaSyC4usA02zFbvFOKIbTIwXiVKTvT_QGRqro";

      console.log(`Fetching items for playlist: ${playlistId}, pageToken: ${pageToken}`);
      let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(playlistId as string)}&key=${key}`;
      if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken as string)}`;
      
      const headers: any = {};
      if (req.headers.referer) headers['Referer'] = req.headers.referer;
      if (req.headers.origin) headers['Origin'] = req.headers.origin;

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('YouTube API error response (items):', errorData);
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      console.error('Proxy Error (playlistItems):', e.message);
      res.status(500).json({ error: { message: e.message } });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: derived path for ES Modules
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
