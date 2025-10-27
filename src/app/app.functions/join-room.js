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

    // Basic Auth credentials
    const username = "c6339d3bb63f43519a6a11726e3981aa";
    const password = "6bhm+F8enAYTseM3w3KDRhZr77OBvtyfzRjl8ZAms8c=";
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    const url = `https://vcc-api.aurous.org.au/api/v1/rooms/${roomReference}/join/${userId}`;
    console.log("Joining room with URL:", url);

    const response = await axios.post(
      url,
      {}, // body is empty for join request
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`,
        },
      }
    );

    console.log("Join API response:", response.data);

    // Return the token or full API response
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
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
