export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    return res.status(500).json({ error: 'Pesapal credentials are not set in environment variables.' });
  }

  const pesapalUrl = 'https://pay.pesapal.com/v3/api/Auth/RequestToken';
  const pesapalHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(consumerKey + ':' + consumerSecret).toString('base64'),
  };

  try {
    const response = await fetch(pesapalUrl, {
      method: 'POST',
      headers: pesapalHeaders,
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Pesapal token', details: error.message });
  }
} 