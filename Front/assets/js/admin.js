// Handle admin login
document.getElementById('adminLoginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      alert('Login successful');
      localStorage.setItem('adminToken', data.token);
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('projectSection').style.display = 'block';

      // Load existing projects after login
      fetchProjects();
    } else {
      alert(data.message || 'Invalid credentials');
    }
  } catch (error) {
    alert('Error logging in');
    console.error(error);
  }
});

// ✅ Updated: Handle project form submission with image upload
document.getElementById('addProjectForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const token = localStorage.getItem('adminToken');
  if (!token) {
    alert('Unauthorized. Please log in again.');
    return;
  }

  const formData = new FormData();
  formData.append('title', document.getElementById('projectTitle').value);
  formData.append('description', document.getElementById('projectDesc').value);
  formData.append('githubUrl', document.getElementById('projectGithub').value);
  formData.append('demoUrl', document.getElementById('projectDemo').value);
  const imageInput = document.getElementById('projectImage');
  if (imageInput.files[0]) {
    formData.append('image', imageInput.files[0]);
  }

  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) return alert(result.message || 'Upload failed');
    alert('Project added!');
    e.target.reset();
    fetchProjects();
  } catch (err) {
    alert('Error uploading project');
    console.error(err);
  }
});


// Fetch and display all projects
async function fetchProjects() {
  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();

    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';

    projects.forEach((project) => {
      const card = document.createElement('div');
      card.className = 'card mb-3';
      card.innerHTML = `
  <div class="card h-100 shadow-sm border-0">
    ${project.image ? `<img src="${project.image}" class="card-img-top" alt="${project.title}" style="height: 200px; object-fit: cover;">` : ''}
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">${project.title}</h5>
      <p class="card-text small text-muted">${project.description}</p>
    </div>
    <div class="card-footer bg-white border-0 d-flex flex-wrap gap-2 justify-content-between">
      ${project.githubUrl ? `<a href="${project.githubUrl}" class="btn btn-sm btn-dark w-100" target="_blank"><i class="fab fa-github"></i> GitHub</a>` : ''}
      ${project.demoUrl ? `<a href="${project.demoUrl}" class="btn btn-sm btn-primary w-100" target="_blank"><i class="fas fa-external-link-alt"></i> Live</a>` : ''}
      <button class="btn btn-sm btn-warning w-100" onclick="editProject('${project._id}')">Edit</button>
      <button class="btn btn-sm btn-danger w-100" onclick="deleteProject('${project._id}')">Delete</button>
    </div>
  </div>
`;
      projectsList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}


// delete project funcution
async function deleteProject(id) {
  const token = localStorage.getItem('adminToken');
  if (!confirm('Are you sure you want to delete this project?')) return;

  try {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    alert(data.message || 'Deleted');
    fetchProjects();
  } catch (err) {
    console.error('Error deleting project:', err);
    alert('Failed to delete project');
  }
}


//edit project
async function editProject(id) {
  try {
    const res = await fetch(`/api/projects`);
    const projects = await res.json();
    const project = projects.find(p => p._id === id);

    if (!project) return alert('Project not found');

    // Prefill form
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectDesc').value = project.description;
    document.getElementById('projectGithub').value = project.githubUrl || '';
    document.getElementById('projectDemo').value = project.demoUrl || '';

    // Update form submit behavior
    const form = document.getElementById('addProjectForm');
    const originalSubmit = form.onsubmit;

    form.onsubmit = async function (e) {
      e.preventDefault();

      const title = document.getElementById('projectTitle').value.trim();
      const description = document.getElementById('projectDesc').value.trim();
      const githubUrl = document.getElementById('projectGithub').value.trim();
      const demoUrl = document.getElementById('projectDemo').value.trim();
      const token = localStorage.getItem('adminToken');

      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description, githubUrl, demoUrl }),
        });

        const updated = await res.json();
        if (!res.ok) return alert(updated.message || 'Update failed');

        alert('Project updated successfully!');
        form.reset();
        form.onsubmit = originalSubmit; // restore default submit
        fetchProjects();
      } catch (err) {
        console.error(err);
        alert('Error updating project');
      }
    };
  } catch (err) {
    console.error(err);
  }
}

