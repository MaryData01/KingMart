import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;
const isConfigured = !!apiKey;

let stripeInstance = null;

if (isConfigured) {
  stripeInstance = new Stripe(apiKey, {
    apiVersion: '2023-10-16' // Stable API version
  });
  console.log('Stripe client connected.');
} else {
  console.log('Stripe API Key missing. Operating in MOCK payment mode.');
}

// Mock stripe implementation for seamless execution
const mockStripe = {
  checkout: {
    sessions: {
      create: async (params) => {
        console.log('--- MOCK STRIPE SESSION CREATION ---');
        console.log('Order Details:', JSON.stringify(params, null, 2));
        
        const mockSessionId = `mock_stripe_session_${Date.now()}`;
        // Extract success and cancel URLs from parameters
        const successUrl = params.success_url.replace('{CHECKOUT_SESSION_ID}', mockSessionId);
        const cancelUrl = params.cancel_url;
        
        return {
          id: mockSessionId,
          url: successUrl // Direct redirection to success page
        };
      }
    }
  }
};

export const stripe = isConfigured ? stripeInstance : mockStripe;
export const isStripeMock = !isConfigured;

export default stripe;
