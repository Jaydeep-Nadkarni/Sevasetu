# Deployment Guide & Best Practices

## Prerequisites
- Node.js v18+
- MongoDB Atlas or local MongoDB instance
- Redis (optional, for caching/queues)
- Cloudinary account
- Google Maps API Key
- Razorpay Account

## Environment Variables
Ensure all environment variables in `.env.example` are set in your production `.env` file.

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/sevasetu
JWT_SECRET=your_strong_jwt_secret
...
```

## Security Checklist
1.  **SSL/TLS**: Ensure the server is running behind a reverse proxy (Nginx/Apache) with SSL enabled (Let's Encrypt).
2.  **Firewall**: Restrict access to ports (only 80/443 open to public, 5000 only to localhost).
3.  **Database Access**: Whitelist IP addresses for MongoDB access.
4.  **Secrets**: Rotate JWT secrets and API keys periodically.

## Performance Optimization
1.  **Clustering**: Use PM2 to run the application in cluster mode to utilize all CPU cores.
    ```bash
    npm install pm2 -g
    pm2 start src/index.js -i max --name sevasetu-server
    ```
2.  **Caching**: Implement Redis for session storage and caching frequently accessed data (e.g., leaderboards, static content).
3.  **CDN**: Use Cloudinary or a CDN for serving static assets and images.

## Database Backup Strategy

### Automated Backups (MongoDB Atlas)
If using MongoDB Atlas, enable automated backups in the dashboard. Set retention policy to at least 7 days.

### Manual/Scripted Backups (mongodump)
For self-hosted or additional safety, use `mongodump`.

**Backup Script (`scripts/backup.sh`):**
```bash
#!/bin/bash
TIMESTAMP=$(date +%F-%H%M)
BACKUP_DIR="/backups/mongo"
mkdir -p $BACKUP_DIR
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$TIMESTAMP"
# Optional: Upload to S3
# aws s3 cp --recursive "$BACKUP_DIR/$TIMESTAMP" s3://my-backup-bucket/$TIMESTAMP
```

**Restore:**
```bash
mongorestore --uri="$MONGODB_URI" "$BACKUP_DIR/$TIMESTAMP"
```

## Health Check
The server exposes a health check endpoint at `GET /api/health`.
Configure your load balancer or uptime monitor (e.g., UptimeRobot) to ping this endpoint.

## CI/CD Pipeline (Example GitHub Actions)
1.  **Lint & Test**: Run `npm run lint` and tests on every push.
2.  **Build**: Build the client (if serving static files) or Docker image.
3.  **Deploy**: SSH into the server and run `git pull && npm install && pm2 restart all`.

## Troubleshooting
- **Logs**: Check `server/logs/error.log` and `server/logs/all.log` (Winston logs).
- **PM2 Logs**: `pm2 logs sevasetu-server`.
