const axios = require("axios");

exports.main = async (context = {}) => {
  try {
    const recordId = context.query?.record_id;
    if (!recordId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "record_id is required" }),
      };
    }

    // HubSpot token from secrets
    const token = process.env.HUBSPOT_EVENTS_APP_TOKEN;
    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Missing HubSpot token" }),
      };
    }

    // Fetch the connection record
    const url = `https://api.hubapi.com/crm/v3/objects/2-45699152/${recordId}?properties=caller_id,receiver_id,call_status,room_reference`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const record = res.data;
    const callStatus = record?.properties?.call_status;
    const roomRef = record?.properties?.room_reference;

    return {
      statusCode: 200,
      body: JSON.stringify({
        call_status: callStatus,
        room_reference: roomRef,
      }),
    };
  } catch (err) {
    console.error("Check call status error:", err.response?.data || err.message);
    return {
      statusCode: err.response?.status || 500,
      body: JSON.stringify({
        message: err.response?.data || err.message || "Internal Server Error",
      }),
    };
  }
};
