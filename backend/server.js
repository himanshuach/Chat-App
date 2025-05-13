const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();         // Load .env variables
connectDB();             // Connect to MongoDB

const app = express();
app.use(express.json()); // Parse JSON bodies

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
