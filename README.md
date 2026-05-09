# Wardrive Pro: Technical Specification & Operator Guide

## 1. System Architecture
Wardrive Pro is a professional-grade signal reconnaissance platform designed to run on-device (Edge Computing) to ensure maximum privacy and zero reliance on cloud infrastructure.

### Hardware Stack
- **RTL-SDR (Software Defined Radio):** Capture wideband radio emissions (IMSI, Pagers, LoRa, 433MHz signals).
- **ESP32 Dev Kit V1:** Dedicated 2.4GHz WiFi and Bluetooth scanning co-processor.
- **Alfa Network USB WiFi:** High-gain primary scanner supporting Monitor Mode for capture of hidden SSIDs and management frames.
- **USB GPS Puck:** Precise NMEA positioning data.
- **Host Device:** (e.g., Raspberry Pi 4/5 or Laptop) Running the Wardrive Pro Node.js server.

---

## 2. Software Runtime
The runtime is built on **Node.js (Turbo-Engine)** with specialized buffers for high-frequency signal ingestion.

### Data Flow
1. **Physical Layer:** Hardware interfaces (Serial/USB) capture raw RF data.
2. **Driver Layer:** 
   - `serialport` handles GPS NMEA sentences.
   - `airmon-ng` puts the Alfa card into monitor mode.
   - `rtl_power` logs frequency energy.
3. **Ingestion Layer:** Data is parsed and stored in a **Circular Buffer** (RAM).
4. **Persistence Layer:** Every 20 signals (or 60 seconds), data is flushed to a **Local SQLite Database**.
5. **View Layer:** The React Immersive UI fetches data via `/api` for real-time visualization.

---

## 3. Hardware Setup Instructions

### A. GPS Integration
Connect your USB GPS puck. Identify the device path:
```bash
ls /dev/ttyUSB* # Usually /dev/ttyUSB0
```
Update `server.ts` configuration with the correct baud rate (usually 9600).

### B. Alfa WiFi Monitor Mode
Your Alfa card must be in monitor mode for advanced capabilities:
```bash
sudo airmon-ng start wlan1
# Your driver will now target wlan1mon
```

### C. ESP32 BLE Bridge
Flash the included `WARDIVE_FIRMWARE.ino` to your ESP32. It is strictly for BLE/Bluetooth discovery and will push data to the host via USB-Serial.

### D. SDR Scanning Strategy
The system uses the RTL-SDR to perform a broad "Energy Scan". If a frequency peaks (e.g. 433.9MHz), the system flags it for closer inspection and records a 5-second burst for later metadata extraction.
- **Start Capture:** `npm run dev` (Starts backend + frontend bridge).
- **Export Data:** Navigate to `Explorer -> Export CSV`.
- **Enrichment:** On the Explorer page, use the 'Enrichment' toggle when internet is available to pull vendor OUI information for MAC addresses.

---

## 5. Security & Privacy
- **Zero-Cloud:** All signal data stays on your device's filesystem.
- **In-Memory Scrubbing:** Temporary buffers are wiped immediately after persistence.
- **Field Encryption:** Option in `Settings` to hash MAC addresses and SSIDs using HMAC-SHA256 for redacted sharing.
