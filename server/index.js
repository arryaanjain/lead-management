const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const leadsRouter = require('./routes/leads');
const authRouter = require('./routes/auth');
const prospectiveLeadsRouter = require('./routes/prospectiveLeads'); // optional

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/leads', leadsRouter);
app.use('/api/auth', authRouter);
app.use('/api/prospective-leads', prospectiveLeadsRouter); // optional

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Server is running on port ${port}`);
});
