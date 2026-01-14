exports.main = async (context) => {
  if (!process.env.HUBSPOT_EVENTS_APP_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ENV VAR MISSING" }),
    };
  }

  try {
    const { customObjectId, properties } = context.body || {};

    if (!customObjectId || !properties) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing customObjectId or properties" }),
      };
    }

    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/2-45149429/${customObjectId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_EVENTS_APP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ properties }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "HubSpot API error",
          details: errText,
        }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
