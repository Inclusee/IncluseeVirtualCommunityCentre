const axios = require("axios");

exports.main = async (context = {}) => {
  try {
    const body = typeof context.body === "string" ? JSON.parse(context.body) : context.body;
    const { roomReference, userId } = body;

    if (!roomReference || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields: roomReference, userId", body }),
      };
    }

	const hubspotToken = process.env.HUBSPOT_EVENTS_APP_TOKEN;
	const OBJECT_TYPE_ID = "2-45149429";
	const associationTypeId = 129;

    // Basic Auth credentials
    const username = "c6339d3bb63f43519a6a11726e3981aa";
    const password = "6bhm+F8enAYTseM3w3KDRhZr77OBvtyfzRjl8ZAms8c=";
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    const searchPayload = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "room_reference",
              operator: "EQ",
              value: roomReference,
            },
          ],
        },
      ],
      properties: ["room_reference"],
      limit: 1,
    };

    const searchResp = await axios.post(
      `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE_ID}/search`,
      searchPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hubspotToken}`,
        },
      }
    );

	let eventId = null;
    if (searchResp.data.results && searchResp.data.results.length > 0) {
      eventId = searchResp.data.results[0].id;
      console.log("Found Event record:", eventId);

      // Associate Contact <-> Event using batch API
      const assocUrl = `https://api.hubapi.com/crm/v4/associations/contact/${OBJECT_TYPE_ID}/batch/create`;

      const assocBody = {
        inputs: [
          {
            from: { id: userId.toString() }, // contact ID
            to: { id: eventId.toString() }, // event record ID
            types: [
              {
                associationCategory: "USER_DEFINED",
                associationTypeId: associationTypeId,
              },
            ],
          },
        ],
      };

      try {
        const assocResp = await axios.post(assocUrl, assocBody, {
          headers: {
            Authorization: `Bearer ${hubspotToken}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Association response:", assocResp.data);
      } catch (assocErr) {
        console.error("Association failed:", assocErr.response?.data || assocErr.message);
      }
    } else {
      console.log("⚠️ No Event record found with room_reference:", roomReference);
    }

    const url = `https://vcc-api.aurous.org.au/api/v1/rooms/${roomReference}/join/${userId}`;
    console.log("Joining room with URL:", url);

    const joinResponse = await axios.post(
      url,
      {}, // body is empty for join request
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      }
    );

    console.log("Join API response:", joinResponse.data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        eventId,
        association: eventId ? "success" : "skipped",
        joinRoom: joinResponse.data,
      }),
    };
  } catch (err) {
    console.error("Error joining room:", err.response?.data || err.message);

    return {
      statusCode: err.response?.status || 500,
      body: JSON.stringify({
        message: err.response?.data || err.message || "Internal Server Error",
      }),
    };
  }
};
