const fetch = require('node-fetch');

exports.main = async (context) => {
  // Safely parse the request body
  let body = {};
  if (typeof context.body === 'object' && context.body !== null) {
    body = context.body;
  } else {
    try {
      body = JSON.parse(context.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON', message: e.message }),
      };
    }
  }

  const fileId = body.fileId;

  if (!fileId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing fileId in JSON body' }),
    };
  }

  try {
    // Fetch the HubSpot File Manager API without automatically following redirects
    const response = await fetch(
      `https://api.hubapi.com/filemanager/api/v3/files/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_PRIVATE_APP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        redirect: 'manual', // Important: do not follow redirects automatically
      }
    );

    // If API responds with a redirect, use the Location header as the final URL
    let fileUrl;
    if (response.status === 302 || response.headers.get('location')) {
      fileUrl = response.headers.get('location');
    } else if (response.ok) {
      const data = await response.json();
      fileUrl = data.url; // fallback to URL in API response
    } else {
      const errText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'HubSpot API error', details: errText }),
      };
    }

    // Return the final file URL
    return {
      statusCode: 200,
      body: JSON.stringify({ url: fileUrl }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch file URL',
        message: e.message,
        stack: e.stack,
      }),
    };
  }
};
