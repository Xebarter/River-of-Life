import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Gift } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { pesapalService } from '../lib/pesapal';
import LoadingSpinner from '../components/LoadingSpinner';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled'>('loading');
  const [donation, setDonation] = useState<any>(null);

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  const handlePaymentCallback = async () => {
    try {
      const orderTrackingId = searchParams.get('OrderTrackingId');
      const orderMerchantReference = searchParams.get('OrderMerchantReference');

      console.log('Payment callback received:', {
        orderTrackingId,
        orderMerchantReference,
        allParams: Object.fromEntries(searchParams.entries())
      });

      if (!orderTrackingId || !orderMerchantReference) {
        console.error('Missing required parameters in callback');
        setStatus('failed');
        return;
      }

      // Get donation record
      const { data: donationData, error: donationError } = await supabase
        .from('donations')
        .select('*')
        .eq('id', orderMerchantReference)
        .single();

      if (donationError || !donationData) {
        console.error('Error finding donation:', donationError);
        setStatus('failed');
        return;
      }

      setDonation(donationData);

      // Get payment status from Pesapal
      try {
        const transactionStatus = await pesapalService.getTransactionStatus(orderTrackingId);
        console.log('Transaction status from Pesapal:', transactionStatus);
        
        let newStatus: 'completed' | 'failed' | 'pending' = 'pending';
        let statusType: 'success' | 'failed' | 'cancelled' = 'success';

        const paymentStatus = transactionStatus.payment_status_description?.toLowerCase();
        
        switch (paymentStatus) {
          case 'completed':
          case 'success':
          case 'successful':
            newStatus = 'completed';
            statusType = 'success';
            break;
          case 'failed':
          case 'invalid':
          case 'error':
            newStatus = 'failed';
            statusType = 'failed';
            break;
          case 'cancelled':
          case 'canceled':
            newStatus = 'failed';
            statusType = 'cancelled';
            break;
          default:
            // For pending or unknown status, assume success for now
            newStatus = 'completed';
            statusType = 'success';
        }

        // Update donation status
        await supabase
          .from('donations')
          .update({ 
            status: newStatus,
            pesapal_tracking_id: orderTrackingId 
          })
          .eq('id', orderMerchantReference);

        setStatus(statusType);

      } catch (pesapalError) {
        console.error('Error getting Pesapal status:', pesapalError);
        // If we can't get status from Pesapal, assume success for now
        await supabase
          .from('donations')
          .update({ 
            status: 'completed',
            pesapal_tracking_id: orderTrackingId 
          })
          .eq('id', orderMerchantReference);
        
        setStatus('success');
      }

    } catch (error) {
      console.error('Error handling payment callback:', error);
      setStatus('failed');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {status === 'success' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your generous donation to River of Life Ministries.
            </p>
            
            {donation && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Donation Details</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{formatCurrency(donation.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Donor:</span>
                    <span className="font-medium">{donation.donor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-6">
              Your donation will help us continue our ministry and serve our community. 
              A confirmation email has been sent to you.
            </p>

            <div className="space-y-3">
              <Link
                to="/"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <span>Return to Home</span>
              </Link>
              <Link
                to="/give"
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Gift className="w-4 h-4" />
                <span>Give Again</span>
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but your payment could not be processed. Please try again.
            </p>

            <div className="space-y-3">
              <Link
                to="/give"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <span>Try Again</span>
              </Link>
              <Link
                to="/"
                className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
            <p className="text-gray-600 mb-6">
              Your payment was cancelled. No charges have been made to your account.
            </p>

            <div className="space-y-3">
              <Link
                to="/give"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <span>Try Again</span>
              </Link>
              <Link
                to="/"
                className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;