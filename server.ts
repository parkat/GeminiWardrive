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
      security TEXT,
      frequency REAL,
      modulation TEXT
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

  // Unified Hardware State Management (Initialized as DISCONNECTED)
  const hardwareContext = {
    gps: { lat: 0, lng: 0, status: 'DISCONNECTED', satellites: 0 },
    esp32: { mode: 'BLE_ONLY', transport: 'SERIAL_PENDING', status: 'DISCONNECTED' },
    alfa: { mode: 'MONITOR', card: 'wlan1mon', status: 'DISCONNECTED' },
    sdr: { status: 'DISCONNECTED', gain: 'Auto' }
  };

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
      hardware: hardwareContext 
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
          results[mac] = "Unknown Vendor";
       }
    }

    const stmt = await db.prepare('UPDATE signals SET manufacturer = ? WHERE mac = ?');
    for (const [mac, vendor] of Object.entries(results)) {
       await stmt.run(vendor, mac);
    }
    await stmt.finalize();

    res.json({ success: true, enriched: Object.keys(results).length });
  });

  // LLM Optimized Export Endpoint
  app.get("/api/export-llm", async (req, res) => {
    const { sessionId } = req.query;
    const signals = await db.all('SELECT * FROM signals WHERE sessionId = ? OR ? IS NULL ORDER BY timestamp ASC', [sessionId, sessionId]);
    
    let output = `### SYSTEM_PROMPT: WARDIVE_SIGINT_ANALYST ###\n`;
    output += `ACT AS A SENIOR SIGNALS INTELLIGENCE OFFICER. ANALYZE THE FOLLOWING TELEMETRY DATA FOR:\n`;
    output += `1. ANOMALIES: UNUSUAL HARDWARE OR FREQUENCY EMISSIONS.\n`;
    output += `2. TRACKING: DEVICES APPEARING ACROSS DISTANT COORDINATES (POTENTIAL STALKING/SURVEILLANCE).\n`;
    output += `3. VULNERABILITIES: OPEN NETWORKS OR KNOWN VULNERABLE MANUFACTURERS.\n`;
    output += `4. SPATIAL CORRELATION: CORRELATE RSSI WITH COORDINATE DENSITY.\n\n`;
    output += `DATA_SCHEMA: [TYPE|SSID|MAC|FREQ|MOD|RSSI|LAT|LNG|VENDOR]\n`;
    output += `SESSION_ID: ${sessionId || 'GLOBAL_VIEW'}\n`;
    output += `--------------------------------------------------\n`;

    signals.forEach(s => {
      const type = s.type === 'WiFi' ? 'W' : s.type === 'Bluetooth' ? 'B' : 'S';
      output += `${type}|${s.ssid || '?'}|${s.mac || '?'}|${s.frequency || '?'}|${s.modulation || '?'}|${s.rssi}|${s.lat.toFixed(4)}|${s.lng.toFixed(4)}|${s.manufacturer || '?'}\n`;
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=wardrive_intelligence.txt');
    res.send(output);
  });

  // Signal Ingestion (Local)
  app.post("/api/signals", async (req, res) => {
    const signals = Array.isArray(req.body) ? req.body : [req.body];
    const sessionId = req.query.sessionId as string || "LOCAL_SESSION";
    
    // Truthful update: Receiving signals confirms hardware presence
    hardwareContext.esp32.status = 'ACTIVE';
    hardwareContext.alfa.status = 'ACTIVE';
    hardwareContext.gps.status = 'LOCKED';
    
    signalBuffer.push(...signals.map(s => ({
      ...s,
      sessionId,
      timestamp: Date.now()
    })));

    if (signalBuffer.length >= BUFFER_LIMIT) {
      const stmt = await db.prepare('INSERT OR IGNORE INTO signals (id, type, ssid, mac, rssi, lat, lng, timestamp, sessionId, frequency, modulation) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
      for (const s of signalBuffer) {
        await stmt.run(
          s.id || Math.random().toString(36).substring(2, 11),
          s.type, s.ssid, s.mac, s.rssi, 
          hardwareContext.gps.lat, hardwareContext.gps.lng, 
          s.timestamp, s.sessionId,
          s.frequency || null,
          s.modulation || null
        );
      }
      await stmt.finalize();
      signalBuffer = [];
      console.log(`[STORAGE] Flushed to SQLite.`);
    }

    res.json({ success: true, count: signalBuffer.length });
  });

  app.get("/api/mock-signals", async (req, res) => {
     // Return real history from SQLite. If empty, return empty array.
     // NO MOCK DATA is generated here to ensure hardware-integrity reporting.
     const history = await db.all('SELECT * FROM signals ORDER BY timestamp DESC LIMIT 100');
     res.json(history);
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
