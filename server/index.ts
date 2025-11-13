import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import accountingRoutes from './routes/accounting';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/accounting', accountingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'نظام العباسي الموحد يعمل بنجاح' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API Docs: http://localhost:${PORT}/api`);
});

export default app;
