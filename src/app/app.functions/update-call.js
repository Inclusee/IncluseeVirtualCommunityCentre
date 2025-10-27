const axios = require("axios");

exports.main = async (context = {}) => {
  try {
    const body = typeof context.body === "string" ? JSON.parse(context.body) : context.body;
    const { caller_id, receiver_id, call_status, room_reference } = body;

    if (!caller_id || !receiver_id || !call_status) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing required fields" }) };
    }

    const token = process.env.HUBSPOT_EVENTS_APP_TOKEN;
    const url = `https://api.hubapi.com/crm/v3/objects/2-45699152/${caller_id}`;

    const payload = {
      properties: {
        call_status,
        room_reference: room_reference || ""
      }
    };

    const response = await axios.patch(url, payload, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });

    return { statusCode: 200, body: JSON.stringify(response.data) };
  } catch (err) {
    console.error("Update call failed:", err.response?.data || err.message);
    return { statusCode: err.response?.status || 500, body: JSON.stringify({ message: err.response?.data || err.message }) };
  }
};
