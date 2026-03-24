import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import discoveryRoutes from './routes/discoveryRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', discoveryRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Engine is running' });
});

app.listen(port, () => {
  console.log(`Backend Server running at http://localhost:${port}`);
});
