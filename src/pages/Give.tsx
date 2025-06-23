import React, { useState } from 'react';
import { Heart, CreditCard, Smartphone, Gift, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { pesapalService } from '../lib/pesapal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

interface DonationForm {
  donor_name: string;
  email: string;
  phone_number: string;
  amount: number;
  message: string;
}

const Give: React.FC = () => {
  const [form, setForm] = useState<DonationForm>({
    donor_name: '',
    email: '',
    phone_number: '',
    amount: 0,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetAmounts = [10000, 25000, 50000, 100000, 250000, 500000];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const handlePresetAmount = (amount: number) => {
    setForm(prev => ({ ...prev, amount }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!form.donor_name || !form.email || !form.amount || form.amount <= 0) {
        throw new Error('Please fill in all required fields');
      }

      if (form.amount < 1000) {
        throw new Error('Minimum donation amount is UGX 1,000');
      }

      console.log('Processing donation:', form);

      // Create donation record - using correct column names from database schema
      const { data: donation, error: dbError } = await supabase
        .from('donations')
        .insert({
          donor_name: form.donor_name,
          donor_email: form.email, // Changed from 'email' to 'donor_email'
          donor_phone: form.phone_number, // Changed from 'phone_number' to 'donor_phone'
          amount: form.amount,
          status: 'pending', // Changed from 'payment_status' to 'status'
        })
        .select()
        .single();

      if (dbError || !donation) {
        console.error('Database error:', dbError);
        throw new Error('Failed to create donation record. Please try again.');
      }

      console.log('Donation record created:', donation);

      // Prepare names for Pesapal
      const names = form.donor_name.trim().split(' ');
      const firstName = names[0] || 'Anonymous';
      const lastName = names.slice(1).join(' ') || 'Donor';

      // Submit order to Pesapal
      try {
        const pesapalResponse = await pesapalService.submitOrder({
          amount: form.amount,
          description: `Donation to River of Life Ministries - ${form.message || 'General Support'}`,
          email: form.email,
          phone: form.phone_number,
          firstName,
          lastName,
          reference: donation.id,
        });

        console.log('Pesapal response:', pesapalResponse);

        // Update donation with Pesapal tracking ID
        await supabase
          .from('donations')
          .update({ pesapal_tracking_id: pesapalResponse.order_tracking_id })
          .eq('id', donation.id);

        // Redirect to Pesapal payment page
        window.location.href = pesapalResponse.redirect_url;

      } catch (pesapalError) {
        console.error('Pesapal error:', pesapalError);
        
        // Update donation status to failed
        await supabase
          .from('donations')
          .update({ status: 'failed' })
          .eq('id', donation.id);

        // Provide more specific error messages based on the error type
        if (pesapalError instanceof Error) {
          const errorMessage = pesapalError.message.toLowerCase();
          
          if (errorMessage.includes('invalid pesapal credentials') || 
              errorMessage.includes('consumer key') || 
              errorMessage.includes('consumer secret')) {
            throw new Error('Payment service configuration error. Please contact support.');
          } else if (errorMessage.includes('network error') || 
                     errorMessage.includes('fetch') ||
                     errorMessage.includes('connection')) {
            throw new Error('Network connection error. Please check your internet connection and try again.');
          } else if (errorMessage.includes('server error') || 
                     errorMessage.includes('service temporarily unavailable')) {
            throw new Error('Payment service is temporarily unavailable. Please try again in a few minutes.');
          } else if (errorMessage.includes('authentication expired')) {
            throw new Error('Payment session expired. Please try again.');
          } else if (errorMessage.includes('invalid order data')) {
            throw new Error('Please check your donation information and try again.');
          } else {
            // For any other Pesapal errors, show a generic message
            throw new Error('Payment processing is currently unavailable. Please try again later or contact support.');
          }
        } else {
          throw new Error('Payment processing failed. Please try again or contact support.');
        }
      }

    } catch (err) {
      console.error('Error processing donation:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while processing your donation');
    } finally {
      setLoading(false);
    }
  };

  const ministryAreas = [
    {
      name: 'General Ministry',
      description: 'Support our ongoing ministry operations and community outreach',
      icon: Heart,
    },
    {
      name: 'Youth Programs',
      description: 'Invest in the next generation through youth activities and education',
      icon: Gift,
    },
    {
      name: 'Community Outreach',
      description: 'Help us serve the less fortunate in our community',
      icon: Heart,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Give | River of Life Ministries</title>
        <meta name="description" content="Support River of Life Ministries through your generous giving." />
        <link rel="canonical" href="https://yourdomain.com/give" />
        {/* Open Graph */}
        <meta property="og:title" content="Give | River of Life Ministries" />
        <meta property="og:description" content="Support River of Life Ministries through your generous giving." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/give" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Give | River of Life Ministries" />
        <meta name="twitter:description" content="Support River of Life Ministries through your generous giving." />
        {/* Structured Data */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "DonateAction",
            "name": "Give",
            "url": "https://yourdomain.com/give"
          }
        `}</script>
      </Helmet>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Give</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your generous giving enables us to continue spreading God's love and serving our community. Every contribution makes a difference.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donation Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Donation</h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-red-700">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="donor_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="donor_name"
                      name="donor_name"
                      value={form.donor_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleInputChange}
                    placeholder="+256..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Amount Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Donation Amount (UGX) *
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handlePresetAmount(amount)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          form.amount === amount
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={form.amount || ''}
                    onChange={handleInputChange}
                    min="1000"
                    step="1000"
                    required
                    placeholder="Enter custom amount (minimum UGX 1,000)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Share what inspired your giving..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !form.donor_name || !form.email || !form.amount || form.amount < 1000}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Proceed to Payment</span>
                    </>
                  )}
                </button>

                {/* Payment Methods */}
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-2">Secure payment powered by Pesapal</p>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <CreditCard className="w-4 h-4" />
                      <span>Credit/Debit Cards</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Smartphone className="w-4 h-4" />
                      <span>Mobile Money</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Ministry Areas */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-4">Your Impact</h3>
                <p className="text-purple-100 mb-4">
                  Every gift, no matter the size, helps us continue our mission of sharing God's love and serving our community.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">15+</div>
                    <div className="text-purple-100">Years of Ministry</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">1000+</div>
                    <div className="text-purple-100">Lives Touched</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ministry Areas</h3>
                <div className="space-y-4">
                  {ministryAreas.map((area, index) => {
                    const Icon = area.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Icon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{area.name}</h4>
                          <p className="text-sm text-gray-600">{area.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <nav>
        <Link to="/">Back to Home</Link>
      </nav>
    </>
  );
};

export default Give;