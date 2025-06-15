// =============== Global ===============
let editingProjectId = null;
const CLOUDINARY_UPLOAD_PRESET = 'your_unsigned_preset'; // if using unsigned upload
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload'; // change this

// =============== Admin Login ===============
document.getElementById('adminLoginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.success) {
      alert('Login successful');
      localStorage.setItem('adminToken', data.token);
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('projectSection').style.display = 'block';
      fetchProjects();
    } else {
      alert(data.message || 'Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    alert('Login error');
  }
});

// =============== Image to Base64 ===============
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

// =============== Project Add/Edit ===============
document.getElementById('addProjectForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const title = document.getElementById('projectTitle').value.trim();
  const description = document.getElementById('projectDesc').value.trim();
  const githubUrl = document.getElementById('projectGithub').value.trim();
  const demoUrl = document.getElementById('projectDemo').value.trim();
  const imageFile = document.getElementById('projectImage').files[0];

  const token = localStorage.getItem('adminToken');
  if (!token) return alert('Unauthorized. Please log in again.');

  try {
    let imageUrl = null;
    if (imageFile) {
      const base64 = await getBase64(imageFile);

      // const base64 = imageFile ? await getBase64(imageFile) : null;

const payload = {
  title,
  description,
  githubUrl,
  demoUrl,
  image: base64 // send image directly
};

const url = editingProjectId ? `/api/projects/${editingProjectId}` : '/api/projects';
const method = editingProjectId ? 'PUT' : 'POST';

const res = await fetch(url, {
  method,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(payload)
});

const data = await res.json();
if (!res.ok) return alert(data.message || 'Error saving project');
    }

    const payload = { title, description, githubUrl, demoUrl };
    if (imageUrl) payload.image = imageUrl;

    const url = editingProjectId ? `/api/projects/${editingProjectId}` : '/api/projects';
    const method = editingProjectId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Error saving project');

    alert(editingProjectId ? 'Project updated' : 'Project added');
    e.target.reset();
    editingProjectId = null;
    fetchProjects();
  } catch (err) {
    console.error(err);
    alert('Error saving project');
  }
});

// =============== Fetch & Render Projects ===============
async function fetchProjects() {
  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();

    const list = document.getElementById('projectsList');
    list.innerHTML = '';

    projects.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'card mb-3';

      card.innerHTML = `
        ${p.image ? `<img src="${p.image}" class="card-img-top" alt="${p.title}" style="max-height: 200px; object-fit: cover;">` : ''}
        <div class="card-body">
          <h5 class="card-title">${p.title}</h5>
          <p class="card-text">${p.description}</p>
          <div class="mb-2">
            ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" class="btn btn-sm btn-dark me-2">GitHub</a>` : ''}
            ${p.demoUrl ? `<a href="${p.demoUrl}" target="_blank" class="btn btn-sm btn-primary">Live Demo</a>` : ''}
          </div>
          <button class="btn btn-sm btn-warning me-2" onclick='editProject(${JSON.stringify(p)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProject('${p._id}')">Delete</button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

// =============== Edit Project ===============
function editProject(project) {
  editingProjectId = project._id;
  document.getElementById('projectTitle').value = project.title;
  document.getElementById('projectDesc').value = project.description;
  document.getElementById('projectGithub').value = project.githubUrl || '';
  document.getElementById('projectDemo').value = project.demoUrl || '';
}

// =============== Delete Project ===============
async function deleteProject(id) {
  const confirmDelete = confirm('Are you sure you want to delete this project?');
  if (!confirmDelete) return;

  const token = localStorage.getItem('adminToken');
  try {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || 'Delete failed');

    alert('Project deleted');
    fetchProjects();
  } catch (err) {
    console.error(err);
    alert('Error deleting project');
  }
}
