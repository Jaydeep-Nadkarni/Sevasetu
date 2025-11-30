import mongoose from 'mongoose'
import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import {
  User,
  NGO,
  Donation,
  Event,
  HelpRequest,
  Badge,
  Certificate,
  Transaction,
  Analytics,
} from '../models/index.js'

dotenv.config()

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n')

    // Connect to database
    await connectDB()

    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await Promise.all([
      User.deleteMany({}),
      NGO.deleteMany({}),
      Donation.deleteMany({}),
      Event.deleteMany({}),
      HelpRequest.deleteMany({}),
      Badge.deleteMany({}),
      Certificate.deleteMany({}),
      Transaction.deleteMany({}),
      Analytics.deleteMany({}),
    ])
    console.log('✅ Data cleared\n')

    // Create sample users
    console.log('👥 Creating sample users...')
    const users = await User.create([
      {
        firstName: 'Jaydeep',
        lastName: 'Nadkarni',
        email: 'jaydeep@sevasetu.com',
        password: 'password123',
        phone: '9876543210',
        role: 'admin',
        bio: 'Platform administrator and founder',
        location: {
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
        },
        isVerified: true,
        isActive: true,
      },
      {
        firstName: 'Priya',
        lastName: 'Singh',
        email: 'priya@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'ngo_admin',
        bio: 'NGO Administrator passionate about education',
        location: {
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
        },
        isVerified: true,
        isActive: true,
      },
      {
        firstName: 'Amit',
        lastName: 'Patel',
        email: 'amit@example.com',
        password: 'password123',
        phone: '9876543212',
        role: 'user',
        bio: 'Volunteer and donor',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
        },
        isVerified: true,
        isActive: true,
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        password: 'password123',
        phone: '9876543213',
        role: 'user',
        bio: 'Healthcare advocate',
        location: {
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
        },
        isVerified: true,
        isActive: true,
      },
      {
        firstName: 'Ravi',
        lastName: 'Kumar',
        email: 'ravi@example.com',
        password: 'password123',
        phone: '9876543214',
        role: 'user',
        bio: 'Environmental enthusiast',
        location: {
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India',
        },
        isVerified: true,
        isActive: true,
      },
    ])
    console.log(`✅ Created ${users.length} users\n`)

    // Create sample NGOs
    console.log('🏢 Creating sample NGOs...')
    const ngos = await NGO.create([
      {
        name: 'Education For All',
        description: 'Providing quality education to underprivileged children',
        mission: 'To ensure every child has access to quality education',
        vision: 'A world where education is a fundamental right for all',
        owner: users[1]._id,
        registrationNumber: 'NGO001',
        category: 'Education',
        location: {
          address: '123 Education Street',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India',
          coordinates: {
            type: 'Point',
            coordinates: [77.2065, 28.6139],
          },
        },
        contact: {
          email: 'info@educationforall.org',
          phone: '9876543210',
          website: 'www.educationforall.org',
        },
        totalDonations: 50000,
        totalVolunteerHours: 500,
        rating: 4.5,
        verificationStatus: 'verified',
        isActive: true,
      },
      {
        name: 'Health & Hope',
        description: 'Healthcare services for rural communities',
        mission: 'Providing accessible healthcare to all communities',
        vision: 'A healthy India',
        owner: users[1]._id,
        registrationNumber: 'NGO002',
        category: 'Healthcare',
        location: {
          address: '456 Hospital Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          coordinates: {
            type: 'Point',
            coordinates: [77.6245, 12.9716],
          },
        },
        contact: {
          email: 'info@healthhope.org',
          phone: '9876543211',
          website: 'www.healthhope.org',
        },
        totalDonations: 75000,
        totalVolunteerHours: 800,
        rating: 4.8,
        verificationStatus: 'verified',
        isActive: true,
      },
      {
        name: 'Green Earth Initiative',
        description: 'Environmental conservation and sustainability projects',
        mission: 'To protect and restore our environment',
        vision: 'A sustainable planet for future generations',
        owner: users[1]._id,
        registrationNumber: 'NGO003',
        category: 'Environment',
        location: {
          address: '789 Green Park',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          coordinates: {
            type: 'Point',
            coordinates: [72.8479, 19.0176],
          },
        },
        contact: {
          email: 'info@greenearthinitiative.org',
          phone: '9876543212',
          website: 'www.greenearthinitiative.org',
        },
        totalDonations: 60000,
        totalVolunteerHours: 600,
        rating: 4.6,
        verificationStatus: 'verified',
        isActive: true,
      },
    ])
    console.log(`✅ Created ${ngos.length} NGOs\n`)

    // Update NGO ownership
    users[1].ngoOwned = ngos[0]._id
    await users[1].save()

    // Create sample badges
    console.log('🏅 Creating sample badges...')
    const badges = await Badge.create([
      {
        name: 'First Step',
        description: 'Completed first volunteer hours',
        icon: 'badge-first-step.png',
        category: 'volunteering',
        criteria: {
          type: 'volunteer_hours',
          value: 1,
          description: 'Complete at least 1 volunteer hour',
        },
        rarity: 'common',
      },
      {
        name: 'Generous Heart',
        description: 'Donated for the first time',
        icon: 'badge-generous-heart.png',
        category: 'donation',
        criteria: {
          type: 'donation_amount',
          value: 100,
          description: 'Donate at least ₹100',
        },
        rarity: 'uncommon',
      },
      {
        name: 'Super Volunteer',
        description: 'Completed 100+ volunteer hours',
        icon: 'badge-super-volunteer.png',
        category: 'milestone',
        criteria: {
          type: 'volunteer_hours',
          value: 100,
          description: 'Complete 100+ volunteer hours',
        },
        rarity: 'rare',
      },
      {
        name: 'Legendary Donor',
        description: 'Donated over ₹10,000',
        icon: 'badge-legendary-donor.png',
        category: 'milestone',
        criteria: {
          type: 'donation_amount',
          value: 10000,
          description: 'Donate over ₹10,000',
        },
        rarity: 'epic',
      },
    ])
    console.log(`✅ Created ${badges.length} badges\n`)

    // Create sample events
    console.log('📅 Creating sample events...')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 7)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)

    const events = await Event.create([
      {
        title: 'Community Cleanup Drive',
        description: 'Join us in cleaning up the local park and surrounding areas',
        ngo: ngos[2]._id,
        organizer: users[1]._id,
        startDate,
        endDate,
        location: {
          address: 'Central Park, Mumbai',
          city: 'Mumbai',
          state: 'Maharashtra',
          coordinates: {
            type: 'Point',
            coordinates: [72.8479, 19.0176],
          },
        },
        category: 'volunteering',
        capacity: 100,
        status: 'upcoming',
        targetVolunteerHours: 50,
      },
      {
        title: 'Education Workshop',
        description: 'Interactive workshop on modern teaching methods',
        ngo: ngos[0]._id,
        organizer: users[1]._id,
        startDate,
        endDate,
        location: {
          address: 'Community Center, Delhi',
          city: 'Delhi',
          state: 'Delhi',
          coordinates: {
            type: 'Point',
            coordinates: [77.2065, 28.6139],
          },
        },
        category: 'educational',
        capacity: 50,
        status: 'upcoming',
        targetVolunteerHours: 20,
      },
    ])
    console.log(`✅ Created ${events.length} events\n`)

    // Create sample donations
    console.log('💝 Creating sample donations...')
    const donations = await Donation.create([
      {
        donor: users[2]._id,
        ngo: ngos[0]._id,
        amount: 5000,
        type: 'monetary',
        status: 'completed',
        paymentMethod: 'upi',
        description: 'Support for education programs',
        isAnonymous: false,
        certificateGenerated: true,
      },
      {
        donor: users[3]._id,
        ngo: ngos[1]._id,
        amount: 10000,
        type: 'monetary',
        status: 'completed',
        paymentMethod: 'credit_card',
        description: 'Healthcare initiative support',
        isAnonymous: false,
        certificateGenerated: true,
      },
      {
        donor: users[4]._id,
        ngo: ngos[2]._id,
        amount: 3000,
        type: 'monetary',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        description: 'Environmental conservation fund',
        isAnonymous: true,
        certificateGenerated: false,
      },
    ])
    console.log(`✅ Created ${donations.length} donations\n`)

    // Create sample transactions
    console.log('💳 Creating sample transactions...')
    const transactions = await Transaction.create([
      {
        user: users[2]._id,
        ngo: ngos[0]._id,
        donation: donations[0]._id,
        amount: 5000,
        paymentMethod: 'upi',
        status: 'completed',
        transactionId: `TXN-${Date.now()}-001`,
        paymentGateway: 'razorpay',
      },
      {
        user: users[3]._id,
        ngo: ngos[1]._id,
        donation: donations[1]._id,
        amount: 10000,
        paymentMethod: 'credit_card',
        status: 'completed',
        transactionId: `TXN-${Date.now()}-002`,
        paymentGateway: 'razorpay',
      },
      {
        user: users[4]._id,
        ngo: ngos[2]._id,
        donation: donations[2]._id,
        amount: 3000,
        paymentMethod: 'bank_transfer',
        status: 'completed',
        transactionId: `TXN-${Date.now()}-003`,
        paymentGateway: 'razorpay',
      },
    ])
    console.log(`✅ Created ${transactions.length} transactions\n`)

    // Create sample help requests
    console.log('🆘 Creating sample help requests...')
    const helpRequests = await HelpRequest.create([
      {
        requester: users[2]._id,
        title: 'School supplies needed for underprivileged students',
        description:
          'We need books, notebooks, and stationery for 50 students in rural area',
        category: 'education',
        urgency: 'high',
        location: {
          address: 'Village School, Rural Area',
          city: 'Pune',
          state: 'Maharashtra',
          coordinates: {
            type: 'Point',
            coordinates: [73.8355, 18.5204],
          },
        },
        beneficiaries: 50,
        targetAmount: 25000,
        status: 'open',
        assignedNGO: ngos[0]._id,
        verificationStatus: 'verified',
      },
      {
        requester: users[3]._id,
        title: 'Medical supplies for rural clinic',
        description: 'Essential medicines and medical equipment needed',
        category: 'medical',
        urgency: 'critical',
        location: {
          address: 'Rural Health Center',
          city: 'Hyderabad',
          state: 'Telangana',
          coordinates: {
            type: 'Point',
            coordinates: [78.4744, 17.3850],
          },
        },
        beneficiaries: 500,
        targetAmount: 100000,
        status: 'open',
        assignedNGO: ngos[1]._id,
        verificationStatus: 'verified',
      },
    ])
    console.log(`✅ Created ${helpRequests.length} help requests\n`)

    // Create sample certificates
    console.log('📜 Creating sample certificates...')
    const certificates = await Certificate.create([
      {
        recipient: users[2]._id,
        issuer: ngos[0]._id,
        type: 'donation',
        title: 'Certificate of Appreciation',
        description: 'For generous donation to education programs',
        donation: donations[0]._id,
        amount: 5000,
        issueDate: new Date(),
      },
      {
        recipient: users[3]._id,
        issuer: ngos[1]._id,
        type: 'donation',
        title: 'Certificate of Recognition',
        description: 'For supporting healthcare initiatives',
        donation: donations[1]._id,
        amount: 10000,
        issueDate: new Date(),
      },
    ])
    console.log(`✅ Created ${certificates.length} certificates\n`)

    // Create sample analytics
    console.log('📊 Creating sample analytics...')
    const analytics = await Analytics.create([
      {
        date: new Date(),
        metrics: {
          totalUsers: users.length,
          activeUsers: users.length,
          newUsers: 3,
          totalNGOs: ngos.length,
          activeNGOs: ngos.length,
          totalDonations: {
            count: donations.length,
            amount: donations.reduce((sum, d) => sum + d.amount, 0),
            currency: 'INR',
          },
          totalEvents: {
            count: events.length,
            participants: 150,
            volunteerHours: 70,
          },
          helpRequests: {
            count: helpRequests.length,
            fulfilled: 0,
          },
          certificates: {
            issued: certificates.length,
          },
          transactions: {
            count: transactions.length,
            successRate: 100,
          },
        },
        pageViews: {
          home: 150,
          ngos: 120,
          events: 100,
          donations: 80,
          helpRequests: 60,
          profile: 40,
        },
        engagement: {
          avgSessionDuration: 5.5,
          bounceRate: 35,
          returnUsers: 65,
        },
        performance: {
          apiResponseTime: 150,
          errorRate: 0.5,
          uptime: 99.9,
        },
      },
    ])
    console.log(`✅ Created ${analytics.length} analytics records\n`)

    console.log('✨ Database seeding completed successfully!')
    console.log(`
📊 Summary:
   👥 Users: ${users.length}
   🏢 NGOs: ${ngos.length}
   💝 Donations: ${donations.length}
   📅 Events: ${events.length}
   🆘 Help Requests: ${helpRequests.length}
   🏅 Badges: ${badges.length}
   📜 Certificates: ${certificates.length}
   💳 Transactions: ${transactions.length}
   📊 Analytics: ${analytics.length}
    `)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run seeding
seedDatabase()
