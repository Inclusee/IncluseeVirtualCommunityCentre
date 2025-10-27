const axios = require("axios");

exports.main = async (context) => {
  try {
    const { contactIds } = context.body || {};

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "No contact IDs provided" }),
      };
    }

    const results = {};

    // Split contact IDs into batches of 100 (HubSpot limit)
    const batches = [];
    for (let i = 0; i < contactIds.length; i += 100) {
      batches.push(contactIds.slice(i, i + 100));
    }

    // Process batches sequentially
    for (const batch of batches) {
      const payload = {
        properties: ["firstname", "lastname"],
        inputs: batch.map((id) => ({ id })),
      };

      try {
        const res = await axios.post(
          "https://api.hubapi.com/crm/v3/objects/contacts/batch/read",
          payload,
          {
            headers: {
              Authorization: `Bearer ${process.env.HUBSPOT_EVENTS_APP_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        (res.data.results || []).forEach((contact) => {
          const props = contact.properties || {};
          const fullName = `${props.firstname || ""} ${props.lastname || ""}`.trim();
          results[contact.id] = fullName || contact.id;
        });
      } catch (err) {
        console.error("Batch read failed:", err.response?.data || err.message);
        batch.forEach((id) => {
          results[id] = id; // fallback gracefully
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "ok", data: results }),
    };
  } catch (error) {
    console.error("Serverless error:", error.response?.data || error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        message: error.message,
        details: error.response?.data,
      }),
    };
  }
};
