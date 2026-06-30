import Constants from "expo-constants";

// Set in app.json under expo.extra.apiBaseUrl, or override here for device testing.
// NOTE: "localhost" only works in an emulator on the same machine as the backend.
// For a physical device, replace with your computer's LAN IP, e.g. http://192.168.1.50:5000/api
export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || "http://localhost:5000/api";
