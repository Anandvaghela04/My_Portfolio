const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  image: { type: String }, // will store image filename
  title: { type: String, required: true },
  description: { type: String, required: true },
  githubUrl: { type: String },
  demoUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
