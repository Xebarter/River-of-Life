import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Image, 
  BookOpen, 
  Heart, 
  Gift, 
  HelpingHand as PrayingHands, 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  LogOut,
  Plus,
  Upload,
  X,
  Music,
  Video,
  Edit,
  Trash2,
  Eye,
  Home,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  User,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase, signOutAdmin } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface DashboardStats {
  totalDonations: number;
  pendingPrayers: number;
  totalGalleryItems: number;
  totalDevotions: number;
  totalResources: number;
  thisMonthDonations: number;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio';
  url: string;
  category: string;
  created_at: string;
}

interface Devotion {
  id: string;
  title: string;
  content: string;
  scripture: string;
  author: string;
  created_at: string;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
}

interface Donation {
  id: string;
  amount: number;
  currency: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  status: string;
  created_at: string;
  pesapal_tracking_id: string;
}

interface PrayerRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  request: string;
  is_anonymous: boolean;
  status: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    pendingPrayers: 0,
    totalGalleryItems: 0,
    totalDevotions: 0,
    totalResources: 0,
    thisMonthDonations: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'devotions' | 'gallery' | 'donations' | 'prayers'>('overview');
  const [resources, setResources] = useState<Resource[]>([]);
  const [devotions, setDevotions] = useState<Devotion[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showDevotionModal, setShowDevotionModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showGallerySuccess, setShowGallerySuccess] = useState(false);

  // Filter states for donations and prayers
  const [donationFilter, setDonationFilter] = useState('all');
  const [prayerFilter, setPrayerFilter] = useState('all');
  const [donationSearch, setDonationSearch] = useState('');
  const [prayerSearch, setPrayerSearch] = useState('');

  // Resource form state
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    type: 'audio' as 'video' | 'audio',
    url: '',
    category: 'sermon',
    file: null as File | null
  });

  // Devotion form state
  const [devotionForm, setDevotionForm] = useState({
    title: '',
    content: '',
    scripture: '',
    author: 'Pastor'
  });

  // Gallery form state
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    category: 'general',
    files: [] as File[],
    previews: [] as string[],
  });
  const [galleryUploadResults, setGalleryUploadResults] = useState<{success: number, failed: number, errors: string[]}>({success: 0, failed: 0, errors: []});

  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    if (activeTab === 'resources') {
      fetchResources();
    } else if (activeTab === 'devotions') {
      fetchDevotions();
    } else if (activeTab === 'gallery') {
      fetchGalleryItems();
    } else if (activeTab === 'donations') {
      fetchDonations();
    } else if (activeTab === 'prayers') {
      fetchPrayerRequests();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      // Get total donations amount
      const { data: donations } = await supabase
        .from('donations')
        .select('amount, created_at, status');

      const completedDonations = donations?.filter(d => d.status === 'completed') || [];
      const totalDonations = completedDonations.reduce((sum, d) => sum + Number(d.amount), 0);

      // Get this month's donations
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthDonations = completedDonations
        .filter(d => new Date(d.created_at) >= thisMonth)
        .reduce((sum, d) => sum + Number(d.amount), 0);

      // Get pending prayer requests
      const { count: pendingPrayers } = await supabase
        .from('prayer_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get gallery items count
      const { count: totalGalleryItems } = await supabase
        .from('gallery')
        .select('*', { count: 'exact', head: true });

      // Get devotions count
      const { count: totalDevotions } = await supabase
        .from('devotions')
        .select('*', { count: 'exact', head: true });

      // Get resources count
      const { count: totalResources } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalDonations,
        pendingPrayers: pendingPrayers || 0,
        totalGalleryItems: totalGalleryItems || 0,
        totalDevotions: totalDevotions || 0,
        totalResources: totalResources || 0,
        thisMonthDonations,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchDevotions = async () => {
    try {
      const { data, error } = await supabase
        .from('devotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevotions(data || []);
    } catch (error) {
      console.error('Error fetching devotions:', error);
    }
  };

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    }
  };

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const fetchPrayerRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrayerRequests(data || []);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
    }
  };

  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let url = resourceForm.url;

      // If it's an audio file and a file is selected, upload it
      if (resourceForm.type === 'audio' && resourceForm.file) {
        url = await uploadFile(resourceForm.file, 'resources');
      }

      const { error } = await supabase
        .from('resources')
        .insert({
          title: resourceForm.title,
          description: resourceForm.description,
          type: resourceForm.type,
          url: url,
          category: resourceForm.category,
        });

      if (error) throw error;

      // Reset form and close modal
      setResourceForm({
        title: '',
        description: '',
        type: 'audio',
        url: '',
        category: 'sermon',
        file: null
      });
      setShowResourceModal(false);
      fetchResources();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error creating resource:', error);
      alert('Error creating resource. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDevotionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { error } = await supabase
        .from('devotions')
        .insert({
          title: devotionForm.title,
          content: devotionForm.content,
          scripture: devotionForm.scripture,
          author: devotionForm.author,
        });

      if (error) throw error;

      // Reset form and close modal
      setDevotionForm({
        title: '',
        content: '',
        scripture: '',
        author: 'Pastor'
      });
      setShowDevotionModal(false);
      fetchDevotions();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error creating devotion:', error);
      alert('Error creating devotion. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryForm((prev) => ({
      ...prev,
      files,
      previews: files.map((file) => URL.createObjectURL(file)),
    }));
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setGalleryUploadResults({success: 0, failed: 0, errors: []});

    try {
      if (!galleryForm.files.length) {
        alert('Please select at least one image file');
        return;
      }
      let success = 0;
      let failed = 0;
      let errors: string[] = [];
      for (const file of galleryForm.files) {
        try {
          const imageUrl = await uploadFile(file, 'gallery');
          const { error } = await supabase
            .from('gallery')
            .insert({
              title: galleryForm.title,
              description: galleryForm.description,
              image_url: imageUrl,
              category: galleryForm.category,
            });
          if (error) throw error;
          success++;
        } catch (err: any) {
          failed++;
          errors.push(file.name + ': ' + (err?.message || 'Unknown error'));
        }
      }
      setGalleryUploadResults({success, failed, errors});
      if (success > 0 && failed === 0) {
        setShowGallerySuccess(true);
        setTimeout(() => setShowGallerySuccess(false), 3500);
      }
      if (failed === 0) {
        setTimeout(() => {
          setGalleryForm({
            title: '',
            description: '',
            category: 'general',
            files: [],
            previews: [],
          });
          setShowGalleryModal(false);
          setGalleryUploadResults({success: 0, failed: 0, errors: []});
        }, 1200);
      }
      fetchGalleryItems();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchResources();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Error deleting resource. Please try again.');
    }
  };

  const deleteDevotion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this devotion?')) return;

    try {
      const { error } = await supabase
        .from('devotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchDevotions();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error deleting devotion:', error);
      alert('Error deleting devotion. Please try again.');
    }
  };

  const deleteGalleryItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;

    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchGalleryItems();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      alert('Error deleting gallery item. Please try again.');
    }
  };

  const updatePrayerStatus = async (id: string, status: 'pending' | 'prayed') => {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      fetchPrayerRequests();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error updating prayer status:', error);
      alert('Error updating prayer status. Please try again.');
    }
  };

  const deletePrayerRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prayer request?')) return;

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPrayerRequests();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error deleting prayer request:', error);
      alert('Error deleting prayer request. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'prayed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter functions
  const filteredDonations = donations.filter(donation => {
    const matchesFilter = donationFilter === 'all' || donation.status === donationFilter;
    const matchesSearch = donationSearch === '' || 
      donation.donor_name?.toLowerCase().includes(donationSearch.toLowerCase()) ||
      donation.donor_email?.toLowerCase().includes(donationSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredPrayerRequests = prayerRequests.filter(prayer => {
    const matchesFilter = prayerFilter === 'all' || prayer.status === prayerFilter;
    const matchesSearch = prayerSearch === '' ||
      prayer.name?.toLowerCase().includes(prayerSearch.toLowerCase()) ||
      prayer.request?.toLowerCase().includes(prayerSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOutAdmin();
    setLoggingOut(false);
    navigate('/login', { replace: true });
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Donations',
      value: formatCurrency(stats.totalDonations),
      icon: DollarSign,
      color: 'bg-green-500',
      change: `${formatCurrency(stats.thisMonthDonations)} this month`,
    },
    {
      name: 'Pending Prayers',
      value: stats.pendingPrayers.toString(),
      icon: PrayingHands,
      color: 'bg-purple-500',
      change: 'Awaiting prayer',
    },
    {
      name: 'Gallery Items',
      value: stats.totalGalleryItems.toString(),
      icon: Image,
      color: 'bg-blue-500',
      change: 'Total photos',
    },
    {
      name: 'Resources',
      value: stats.totalResources.toString(),
      icon: Heart,
      color: 'bg-orange-500',
      change: 'Videos & Audio',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Success Notification */}
      {showGallerySuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90vw] max-w-md px-4">
          <div className="flex items-center gap-3 bg-green-100 border border-green-300 text-green-800 rounded-lg shadow-lg px-4 py-3 animate-fade-in-down">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="font-semibold text-base sm:text-lg">Upload Successful!</span>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loggingOut ? <LoadingSpinner size="sm" /> : <LogOut className="w-4 h-4" />}
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 w-full flex-1">
        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <nav className="flex space-x-2 sm:space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: TrendingUp },
              { id: 'donations', name: 'Donations', icon: DollarSign },
              { id: 'prayers', name: 'Prayer Requests', icon: PrayingHands },
              { id: 'resources', name: 'Resources', icon: Heart },
              { id: 'devotions', name: 'Devotions', icon: BookOpen },
              { id: 'gallery', name: 'Gallery', icon: Image },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.name} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                      <div className={`${card.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{card.name}</p>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">{card.change}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowResourceModal(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group text-left"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="ml-3 font-semibold text-gray-900">Add Resource</h3>
                  </div>
                  <p className="text-sm text-gray-600">Upload audio files or add video links</p>
                </button>

                <button
                  onClick={() => setShowDevotionModal(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group text-left"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-orange-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="ml-3 font-semibold text-gray-900">Add Devotion</h3>
                  </div>
                  <p className="text-sm text-gray-600">Create new daily devotions</p>
                </button>

                <button
                  onClick={() => setShowGalleryModal(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group text-left"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="ml-3 font-semibold text-gray-900">Add Gallery Item</h3>
                  </div>
                  <p className="text-sm text-gray-600">Upload church photos</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Incoming Funds</h2>
              <button
                onClick={fetchDonations}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={donationFilter}
                  onChange={(e) => setDonationFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by donor name or email..."
                  value={donationSearch}
                  onChange={(e) => setDonationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Donations Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDonations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {donation.donor_name || 'Anonymous'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(donation.amount)}
                        </div>
                        <div className="text-sm text-gray-500">{donation.currency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {donation.donor_email && (
                            <div className="flex items-center mb-1">
                              <Mail className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="text-xs">{donation.donor_email}</span>
                            </div>
                          )}
                          {donation.donor_phone && (
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="text-xs">{donation.donor_phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDonations.length === 0 && (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No donations found matching your criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* Prayer Requests Tab */}
        {activeTab === 'prayers' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Prayer Requests Management</h2>
              <button
                onClick={fetchPrayerRequests}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={prayerFilter}
                  onChange={(e) => setPrayerFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="prayed">Prayed</option>
                </select>
              </div>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search prayer requests..."
                  value={prayerSearch}
                  onChange={(e) => setPrayerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Prayer Requests List */}
            <div className="space-y-4">
              {filteredPrayerRequests.map((prayer) => (
                <div key={prayer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <PrayingHands className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {prayer.is_anonymous ? 'Anonymous Request' : prayer.name || 'Anonymous'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(prayer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prayer.status)}`}>
                        {prayer.status}
                      </span>
                      <div className="flex space-x-1">
                        {prayer.status === 'pending' ? (
                          <button
                            onClick={() => updatePrayerStatus(prayer.id, 'prayed')}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                            title="Mark as prayed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updatePrayerStatus(prayer.id, 'pending')}
                            className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors"
                            title="Mark as pending"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deletePrayerRequest(prayer.id)}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          title="Delete request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-700 leading-relaxed">{prayer.request}</p>
                  </div>
                  
                  {!prayer.is_anonymous && (prayer.email || prayer.phone) && (
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {prayer.email && (
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          <span>{prayer.email}</span>
                        </div>
                      )}
                      {prayer.phone && (
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          <span>{prayer.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredPrayerRequests.length === 0 && (
              <div className="text-center py-8">
                <PrayingHands className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No prayer requests found matching your criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Manage Resources</h2>
              <button
                onClick={() => setShowResourceModal(true)}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    {resource.type === 'video' ? (
                      <Video className="w-5 h-5 text-purple-600 mr-2" />
                    ) : (
                      <Music className="w-5 h-5 text-orange-500 mr-2" />
                    )}
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {resource.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteResource(resource.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Devotions Tab */}
        {activeTab === 'devotions' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Manage Devotions</h2>
              <button
                onClick={() => setShowDevotionModal(true)}
                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Devotion</span>
              </button>
            </div>

            <div className="space-y-4">
              {devotions.map((devotion) => (
                <div key={devotion.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{devotion.title}</h3>
                      <p className="text-sm text-purple-600 italic mb-2">"{devotion.scripture}"</p>
                      <p className="text-sm text-gray-600 mb-2">
                        {devotion.content.length > 150 
                          ? `${devotion.content.substring(0, 150)}...`
                          : devotion.content
                        }
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">By {devotion.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(devotion.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDevotion(devotion.id)}
                      className="ml-4 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Manage Gallery</h2>
              <button
                onClick={() => setShowGalleryModal(true)}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Image</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.category}
                      </span>
                      <button
                        onClick={() => deleteGalleryItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {galleryUploadResults.success > 0 || galleryUploadResults.failed > 0 ? (
              <div className="mt-2">
                <p className="text-green-600 text-sm">Uploaded: {galleryUploadResults.success}</p>
                {galleryUploadResults.failed > 0 && (
                  <>
                    <p className="text-red-600 text-sm">Failed: {galleryUploadResults.failed}</p>
                    <ul className="text-xs text-red-500 list-disc ml-5">
                      {galleryUploadResults.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Resource</h3>
              <button
                onClick={() => setShowResourceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResourceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value as 'video' | 'audio' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={resourceForm.category}
                  onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="sermon">Sermon</option>
                  <option value="worship">Worship</option>
                  <option value="youth">Youth</option>
                  <option value="bible-study">Bible Study</option>
                  <option value="general">General</option>
                </select>
              </div>

              {resourceForm.type === 'video' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audio File</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files?.[0] || null })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supported formats: MP3, WAV, M4A</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Add Resource</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Devotion Modal */}
      {showDevotionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Devotion</h3>
              <button
                onClick={() => setShowDevotionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDevotionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={devotionForm.title}
                  onChange={(e) => setDevotionForm({ ...devotionForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scripture</label>
                <input
                  type="text"
                  value={devotionForm.scripture}
                  onChange={(e) => setDevotionForm({ ...devotionForm, scripture: e.target.value })}
                  placeholder="e.g., John 3:16 - For God so loved the world..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={devotionForm.content}
                  onChange={(e) => setDevotionForm({ ...devotionForm, content: e.target.value })}
                  rows={8}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={devotionForm.author}
                  onChange={(e) => setDevotionForm({ ...devotionForm, author: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDevotionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Devotion</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2 sm:px-0">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Gallery Image</h3>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGallerySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={galleryForm.description}
                  onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="worship">Worship</option>
                  <option value="youth">Youth</option>
                  <option value="outreach">Outreach</option>
                  <option value="prayer">Prayer</option>
                  <option value="study">Bible Study</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image Files</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryFilesChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF, WebP</p>
              </div>

              {galleryForm.previews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {galleryForm.previews.map((src, idx) => (
                    <img key={idx} src={src} alt={`preview-${idx}`} className="w-16 h-16 object-cover rounded border" />
                  ))}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Images</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;