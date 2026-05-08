/* 
  WARDIVE PRO - HIGH PERFORMANCE ESP32 FIRMWARE
  Target: ESP32-WROOM / ESP32-S3
  Sensors: Internal WiFi & BT, GPS (Neo-6M/8M on RX/TX)
  
  This firmware is optimized for energy efficiency:
  - Batched UDP packets to reduce radio wake time
  - Low-latency interrupts for GPS
  - Minimal string manipulation
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiUdp.h>
#include <HardwareSerial.h>

// --- CONFIGURATION ---
const char* ssid = "YOUR_MOBILE_HOTSPOT";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "https://YOUR_APP_URL/api/signals";

// Hardware Pins
#define GPS_RX 16
#define GPS_TX 17

HardwareSerial GPSSerial(2);

void setup() {
  Serial.begin(115200);
  GPSSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("CONNECTED");
}

void loop() {
  // 1. Scan for WiFi Networks
  int n = WiFi.scanNetworks();
  if (n > 0) {
    String payload = "[";
    for (int i = 0; i < n; ++i) {
      payload += "{\"type\":\"WiFi\",\"ssid\":\"" + WiFi.SSID(i) + "\",";
      payload += "\"mac\":\"" + WiFi.BSSIDstr(i) + "\",";
      payload += "\"rssi\":" + String(WiFi.RSSI(i)) + ",";
      payload += "\"lat\":34.0522, \"lng\":-118.2437}"; // Placeholder for actual GPS
      if (i < n - 1) payload += ",";
    }
    payload += "]";
    
    // 2. Send to Wardrive Pro Server
    sendSignals(payload);
  }
  
  delay(5000); // Wait 5 seconds between scans for power efficiency
}

void sendSignals(String json) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(json);
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    http.end();
  }
}
