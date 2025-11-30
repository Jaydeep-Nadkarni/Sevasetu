# MongoDB Setup & Database Configuration

Complete guide to set up and configure MongoDB for the Sevasetu platform.

## Prerequisites

- Node.js v16+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

---

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Sign up for free account
- Verify your email

### 2. Create a Project
- Click "Create a project"
- Name it "Sevasetu"
- Click "Create Project"

### 3. Create a Cluster
- Click "Create" in Database section
- Choose "Free" tier (M0)
- Select your region (closest to you)
- Click "Create Cluster" (takes 1-2 minutes)

### 4. Create Database User
- Go to "Database Access"
- Click "Add New Database User"
- Enter username: `jaydeepnadkarni123_db_user`
- Password: Generate secure password
- Database User Privileges: "Read and write to any database"
- Click "Add User"

### 5. Setup Network Access
- Go to "Network Access"
- Click "Add IP Address"
- Choose "Allow Access from Anywhere" (for development)
- Click "Confirm"

### 6. Get Connection String
- Go to Clusters
- Click "Connect" button
- Choose "Connect your application"
- Copy the connection string
- Replace `<password>` with your database user password
- Replace `<database>` with `ngo_db`

### 7. Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/ngo_db?retryWrites=true&w=majority
```

---

## Environment Configuration

### Update .env File

Create `.env` in `server/` directory:

```bash
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://jaydeepnadkarni123_db_user:YOUR_PASSWORD@sevasetu.yliqgwo.mongodb.net/ngo_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Other configurations...
```

### Verify Connection

Test the connection:
```bash
cd server
npm run dev
```

You should see in logs:
```
✅ MongoDB connected: sevasetu.yliqgwo.mongodb.net
📊 Database: ngo_db
```

---

## Database Seeding

### Load Sample Data

The seed script creates comprehensive test data:

```bash
cd server
npm run seed
```

This creates:
- 5 Users (with different roles)
- 3 NGOs
- 4 Badges
- 2 Events
- 3 Donations
- 3 Transactions
- 2 Help Requests
- 2 Certificates
- Analytics data

### Seed Data Credentials

Use these to test:

**Admin User:**
- Email: `jaydeep@sevasetu.com`
- Password: `password123`

**NGO Admin:**
- Email: `priya@example.com`
- Password: `password123`

**Regular Users:**
- Email: `amit@example.com` / `sarah@example.com` / `ravi@example.com`
- Password: `password123`

---

## MongoDB Atlas Features

### 1. Monitoring
- Go to Cluster → Overview
- Check metrics: CPU, Memory, Network I/O
- Set up alerts for unusual activity

### 2. Backups
- Go to Backup
- Automatic backups every 12 hours
- Point-in-time restore available

### 3. Performance Advisor
- Automatically identifies slow queries
- Recommends index creation
- Helps optimize queries

### 4. Query Profiler
- View slow queries
- Analyze query performance
- Find optimization opportunities

---

## Local MongoDB Setup (Optional)

If you prefer local MongoDB instead of Atlas:

### Windows

```bash
# Download MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# Install and start MongoDB
# MongoDB runs on localhost:27017

# Connection string:
MONGODB_URI=mongodb://localhost:27017/ngo_db
```

### Mac (using Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Connection string:
MONGODB_URI=mongodb://localhost:27017/ngo_db
```

### Linux

```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongod

# Connection string:
MONGODB_URI=mongodb://localhost:27017/ngo_db
```

---

## Connection Testing

### Test with MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Click "New Connection"
3. Paste your connection string
4. Click "Connect"
5. Browse your database and collections

### Test with MongoDB Shell

```bash
# Open MongoDB Shell in Atlas UI
# Or install mongosh locally

mongosh "mongodb+srv://username:password@cluster.mongodb.net/ngo_db"

# View databases
show databases

# Use ngo_db
use ngo_db

# View collections
show collections

# Count documents
db.users.countDocuments()
db.ngos.countDocuments()

# Find document
db.users.findOne()
```

### Test from Node.js

```bash
node

# In the REPL:
> import('mongoose').then(m => m.default.connect('your-mongodb-uri'))
> const User = require('./server/src/models/User')
> User.find()
```

---

## Indexes Management

### View Indexes

```bash
# In MongoDB Shell
db.users.getIndexes()

# View all indexes for collection
db.ngos.getIndexes()
```

### Create Custom Index

```bash
# Create text index
db.ngos.createIndex({ name: 'text', description: 'text' })

# Create compound index
db.donations.createIndex({ donor: 1, createdAt: -1 })

# Create geospatial index
db.ngos.createIndex({ 'location.coordinates': '2dsphere' })
```

### Drop Index

```bash
db.users.dropIndex('email_1')
```

---

## Performance Optimization

### 1. Connection Pooling

Already configured in `config/db.js`:
- Min Pool Size: 5
- Max Pool Size: 10

### 2. Query Optimization

Use indexes for:
- Frequently filtered fields
- Sorting operations
- Geospatial queries

### 3. Aggregation Optimization

```javascript
// Efficient aggregation
const stats = await Collection.aggregate([
  { $match: { status: 'completed' } }, // Filter early
  { $group: { _id: null, total: { $sum: '$amount' } } },
  { $limit: 1 }, // Limit results
])
```

### 4. Pagination

```javascript
const page = 1
const limit = 20
const skip = (page - 1) * limit

const results = await Collection.find()
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 })
```

---

## Backup & Recovery

### Automatic Backups

MongoDB Atlas automatically backs up:
- Every 12 hours
- 7 days retention
- Point-in-time restore available

### Manual Backup (Compass)

```bash
# Export data
mongoexport --uri "mongodb+srv://..." --collection users --out users.json

# Import data
mongoimport --uri "mongodb+srv://..." --collection users --file users.json
```

### Restore from Backup

1. Go to Clusters
2. Click "Restore" on the backup
3. Choose recovery point
4. Confirm restoration

---

## Troubleshooting

### Connection Issues

**Error: "connect ECONNREFUSED"**
- Check MongoDB is running
- Verify connection string
- Check network access whitelist

**Error: "Authentication failed"**
- Verify username and password
- Check special characters are URL-encoded
- Ensure user exists in MongoDB

**Error: "MongoError: Topology is closed"**
- Check network stability
- Restart application
- Check MongoDB status

### Performance Issues

**Slow Queries:**
- Check MongoDB Performance Advisor
- Create indexes for filtered fields
- Use aggregation pipeline efficiently

**High Memory Usage:**
- Use `.lean()` for read-only queries
- Limit returned fields with `.select()`
- Implement pagination

**Connection Timeout:**
- Increase `serverSelectionTimeoutMS`
- Check network connectivity
- Verify IP whitelist

---

## Security Best Practices

### 1. Password Security
- Use strong password (30+ characters)
- Use unique password for database
- Store in `.env` (never commit to git)

### 2. Network Security
- Whitelist specific IPs in production
- Don't allow access from anywhere
- Use VPN if connecting from office

### 3. User Permissions
- Create separate users for different apps
- Use least privilege principle
- Rotate credentials regularly

### 4. Connection Security
- Always use SSL/TLS
- Enable authentication
- Use VPC for production

### 5. Data Security
- Enable automatic backups
- Test restore procedures
- Implement field-level encryption if needed

---

## Monitoring & Alerts

### Setup Alerts

1. Go to Alerts
2. Click "Create Alert"
3. Choose trigger:
   - High CPU usage
   - Replication lag
   - Connection count
   - Slow queries

4. Set notification methods:
   - Email
   - Slack
   - PagerDuty

### Regular Maintenance

- Monitor cluster metrics weekly
- Check backup status monthly
- Review slow queries monthly
- Update connection passwords quarterly

---

## Database Maintenance

### Regular Tasks

```bash
# Rebuild indexes (if corrupted)
db.collection.reIndex()

# Compact database
db.runCommand({ compact: 'collectionName' })

# Analyze collection stats
db.collection.stats()
```

### Cleanup Old Data

```javascript
// Delete old analytics records
await Analytics.deleteMany({
  date: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
})

// Archive old transactions
const oldTransactions = await Transaction.find({
  createdAt: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
})
// Move to archive collection or external storage
```

---

## Resources

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Mongoose Docs**: https://mongoosejs.com
- **MongoDB Community**: https://www.mongodb.com/community
- **Schema Design Guide**: https://docs.mongodb.com/manual/core/schema-design/

---

## Support

For database issues:
1. Check MongoDB status: https://status.mongodb.com
2. Review error messages in application logs
3. Check MongoDB Atlas monitoring dashboard
4. Consult troubleshooting section above
5. Contact MongoDB support for Atlas issues
