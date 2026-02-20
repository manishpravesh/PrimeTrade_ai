const messageEl = document.getElementById('message');
const sessionEl = document.getElementById('session');
const tasksEl = document.getElementById('tasks');

let token = '';
let currentUser = null;

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? 'crimson' : 'green';
}

function authHeaders() {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

document.getElementById('register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);

  try {
    await api('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    showMessage('Registration successful. You can login now.');
    event.target.reset();
  } catch (error) {
    showMessage(error.message, true);
  }
});

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);

  try {
    const data = await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    token = data.token;
    currentUser = data.user;
    sessionEl.textContent = `Logged in as ${currentUser.email} (${currentUser.role})`;
    showMessage('Login successful');
  } catch (error) {
    showMessage(error.message, true);
  }
});

document.getElementById('task-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);

  try {
    await api('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    showMessage('Task created');
    event.target.reset();
    document.getElementById('load-tasks').click();
  } catch (error) {
    showMessage(error.message, true);
  }
});

document.getElementById('load-tasks').addEventListener('click', async () => {
  try {
    const tasks = await api('/api/v1/tasks');
    tasksEl.innerHTML = '';
    tasks.forEach((task) => {
      const item = document.createElement('li');
      item.innerHTML = `${task.title} - ${task.completed ? 'Done' : 'Pending'} <button data-id="${task.id}">Delete</button>`;
      tasksEl.appendChild(item);
    });
  } catch (error) {
    showMessage(error.message, true);
  }
});

tasksEl.addEventListener('click', async (event) => {
  if (!(event.target instanceof HTMLButtonElement)) {
    return;
  }

  try {
    await api(`/api/v1/tasks/${event.target.dataset.id}`, { method: 'DELETE' });
    showMessage('Task deleted');
    document.getElementById('load-tasks').click();
  } catch (error) {
    showMessage(error.message, true);
  }
});
