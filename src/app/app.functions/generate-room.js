const axios = require("axios");

exports.main = async (context = {}) => {
  try {
    const body = typeof context.body === "string" ? JSON.parse(context.body) : context.body;
    const { name, description, scheduledAt } = body;

    if (!name || !description || !scheduledAt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields", body }),
      };
    }

    const username = "c6339d3bb63f43519a6a11726e3981aa";
    const password = "6bhm+F8enAYTseM3w3KDRhZr77OBvtyfzRjl8ZAms8c=";
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    const payload = { name, description, scheduledAt };
    console.log("Sending payload to API:", payload);

    const response = await axios.post(
      "https://vcc-api.aurous.org.au/api/v1/rooms",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`,
        },
      }
    );

    console.log("API response:", response.data);

    // ✅ Return properly
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (err) {
    console.error("Error creating room:", err.response?.data || err.message);

    return {
      statusCode: err.response?.status || 500,
      body: JSON.stringify({
        message: err.response?.data || err.message || "Internal Server Error",
      }),
    };
  }
};
