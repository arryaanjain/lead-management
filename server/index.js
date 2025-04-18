const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const adminAPIs = require('./routes/adminAPIs');
const authRouter = require('./routes/auth');
const clientAPIs = require('./routes/clientAPIs'); // optional
const catalogue = require('./routes/catalogue');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',  // Allow all origins (Not recommended for production)
}));

// Increase payload size limits
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

//file upload setup
const fileUpload = require('express-fileupload');

app.use(fileUpload());


// Database connection and index setup
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Create GridFS indexes after connection
    const db = mongoose.connection.db;
    await db.collection('pdfs.chunks').createIndex(
      { files_id: 1, n: 1 },
      { unique: true, background: true }
    );
    console.log('GridFS indexes verified');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

// Initialize database connection
connectDB();

// Routes
app.use('/api/admin', adminAPIs);
app.use('/api/auth', authRouter);
app.use('/api/client', clientAPIs); 
app.use('/api/catalogue', catalogue);

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Server is running on port ${port}`);
});