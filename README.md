# River of Life Ministries Website

A comprehensive church website built with React, TypeScript, Tailwind CSS, and Supabase. This production-ready application features a modern design with full functionality for gallery management, daily devotions, resources, donations, prayer requests, and admin management.

## 🌟 Features

### Public Features
- **Gallery**: Browse church event photos with category filtering and lightbox viewing
- **Daily Devotions**: Read inspiring devotional content with search functionality
- **Resources**: Access YouTube videos and audio files (sermons, worship music)
- **Giving**: Secure donation system with Pesapal payment integration
- **Prayer Requests**: Submit prayer requests with optional anonymity
- **Responsive Design**: Mobile-first design that works on all devices

### Admin Features
- **Secure Dashboard**: Comprehensive admin panel with analytics
- **Content Management**: Manage gallery, devotions, resources, donations, and prayer requests
- **Analytics**: Track donation totals, prayer request volume, and content statistics
- **File Upload**: Upload images and audio files to Supabase Storage

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Payments**: Pesapal API integration
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Vercel

## 🎨 Design Theme

The website uses a spiritual and welcoming color scheme:
- **Primary**: Purple (#6A1B9A)
- **Secondary**: Orange (#F57C00)
- **Gradients**: Beautiful gradients combining purple and orange
- **Typography**: Clean, readable fonts with proper hierarchy
- **Animations**: Subtle hover effects and transitions

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd river-of-life-ministries
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://gejitcapzblfqtwzndmr.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlaml0Y2FwemJsZnF0d3puZG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwODM1NjUsImV4cCI6MjA2NTY1OTU2NX0.sz2nR3y28EMs8OBe3UFut__8s82tezuesbJV3r8SCdg

   # Pesapal Configuration
   VITE_PESAPAL_CONSUMER_KEY=nu6JUrYluZWKIK7kDq/bmAXsE+JZsOXx
   VITE_PESAPAL_CONSUMER_SECRET=FJS6YRvsINWIn7oDoDLaLcfNehU=
   VITE_PESAPAL_BASE_URL=https://pay.pesapal.com/v3
   VITE_PESAPAL_IPN_ID=24bef7e0-734c-471f-b351-dbb66b6f56ad
   VITE_PESAPAL_CALLBACK_URL=http://localhost:5173/payment/callback

   # Contact Information
   VITE_CONTACT_EMAIL=info@riveroflifeministries.org
   VITE_WHATSAPP_NUMBER=+256784811208
   ```

4. **Set up Supabase Database**
   Run the migration files in your Supabase SQL editor:
   - `supabase/migrations/create_church_schema.sql`
   - `supabase/migrations/insert_sample_data.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Tables
- **gallery**: Church event images with categories and captions
- **devotions**: Daily devotional content with scripture references
- **resources**: YouTube videos and audio files for sermons/worship
- **donations**: Payment records with Pesapal integration
- **prayer_requests**: Community prayer submissions
- **admins**: Secure admin authentication

### Storage Buckets
- **gallery**: Church event photos
- **resources**: Audio files for sermons and worship music

## 🔐 Admin Access

**Default Admin Credentials:**
- Email: `admin@riveroflifeministries.org`
- Password: `RiverLife123`

Access the admin panel at `/admin` to manage all content and view analytics.

## 💳 Payment Integration

The application integrates with Pesapal for secure payment processing:
- Supports credit/debit cards and mobile money
- Secure transaction handling with PCI-DSS compliance
- Real-time payment status updates
- Donation tracking and analytics

## 🌐 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables**
   In your Vercel dashboard, add all environment variables from `.env`
   
   **Important**: Update the callback URL for production:
   ```env
   VITE_PESAPAL_CALLBACK_URL=https://your-domain.vercel.app/payment/callback
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 📱 Features Overview

### Gallery Management
- Upload and organize church photos
- Category-based filtering (worship, youth, outreach, etc.)
- Lightbox viewing with captions
- Lazy loading for optimal performance

### Devotion System
- Daily devotional content with scripture
- Search functionality across titles and content
- Author attribution and date tracking
- Responsive reading experience

### Resource Library
- YouTube video embedding for sermons
- Audio file streaming for worship music
- Category-based organization
- Mobile-friendly media players

### Donation Platform
- Preset donation amounts in UGX
- Custom amount input
- Secure Pesapal payment processing
- Donation tracking and receipts

### Prayer Request System
- Anonymous or named prayer submissions
- Email notifications to prayer team
- Admin management interface
- Status tracking (pending/prayed)

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth)
├── lib/               # Utilities (Supabase, Pesapal)
├── pages/             # Page components
│   ├── Admin/         # Admin-specific pages
│   └── ...           # Public pages
└── ...
```

## 🎯 Assumptions & Defaults

- **Currency**: All amounts in Ugandan Shillings (UGX)
- **Donation Presets**: UGX 10,000, 25,000, 50,000, 100,000, 250,000, 500,000
- **Contact Email**: info@riveroflifeministries.org
- **WhatsApp**: +256784811208
- **Sample Data**: Includes 5 gallery images, 5 devotions, 3 resources, 2 donations, 2 prayer requests

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- Admin-only access to sensitive data
- Input sanitization and validation
- Secure payment processing with Pesapal
- Environment variable protection
- HTTPS enforcement

## 📞 Support

For technical support or questions about the application:
- Email: info@riveroflifeministries.org
- WhatsApp: +256784811208

## 📄 License

This project is proprietary software for River of Life Ministries.

---

**Built with ❤️ for River of Life Ministries**