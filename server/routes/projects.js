const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const verifyToken = require('../middleware/verifyToken');
const cloudinary = require('../utils/cloudinary');

// ================= GET all projects =================
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= POST new project =================
router.post('/', verifyToken, async (req, res) => {
  const { title, description, githubUrl, demoUrl, technologies, image } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    let imageUrl = '';
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: 'portfolio_projects',
      });
      imageUrl = uploadRes.secure_url;
    }

    const newProject = new Project({
      title,
      description,
      githubUrl,
      demoUrl,
      technologies: technologies ? technologies.split(',').map(t => t.trim()) : [],
      image: imageUrl,
    });

    const saved = await newProject.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Project POST error:', err);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// ================= PUT update project =================
router.put('/:id', verifyToken, async (req, res) => {
  const { title, description, githubUrl, demoUrl, technologies, image } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let imageUrl = project.image;
    if (image && image.startsWith('data:')) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: 'portfolio_projects',
      });
      imageUrl = uploadRes.secure_url;
    }

    project.title = title;
    project.description = description;
    project.githubUrl = githubUrl;
    project.demoUrl = demoUrl;
    project.technologies = technologies ? technologies.split(',').map(t => t.trim()) : [];
    project.image = imageUrl;

    const updated = await project.save();
    res.json(updated);
  } catch (err) {
    console.error('Project PUT error:', err);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// ================= DELETE project =================
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const removed = await Project.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
