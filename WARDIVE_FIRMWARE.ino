/* 
  WARDIVE PRO - BLE CO-PROCESSOR FIRMWARE
  Target: ESP32 Dev Kit V1
  Function: High-speed BLE/Bluetooth scanning.
  Communication: Serial @ 115200 baud
*/

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

int scanTime = 5; // Scan duration in seconds
BLEScan* pBLEScan;

class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
    void onResult(BLEAdvertisedDevice advertisedDevice) {
      // Format: [B|MAC|RSSI|NAME]
      Serial.print("[B|");
      Serial.print(advertisedDevice.getAddress().toString().c_str());
      Serial.print("|");
      Serial.print(advertisedDevice.getRSSI());
      Serial.print("|");
      Serial.print(advertisedDevice.haveName() ? advertisedDevice.getName().c_str() : "HIDDEN");
      Serial.println("]");
    }
};

void setup() {
  Serial.begin(115200);
  BLEDevice::init("WARDIVE_PRO_NODE");
  pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true); // Active scan for more details
  pBLEScan->setInterval(100);
  pBLEScan->setWindow(99); 
}

void loop() {
  BLEScanResults foundDevices = pBLEScan->start(scanTime, false);
  pBLEScan->clearResults();   // delete results fromBLEScan buffer to release memory
  delay(100);
}
