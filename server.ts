import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // --- Local Database Setup ---
  const dbPath = path.join(__dirname, 'wardrive.db');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Initialize Schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS signals (
      id TEXT PRIMARY KEY,
      type TEXT,
      ssid TEXT,
      mac TEXT,
      rssi INTEGER,
      lat REAL,
      lng REAL,
      timestamp INTEGER,
      sessionId TEXT,
      manufacturer TEXT,
      security TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT,
      startTime INTEGER,
      deviceInfo TEXT
    );
  `);

  const app = express();
  const PORT = 3000;
  app.use(express.json());

  // In-memory buffer for performance
  let signalBuffer: any[] = [];
  const BUFFER_LIMIT = 10;

  // Simple OUI Cache (In-Memory for now, could be a JSON file)
  const ouiCache: Record<string, string> = {
    '00:11:22': 'Cisco Systems',
    '34:05:22': 'Apple Inc.',
    '00:50:43': 'Alfa Networks',
    '88:66:33': 'TP-Link'
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      storage: "Local SQLite",
      hardware: {
        gps: { lat: 34.0522, lng: -118.2437, status: 'Active' },
        sdr: { status: 'Listening', gain: 'Auto' }
      }
    });
  });

  // Enrichment Endpoint: Resolves manufacturers for a list of MACs
  app.post("/api/enrich", async (req, res) => {
    const { macs } = req.body;
    const results: Record<string, string> = {};
    
    for (const mac of macs) {
       const oui = mac.substring(0, 8).toUpperCase();
       if (ouiCache[oui]) {
          results[mac] = ouiCache[oui];
       } else {
          // In a real scenario, fetch from macvendors.com if online
          results[mac] = "Unknown Vendor";
       }
    }

    // Update database for these MACs
    const stmt = await db.prepare('UPDATE signals SET manufacturer = ? WHERE mac = ?');
    for (const [mac, vendor] of Object.entries(results)) {
       await stmt.run(vendor, mac);
    }
    await stmt.finalize();

    res.json({ success: true, enriched: Object.keys(results).length });
  });

  // Signal Ingestion (Local)
  app.post("/api/signals", async (req, res) => {
    const signals = Array.isArray(req.body) ? req.body : [req.body];
    const sessionId = req.query.sessionId as string || "LOCAL_SESSION";
    
    signalBuffer.push(...signals.map(s => ({
      ...s,
      sessionId,
      timestamp: Date.now()
    })));

    if (signalBuffer.length >= BUFFER_LIMIT) {
      const stmt = await db.prepare('INSERT OR IGNORE INTO signals (id, type, ssid, mac, rssi, lat, lng, timestamp, sessionId) VALUES (?,?,?,?,?,?,?,?,?)');
      for (const s of signalBuffer) {
        await stmt.run(
          s.id || Math.random().toString(36).substring(2, 11),
          s.type, s.ssid, s.mac, s.rssi, 
          hardwareContext.gps.lat, hardwareContext.gps.lng, 
          s.timestamp, s.sessionId
        );
      }
      await stmt.finalize();
      signalBuffer = [];
      console.log(`[STORAGE] Flushed to SQLite.`);
    }

    res.json({ success: true, count: signalBuffer.length });
  });

  app.get("/api/mock-signals", async (req, res) => {
     // Return real history from SQLite if available, otherwise mock
     const history = await db.all('SELECT * FROM signals ORDER BY timestamp DESC LIMIT 100');
     if (history.length > 0) return res.json(history);

     const signals = [];
     for (let i = 0; i < 50; i++) {
        signals.push({
          id: `node-${i}`,
          type: i % 2 === 0 ? 'WiFi' : 'Bluetooth',
          ssid: `LocalNet_${i}`,
          mac: `00:11:22:33:44:${i.toString(16)}`,
          rssi: -Math.floor(Math.random() * 50 + 40),
          lat: hardwareContext.gps.lat + (Math.random() - 0.5) * 0.01,
          lng: hardwareContext.gps.lng + (Math.random() - 0.5) * 0.01,
          timestamp: Date.now()
        });
     }
     res.json(signals);
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LocalNode] Wardrive Pro active at http://localhost:${PORT}`);
  });
}

startServer();
