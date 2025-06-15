const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  githubUrl: String,
  demoUrl: String,
  technologies: [String],
  image: String,
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
