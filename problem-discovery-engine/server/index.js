import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import discoveryRoutes from './routes/discoveryRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'problem_discovery_secret_key_2026';
  console.warn('⚠️ JWT_SECRET not found in .env, using default development key.');
}

const app = express();
const port = process.env.PORT || 3001;

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', discoveryRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Engine is running' });
});

app.listen(port, () => {
  console.log(`Backend Server running at http://localhost:${port}`);
});
