import React, { useState } from 'react';
import { HelpingHand as PrayingHands, Send, CheckCircle, AlertCircle, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

interface PrayerForm {
  name: string;
  email: string;
  phone: string;
  request: string;
  is_anonymous: boolean;
}

const Prayer: React.FC = () => {
  const [form, setForm] = useState<PrayerForm>({
    name: '',
    email: '',
    phone: '',
    request: '',
    is_anonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!form.name || !form.email || !form.request) {
        throw new Error('Please fill in all required fields');
      }

      // Submit prayer request
      const { error: dbError } = await supabase
        .from('prayer_requests')
        .insert({
          name: form.is_anonymous ? 'Anonymous' : form.name,
          email: form.email,
          phone: form.phone || null,
          request: form.request,
          is_anonymous: form.is_anonymous,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to submit prayer request');
      }

      // Reset form and show success
      setForm({
        name: '',
        email: '',
        phone: '',
        request: '',
        is_anonymous: false,
      });
      setSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

    } catch (err) {
      console.error('Error submitting prayer request:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your prayer request');
    } finally {
      setLoading(false);
    }
  };

  const prayerPromises = [
    {
      verse: "Matthew 18:20",
      text: "For where two or three gather in my name, there am I with them."
    },
    {
      verse: "James 5:16",
      text: "The prayer of a righteous person is powerful and effective."
    },
    {
      verse: "1 John 5:14",
      text: "This is the confidence we have in approaching God: that if we ask anything according to his will, he hears us."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Prayer Requests | River of Life Ministries</title>
        <meta name="description" content="Submit your prayer requests to River of Life Ministries. We are here to pray for you." />
        <link rel="canonical" href="https://yourdomain.com/prayer" />
        {/* Open Graph */}
        <meta property="og:title" content="Prayer Requests | River of Life Ministries" />
        <meta property="og:description" content="Submit your prayer requests to River of Life Ministries. We are here to pray for you." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/prayer" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Prayer Requests | River of Life Ministries" />
        <meta name="twitter:description" content="Submit your prayer requests to River of Life Ministries. We are here to pray for you." />
        {/* Structured Data */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Prayer Requests",
            "url": "https://yourdomain.com/prayer"
          }
        `}</script>
      </Helmet>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Prayer Requests</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe in the power of prayer and would be honored to pray for you. Share your prayer request with our prayer team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Prayer Request Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <PrayingHands className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Submit Prayer Request</h2>
              </div>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <div>
                    <p className="text-green-700 font-medium">Prayer request submitted successfully!</p>
                    <p className="text-green-600 text-sm">Our prayer team will lift you up in prayer.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required={!form.is_anonymous}
                      disabled={form.is_anonymous}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
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
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="+256..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_anonymous"
                    name="is_anonymous"
                    checked={form.is_anonymous}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_anonymous" className="ml-2 block text-sm text-gray-700">
                    Submit this prayer request anonymously
                  </label>
                </div>

                {/* Prayer Request */}
                <div>
                  <label htmlFor="request" className="block text-sm font-medium text-gray-700 mb-2">
                    Prayer Request *
                  </label>
                  <textarea
                    id="request"
                    name="request"
                    value={form.request}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Share your prayer request with us. We will keep it confidential and lift you up in prayer."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !form.email || !form.request || (!form.name && !form.is_anonymous)}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Prayer Request</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Your prayer request will be shared with our confidential prayer team. 
                  We will pray for you and may follow up to see how God is working in your situation.
                </p>
              </div>
            </div>

            {/* Prayer Promises */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-4">God Hears Your Prayers</h3>
                <p className="text-purple-100 mb-4">
                  We believe that prayer is one of the most powerful tools God has given us. 
                  When we come together in prayer, God moves in miraculous ways.
                </p>
                <div className="text-center">
                  <PrayingHands className="w-12 h-12 mx-auto mb-2 text-purple-100" />
                  <p className="text-lg font-semibold">Our Prayer Team Prays Daily</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">God's Promises About Prayer</h3>
                <div className="space-y-4">
                  {prayerPromises.map((promise, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4">
                      <p className="text-gray-700 italic mb-1">"{promise.text}"</p>
                      <p className="text-sm text-purple-600 font-semibold">{promise.verse}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">How We Pray for You</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Your request is shared confidentially with our prayer team</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>We pray for you during our weekly prayer meetings</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>We may follow up to see how God is working in your life</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Prayer;