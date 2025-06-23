interface PesapalSubmitOrderRequest {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address: string;
    phone_number?: string;
    country_code: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    line_1?: string;
    line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    zip_code?: string;
  };
}

interface PesapalSubmitOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
}

interface PesapalAuthResponse {
  token: string;
  expiryDate: string;
  error?: {
    type: string;
    code: string;
    message: string;
    description: string;
  };
}

class PesapalService {
  private baseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;
  private ipnId: string;
  private callbackUrl: string;
  private isDevelopment: boolean;

  constructor() {
    // Check if we're in development mode
    this.isDevelopment = import.meta.env.DEV;
    
    if (this.isDevelopment) {
      // In development, use direct Pesapal API calls
      this.baseUrl = 'https://pay.pesapal.com/v3';
    } else {
      // In production, use the serverless function proxy
      this.baseUrl = '/api/pesapal';
    }
    
    this.consumerKey = import.meta.env.VITE_PESAPAL_CONSUMER_KEY || '';
    this.consumerSecret = import.meta.env.VITE_PESAPAL_CONSUMER_SECRET || '';
    this.ipnId = import.meta.env.VITE_PESAPAL_IPN_ID || '';
    this.callbackUrl = import.meta.env.VITE_PESAPAL_CALLBACK_URL || '';
  }

  private formatPesapalError(error: any): string {
    const errorParts: string[] = [];
    
    if (error.type) errorParts.push(`Type: ${error.type}`);
    if (error.code) errorParts.push(`Code: ${error.code}`);
    if (error.message) errorParts.push(`Message: ${error.message}`);
    if (error.description) errorParts.push(`Description: ${error.description}`);
    
    return errorParts.length > 0 ? errorParts.join(' | ') : 'Unknown Pesapal error';
  }

  private async getAccessToken(): Promise<string> {
    try {
      console.log(`Requesting Pesapal access token via ${this.isDevelopment ? 'direct API' : 'proxy'}...`);
      
      if (this.isDevelopment) {
        // Direct API call for development
        const requestBody = {
          consumer_key: this.consumerKey.trim(),
          consumer_secret: this.consumerSecret.trim(),
        };

        const response = await fetch(`${this.baseUrl}/api/Auth/RequestToken`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Pesapal auth response status:', response.status);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Invalid Pesapal credentials. Please verify your consumer key and secret.');
          } else if (response.status === 403) {
            throw new Error('Pesapal account access denied. Please check your account status.');
          } else if (response.status === 500) {
            throw new Error('Pesapal server error. Please try again later or contact Pesapal support.');
          } else if (response.status >= 500) {
            throw new Error('Pesapal service temporarily unavailable. Please try again later.');
          } else {
            const errorText = await response.text();
            throw new Error(`Pesapal authentication failed (${response.status}): ${errorText || 'Unknown error'}`);
          }
        }

        const data: PesapalAuthResponse = await response.json();

        if (data.error) {
          throw new Error(`Pesapal API error: ${this.formatPesapalError(data.error)}`);
        }

        if (!data.token) {
          throw new Error('No access token received from Pesapal');
        }

        console.log('Successfully obtained Pesapal access token');
        return data.token;
      } else {
        // Serverless function call for production
        const response = await fetch(`${this.baseUrl}/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        console.log('Pesapal auth response status:', response.status);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Invalid Pesapal credentials. Please verify your consumer key and secret.');
          } else if (response.status === 403) {
            throw new Error('Pesapal account access denied. Please check your account status.');
          } else if (response.status === 500) {
            throw new Error('Pesapal server error. Please try again later or contact Pesapal support.');
          } else if (response.status >= 500) {
            throw new Error('Pesapal service temporarily unavailable. Please try again later.');
          } else {
            const errorText = await response.text();
            throw new Error(`Pesapal authentication failed (${response.status}): ${errorText || 'Unknown error'}`);
          }
        }

        const data: PesapalAuthResponse = await response.json();

        if (data.error) {
          throw new Error(`Pesapal API error: ${this.formatPesapalError(data.error)}`);
        }

        if (!data.token) {
          throw new Error('No access token received from Pesapal');
        }

        console.log('Successfully obtained Pesapal access token');
        return data.token;
      }
    } catch (error) {
      console.error('Error getting Pesapal access token:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error connecting to Pesapal. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  async submitOrder(orderData: {
    amount: number;
    description: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    reference: string;
  }): Promise<PesapalSubmitOrderResponse> {
    try {
      console.log(`Submitting order to Pesapal via ${this.isDevelopment ? 'direct API' : 'proxy'}:`, orderData);
      console.log('Development mode:', this.isDevelopment);
      console.log('Base URL:', this.baseUrl);
      
      if (this.isDevelopment) {
        console.log('Using direct API call for development...');
        // Direct API call for development
        const token = await this.getAccessToken();
        console.log('Token obtained successfully, length:', token.length);
        
        const submitOrderRequest: PesapalSubmitOrderRequest = {
          id: orderData.reference,
          currency: 'UGX',
          amount: orderData.amount,
          description: orderData.description,
          callback_url: this.callbackUrl,
          notification_id: this.ipnId,
          billing_address: {
            email_address: orderData.email,
            phone_number: orderData.phone || '',
            country_code: 'UG',
            first_name: orderData.firstName,
            last_name: orderData.lastName,
            line_1: '',
            city: '',
            state: '',
            postal_code: '',
          },
        };

        console.log('Submitting order request:', {
          ...submitOrderRequest,
          billing_address: {
            ...submitOrderRequest.billing_address,
            email_address: orderData.email.substring(0, 3) + '***'
          }
        });

        console.log('Full request URL:', `${this.baseUrl}/api/Transactions/SubmitOrderRequest`);
        console.log('Request headers:', {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.substring(0, 20)}...`,
          'Cache-Control': 'no-cache',
        });
        console.log('Request body:', JSON.stringify(submitOrderRequest, null, 2));

        const response = await fetch(`${this.baseUrl}/api/Transactions/SubmitOrderRequest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify(submitOrderRequest),
        });

        const responseText = await response.text();
        console.log('Pesapal submit order response status:', response.status);
        console.log('Pesapal submit order response:', responseText);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Pesapal authentication expired. Please try again.');
          } else if (response.status === 400) {
            throw new Error(`Invalid order data: ${responseText || 'Please check your information and try again.'}`);
          } else if (response.status === 405) {
            throw new Error(`Method not allowed: ${responseText || 'Please check the API endpoint and method.'}`);
          } else {
            throw new Error(`Failed to submit order to Pesapal (${response.status}): ${responseText || 'Unknown error'}`);
          }
        }

        if (!responseText) {
          throw new Error('Empty response from Pesapal order submission');
        }

        let data: PesapalSubmitOrderResponse;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Invalid JSON response from Pesapal: ${responseText}`);
        }

        console.log('Successfully submitted order to Pesapal');
        return data;
      } else {
        // Serverless function call for production
        const submitOrderRequest: PesapalSubmitOrderRequest = {
          id: orderData.reference,
          currency: 'UGX',
          amount: orderData.amount,
          description: orderData.description,
          callback_url: this.callbackUrl,
          notification_id: this.ipnId,
          billing_address: {
            email_address: orderData.email,
            phone_number: orderData.phone || '',
            country_code: 'UG',
            first_name: orderData.firstName,
            last_name: orderData.lastName,
            line_1: '',
            city: '',
            state: '',
            postal_code: '',
          },
        };

        console.log('Submitting order request:', {
          ...submitOrderRequest,
          billing_address: {
            ...submitOrderRequest.billing_address,
            email_address: orderData.email.substring(0, 3) + '***'
          }
        });

        const response = await fetch(`${this.baseUrl}/submit-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(submitOrderRequest),
        });

        console.log('Pesapal submit order response status:', response.status);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Pesapal authentication expired. Please try again.');
          } else if (response.status === 400) {
            const errorText = await response.text();
            throw new Error('Invalid order data. Please check your information and try again.');
          } else {
            const errorText = await response.text();
            throw new Error(`Failed to submit order to Pesapal (${response.status}): ${errorText || 'Unknown error'}`);
          }
        }

        const data: PesapalSubmitOrderResponse = await response.json();

        console.log('Successfully submitted order to Pesapal');
        return data;
      }
    } catch (error) {
      console.error('Error submitting order to Pesapal:', error);
      throw error;
    }
  }

  async getTransactionStatus(orderTrackingId: string): Promise<any> {
    try {
      console.log(`Getting transaction status from Pesapal via ${this.isDevelopment ? 'direct API' : 'proxy'}:`, orderTrackingId);
      
      if (this.isDevelopment) {
        // Direct API call for development
        const token = await this.getAccessToken();
        
        const response = await fetch(
          `${this.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
            },
          }
        );

        const responseText = await response.text();
        console.log('Pesapal transaction status response:', responseText);

        if (!response.ok) {
          throw new Error(`Failed to get transaction status (${response.status}): ${responseText}`);
        }

        return JSON.parse(responseText);
      } else {
        // Serverless function call for production
        const response = await fetch(
          `${this.baseUrl}/transaction-status?orderTrackingId=${orderTrackingId}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        console.log('Pesapal transaction status response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to get transaction status (${response.status}): ${errorText}`);
        }

        return await response.json();
      }
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }
}

export const pesapalService = new PesapalService();