const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GROQ_API_KEY not configured' })
      };
    }

    const requestBody = JSON.parse(event.body);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Log the error server-side (if Netlify logging is checked)
      console.error(`Groq API Error (${response.status}): ${errorText}`);
      return {
        statusCode: response.status, // Keep Groq's original status code
        body: JSON.stringify({ 
          error: 'Groq API request failed.', 
          groqStatusCode: response.status,
          groqResponseBody: errorText 
        })
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    // Log the error server-side
    console.error('Proxy internal error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Proxy internal error.', 
        errorMessage: error.message,
        errorStack: error.stack // Optional: consider if stack trace should be exposed
      })
    };
  }
};
