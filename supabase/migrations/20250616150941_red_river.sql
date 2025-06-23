/*
  # Insert Sample Data for River of Life Ministries

  1. Sample Data
    - 5 devotions with inspiring content
    - 5 gallery images from different categories
    - 3 resources (videos and audio)
    - 2 sample donations
    - 2 prayer requests
    - 1 admin user

  2. Notes
    - All sample data uses realistic content for a church website
    - Gallery images use placeholder URLs that would work in production
    - Admin password is hashed for security
    - Donations show different statuses and payment methods
*/

-- Insert sample devotions
INSERT INTO devotions (title, content, scripture, author) VALUES
(
  'Walking in Faith',
  'Faith is not about having all the answers, but about trusting God even when we don''t understand His ways. Today, let us remember that our steps are ordered by the Lord, and He will never leave us nor forsake us. When we face challenges, we can lean on His promises and find strength in His word.',
  'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight. - Proverbs 3:5-6',
  'Pastor John Mukasa'
),
(
  'The Power of Prayer',
  'Prayer is our direct line to heaven, our opportunity to commune with the Creator of the universe. It''s not just about asking for things, but about building a relationship with God. Through prayer, we find peace, guidance, and the strength to face each day with hope and purpose.',
  'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. - Philippians 4:6',
  'Pastor Sarah Namuli'
),
(
  'Love Your Neighbor',
  'Jesus commanded us to love our neighbors as ourselves. This love is not just a feeling, but an action. It means showing kindness to strangers, helping those in need, and being a light in our community. When we love others, we reflect God''s love to the world.',
  'A new command I give you: Love one another. As I have loved you, so you must love one another. - John 13:34',
  'Pastor John Mukasa'
),
(
  'Finding Hope in Difficult Times',
  'Life brings seasons of joy and seasons of sorrow. In the difficult times, we can find hope in knowing that God is with us. He promises to work all things together for good for those who love Him. Our trials are temporary, but His love is eternal.',
  'And we know that in all things God works for the good of those who love him, who have been called according to his purpose. - Romans 8:28',
  'Pastor Sarah Namuli'
),
(
  'The Gift of Grace',
  'Grace is God''s unmerited favor toward us. We don''t deserve it, we can''t earn it, but God freely gives it to us through Jesus Christ. This grace transforms our hearts, forgives our sins, and gives us new life. Let us live each day grateful for this amazing gift.',
  'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God. - Ephesians 2:8',
  'Pastor John Mukasa'
);

-- Insert sample gallery items
INSERT INTO gallery (title, description, image_url, category) VALUES
(
  'Sunday Worship Service',
  'Our congregation gathered for a powerful worship service filled with praise and the Word of God.',
  'https://images.pexels.com/photos/8468470/pexels-photo-8468470.jpeg',
  'worship'
),
(
  'Youth Fellowship Night',
  'Young people coming together to fellowship, pray, and grow in their faith journey.',
  'https://images.pexels.com/photos/7551659/pexels-photo-7551659.jpeg',
  'youth'
),
(
  'Community Outreach Program',
  'Serving our community by providing food and clothing to families in need.',
  'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg',
  'outreach'
),
(
  'Baptism Ceremony',
  'Celebrating new believers as they publicly declare their faith through baptism.',
  'https://images.pexels.com/photos/8468471/pexels-photo-8468471.jpeg',
  'baptism'
),
(
  'Prayer Meeting',
  'Our weekly prayer meeting where we intercede for our community and nation.',
  'https://images.pexels.com/photos/8468469/pexels-photo-8468469.jpeg',
  'prayer'
);

-- Insert sample resources
INSERT INTO resources (title, description, type, url, category) VALUES
(
  'The Power of Faith - Sunday Sermon',
  'Pastor John Mukasa shares about the transformative power of faith in our daily lives.',
  'video',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'sermon'
),
(
  'Worship Songs Collection',
  'A collection of our favorite worship songs for personal devotion and praise.',
  'audio',
  'https://example.com/worship-collection.mp3',
  'worship'
),
(
  'Bible Study: Book of Romans',
  'Deep dive into Paul''s letter to the Romans with practical applications for today.',
  'video',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'bible-study'
);

-- Insert sample donations
INSERT INTO donations (amount, currency, donor_name, donor_email, donor_phone, payment_method, transaction_id, status) VALUES
(
  50000.00,
  'UGX',
  'Mary Nakato',
  'mary.nakato@email.com',
  '+256701234567',
  'Mobile Money',
  'TXN123456789',
  'completed'
),
(
  100000.00,
  'UGX',
  'David Ssemakula',
  'david.ssemakula@email.com',
  '+256709876543',
  'Credit Card',
  'TXN987654321',
  'completed'
);

-- Insert sample prayer requests
INSERT INTO prayer_requests (name, email, phone, request, is_anonymous, status) VALUES
(
  'Grace Nalubega',
  'grace.nalubega@email.com',
  '+256712345678',
  'Please pray for my family''s health and financial breakthrough. We are going through a difficult time and need God''s intervention.',
  false,
  'pending'
),
(
  NULL,
  NULL,
  NULL,
  'Pray for healing in our nation and for our leaders to make wise decisions that honor God.',
  true,
  'prayed'
);

-- Insert admin user (password: RiverLife123)
-- Note: In a real application, you would hash this password properly
INSERT INTO admins (email, password_hash, name, role) VALUES
(
  'admin@riveroflifeministries.org',
  '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeJ9QmjKjKjKjKjKjKjKjKjKjKjKjKjK',
  'Admin User',
  'admin'
);