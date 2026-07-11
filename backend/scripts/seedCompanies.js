const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Company = require('../models/Company');
const User = require('../models/User');

dotenv.config({ path: __dirname + '/../.env' });

const dbUrl = process.env.MONGO_URI;

mongoose.connect(dbUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

const industries = ['Technology', 'FinTech', 'HealthTech', 'E-commerce', 'SaaS', 'AI', 'EdTech', 'Cybersecurity'];
const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'London, UK', 'Berlin, Germany', 'Remote', 'Toronto, ON', 'Singapore'];
const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

const generateCompanies = () => {
  const companies = [];
  for (let i = 1; i <= 30; i++) {
    companies.push({
      recruiterId: new mongoose.Types.ObjectId(), // Needs unique recruiter per company by schema
      name: `Company ${i}`,
      logo: `https://ui-avatars.com/api/?name=Company+${i}&background=random&color=fff&size=150`,
      coverImage: `https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200&h=400`,
      about: `We are an innovative company leading the future of our industry. Our mission is to build software that empowers millions globally. Join us to make an impact.`,
      website: `https://company${i}.example.com`,
      industry: industries[Math.floor(Math.random() * industries.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      employeeCount: sizes[Math.floor(Math.random() * sizes.length)],
      culture: 'Innovative, fast-paced, and inclusive environment.',
      benefits: ['Health Insurance', 'Remote Work', 'Flexible Hours', 'Stock Options', 'Learning Budget'],
      rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5 to 5.0
      isVerified: Math.random() > 0.5,
      followersCount: Math.floor(Math.random() * 5000)
    });
  }
  
  // Replace first company name with a realistic one for testing
  companies[0].name = 'TechNova Systems';
  companies[0].industry = 'AI';
  companies[0].location = 'San Francisco, CA';
  companies[0].about = 'TechNova Systems is pioneering the next generation of artificial intelligence tools for enterprise businesses. Our platform integrates seamlessly to drive unprecedented growth.';
  
  companies[1].name = 'CloudSync Solutions';
  companies[1].industry = 'SaaS';
  companies[1].location = 'Remote';

  companies[2].name = 'FinSecure';
  companies[2].industry = 'FinTech';
  companies[2].location = 'London, UK';

  return companies;
};

const seed = async () => {
  try {
    const count = await Company.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} companies. No seeding needed.`);
      process.exit(0);
    }

    console.log('Generating 30 dummy companies...');
    const companies = generateCompanies();
    
    await Company.insertMany(companies);
    
    console.log('Seeding complete! 30 companies added.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding companies:', err);
    process.exit(1);
  }
};

seed();
