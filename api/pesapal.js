export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { method, url } = req;
  const pesapalBaseUrl = "https://pay.pesapal.com/v3";
  
  // Get credentials from environment variables
  const consumerKey = process.env.VITE_PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.VITE_PESAPAL_CONSUMER_SECRET;

  console.log("Pesapal proxy function called");
  console.log("Method:", method);
  console.log("URL:", url);
  console.log("Has credentials:", !!(consumerKey && consumerSecret));

  if (!consumerKey || !consumerSecret) {
    console.error("Missing Pesapal credentials");
    return res.status(500).json({ 
      error: "Pesapal credentials not configured" 
    });
  }

  try {
    // Parse the URL to determine the endpoint
    const urlPath = new URL(url, `http://${req.headers.host}`).pathname;
    const endpoint = urlPath.replace("/api/pesapal", "");

    console.log(`Pesapal proxy request: ${method} ${endpoint}`);
    console.log('Full URL:', url);
    console.log('URL Path:', urlPath);
    console.log('Parsed endpoint:', endpoint);
    console.log('Request method:', method);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Test endpoint to verify function is working
    if (endpoint === "/test" && method === "GET") {
      console.log("Handling /test endpoint");
      return res.status(200).json({ 
        message: "Pesapal proxy is working",
        timestamp: new Date().toISOString(),
        endpoint,
        method
      });
    }

    if (endpoint === "/auth" && method === "POST") {
      console.log("Handling /auth endpoint");
      // Handle authentication
      const authResponse = await fetch(`${pesapalBaseUrl}/api/Auth/RequestToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
        }),
      });

      const authData = await authResponse.json();
      
      if (!authResponse.ok) {
        console.error("Pesapal auth error:", authData);
        return res.status(authResponse.status).json(authData);
      }

      return res.status(200).json(authData);

    } else if (endpoint === "/submit-order" && method === "POST") {
      console.log("Handling /submit-order endpoint");
      // Handle order submission
      const orderData = req.body;
      
      // First get access token
      const tokenResponse = await fetch(`${pesapalBaseUrl}/api/Auth/RequestToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error("Failed to get access token:", errorData);
        return res.status(tokenResponse.status).json(errorData);
      }

      const { token } = await tokenResponse.json();

      // Submit the order
      const orderResponse = await fetch(`${pesapalBaseUrl}/api/Transactions/SubmitOrderRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();
      
      if (!orderResponse.ok) {
        console.error("Pesapal order submission error:", orderResult);
        return res.status(orderResponse.status).json(orderResult);
      }

      return res.status(200).json(orderResult);

    } else if (endpoint.startsWith("/transaction-status") && method === "GET") {
      console.log("Handling /transaction-status endpoint");
      // Handle transaction status
      const { searchParams } = new URL(url, `http://${req.headers.host}`);
      const orderTrackingId = searchParams.get("orderTrackingId");

      if (!orderTrackingId) {
        return res.status(400).json({ 
          error: "orderTrackingId is required" 
        });
      }

      // First get access token
      const tokenResponse = await fetch(`${pesapalBaseUrl}/api/Auth/RequestToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error("Failed to get access token:", errorData);
        return res.status(tokenResponse.status).json(errorData);
      }

      const { token } = await tokenResponse.json();

      // Get transaction status
      const statusResponse = await fetch(
        `${pesapalBaseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const statusResult = await statusResponse.json();
      
      if (!statusResponse.ok) {
        console.error("Pesapal transaction status error:", statusResult);
        return res.status(statusResponse.status).json(statusResult);
      }

      return res.status(200).json(statusResult);

    } else {
      console.log("No matching endpoint found");
      console.log("Available endpoints: /auth (POST), /submit-order (POST), /transaction-status (GET)");
      return res.status(404).json({ 
        error: "Endpoint not found",
        debug: {
          endpoint,
          method,
          urlPath
        }
      });
    }

  } catch (error) {
    console.error("Pesapal proxy error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
} 