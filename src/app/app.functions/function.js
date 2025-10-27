const axios = require('axios');

exports.main = async function (event, context) {
  const apiKey = 'c6339d3bb63f43519a6a11726e3981aa';
  const apiSecret = '6bhm+F8enAYTseM3w3KDRhZr77OBvtyfzRjl8ZAms8c=';
  const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  try {
    const response = await axios.get('https://vcc-api.aurous.org.au/api/v1/rooms', {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data || null
      })
    };
  }
};
