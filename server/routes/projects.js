const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const verifyToken = require('../middleware/verifyToken'); // 👈 Add this line
// const multer = require('multer');
const upload = require('../middleware/upload');
const path = require('path');

// GET all projects (public)
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add new project (protected)
// Add project with image
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  const { title, description, githubUrl, demoUrl } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  const newProject = new Project({
    title,
    description,
    githubUrl,
    demoUrl,
    image,
  });

  try {
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// DELETE project by ID (protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const removed = await Project.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update project by ID (protected)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Project not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
