// PLACEHOLDER third-party tracking integration.
// TRACKING_API_BASE_URL / TRACKING_API_KEY are reserved in .env.example, but
// no real courier/tracking provider has been finalized yet (see
// docs/Phase-01_Project_Planning.md). This returns a deterministic mocked
// status so Order.tracking, the history timeline, and the tracking APIs can
// all be built and tested now — and swapped for a real HTTP call later
// without changing any of the controllers that call this function.
const fetchTrackingStatus = async ({ provider, trackingId }) => {
  // A real integration would look something like:
  //   const res = await axios.get(`${process.env.TRACKING_API_BASE_URL}/track/${trackingId}`, {
  //     headers: { Authorization: `Bearer ${process.env.TRACKING_API_KEY}` },
  //   });
  //   return { status: res.data.status, trackingUrl: res.data.trackingUrl };

  return {
    status: "in_transit", // mocked — always returns this until a real provider is wired in
    trackingUrl: trackingId ? `https://tracking.example.com/${provider || "unknown"}/${trackingId}` : null,
  };
};

module.exports = fetchTrackingStatus;
