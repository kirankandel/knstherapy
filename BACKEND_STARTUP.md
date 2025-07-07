# Backend Server Startup Guide

## Quick Start (Manual)

1. **Open Terminal**
   ```bash
   cd /Users/kirankandel/Documents/knstherapy/backend
   ```

2. **Start the Server**
   ```bash
   node src/index.js
   ```

3. **Verify Server is Running**
   - You should see: "Connected to MongoDB" and "Listening to port 3001"
   - If successful, the server is ready!

## Alternative Start Methods

### Using NPM (if available)
```bash
npm run dev
```

### Using Nodemon (if available)
```bash
npx nodemon src/index.js
```

## Troubleshooting

### If you see "MongoDB connection error":
- Check if the MongoDB URL in `.env` is correct
- Ensure you have internet connection (using MongoDB Atlas)

### If you see "Port 3001 already in use":
- Kill existing process: `lsof -ti:3001 | xargs kill -9`
- Or change PORT in `.env` to another number like 3002

### If dependencies are missing:
```bash
npm install --ignore-scripts
```

## Testing Connection

Once the server is running, test it by visiting:
- http://localhost:3001/v1/docs (API documentation)
- http://localhost:3001/v1/auth/register (should return error but confirms server is up)

## Environment Variables

Make sure these are set in `.env`:
- `NODE_ENV=development`
- `PORT=3001`
- `MONGODB_URL=your_mongodb_connection_string`
- `JWT_SECRET=your_jwt_secret`
