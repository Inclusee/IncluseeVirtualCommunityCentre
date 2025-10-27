const axios = require("axios");

exports.main = async (context) => {
  try {
    const { customObjectId, properties } = context.body;

    console.log("Updating object ID:", customObjectId);

    const updateRes = await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/2-45149429/${customObjectId}`,
      { properties },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_EVENTS_APP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(updateRes.data),
    };
  } catch (error) {
    console.error("Failed to update:", error.response?.data || error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data,
      }),
    };
  }
};
