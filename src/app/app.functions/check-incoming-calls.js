const axios = require("axios");

exports.main = async (context = {}) => {
  try {
    // Parse body
    const body = typeof context.body === "string" ? JSON.parse(context.body) : context.body;
    const { customObjectId } = body;

    if (!customObjectId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing customObjectId in request body" }),
      };
    }

    console.log("check-incoming-calls received customObjectId:", customObjectId);

    // HubSpot API call to fetch the connection record
    const token = process.env.HUBSPOT_EVENTS_APP_TOKEN;
    const url = `https://api.hubapi.com/crm/v3/objects/2-45699152/${customObjectId}`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const record = response.data;
    console.log("Fetched connection record:", record);

    // Check if call_status is "pending" (or any status that counts as incoming)
    const callStatus = record?.properties?.call_status || null;

    const hasIncomingCall = callStatus === "pending"; // adjust if needed

    return {
      statusCode: 200,
      body: JSON.stringify({
        hasIncomingCall,
        caller_id: record?.properties?.caller_id || null,
        receiver_id: record?.properties?.receiver_id || null,
        room_reference: record?.properties?.room_reference || null,
      }),
    };

  } catch (err) {
    console.error("Error in check-incoming-calls:", err.response?.data || err.message);

    return {
      statusCode: err.response?.status || 500,
      body: JSON.stringify({
        message: err.response?.data || err.message || "Internal Server Error",
      }),
    };
  }
};
