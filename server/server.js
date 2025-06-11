const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware
app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());


// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Routes
const projectRoutes = require('./routes/projects');
app.use('/api/projects', projectRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const contactRoutes = require('./routes/contact');
app.use('/api/contact', contactRoutes);



// Serve static files (HTML, CSS, JS) from the client folder
app.use(express.static(path.join(__dirname, '../Front')));

// Admin route (optional: protect with JWT middleware)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front', 'admin.html'));
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front', 'index.html'));
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
