const axios = require("axios");

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken = null;
let tokenExpiry = 0;

async function getShiprocketToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials missing in .env");
  }

  const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
    email,
    password,
  });

  const token = response.data?.token;
  if (!token) {
    throw new Error("Failed to get Shiprocket token");
  }

  cachedToken = token;
  tokenExpiry = Date.now() + 8 * 24 * 60 * 60 * 1000; // cache for 8 days
  return cachedToken;
}

async function fetchTrackingStatus({ provider, trackingId }) {
  if (!trackingId) {
    return {
      status: "pending",
      trackingUrl: null,
      provider: provider || "shiprocket",
      raw: null,
    };
  }

  try {
    const token = await getShiprocketToken();

    const response = await axios.get(
      `${SHIPROCKET_BASE_URL}/courier/track/awb/${trackingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const payload = response.data;
    const shipment =
      payload?.tracking_data?.shipment_track?.[0] ||
      payload?.tracking_data?.track_status?.[0] ||
      null;

    const currentStatus =
      payload?.tracking_data?.shipment_status ||
      shipment?.current_status ||
      shipment?.status ||
      "in_transit";

    return {
      status: String(currentStatus).toLowerCase().replace(/\s+/g, "_"),
      trackingUrl: trackingId
        ? `https://app.shiprocket.in/tracking/${trackingId}`
        : null,
      provider: provider || "shiprocket",
      raw: payload,
    };
  } catch (error) {
    console.error(
      "Shiprocket tracking error:",
      error.response?.data || error.message
    );

    return {
      status: "not_shipped",
      trackingUrl: trackingId
        ? `https://app.shiprocket.in/tracking/${trackingId}`
        : null,
      provider: provider || "shiprocket",
      raw: error.response?.data || null,
    };
  }
}

module.exports = fetchTrackingStatus;
