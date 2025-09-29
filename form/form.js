const STORAGE_KEY = 'sidebar_form_entries_v1';

const form = document.getElementById('entryForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const noteInput = document.getElementById('note');
const editIdInput = document.getElementById('editId');

const listContainer = document.getElementById('listContainer');
const totalCount = document.getElementById('totalCount');
const resetBtn = document.getElementById('resetBtn');
const clearAllBtn = document.getElementById('clearAll');
const formState = document.getElementById('formState');

function readEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveEntries(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
function initials(name) {
  if (!name) return '';
  return name.split(' ').map(s => s[0] || '').slice(0, 2).join('').toUpperCase();
}
function escapeHtml(str) {
  return str ? str.replace(/[&<"'>]/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m])) : '';
}

function render() {
  const entries = readEntries();
  totalCount.textContent = entries.length;
  listContainer.innerHTML = '';

  if (entries.length === 0) {
    listContainer.innerHTML = `<div class="card list-empty">
      <strong>No entries yet</strong>
      <div style="margin-top:8px;color:var(--muted)">Form থেকে ডেটা যোগ করলে এখানে দেখাবে।</div>
    </div>`;
    return;
  }

  entries.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="item">
        <div class="item-left">
          <div class="avatar">${initials(item.fullName)}</div>
          <div class="meta">
            <div class="name">${escapeHtml(item.fullName)}</div>
            <div class="small">${escapeHtml(item.email || item.phone || 'No contact')}</div>
            ${item.note ? `<div style="margin-top:6px;color:var(--muted);font-size:13px">${escapeHtml(item.note)}</div>` : ''}
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-ghost" onclick="startEdit('${item.id}')">Edit</button>
          <button class="btn btn-danger" onclick="removeEntry('${item.id}')">Delete</button>
        </div>
      </div>`;
    listContainer.appendChild(card);
  });
}

function addEntry(data) {
  const arr = readEntries();
  const id = 'id_' + Date.now();
  arr.unshift({ ...data, id });
  saveEntries(arr);
  render();
}

function removeEntry(id) {
  if (!confirm('Delete this entry?')) return;
  const arr = readEntries().filter(x => x.id !== id);
  saveEntries(arr);
  if (editIdInput.value === id) resetForm();
  render();
}

function startEdit(id) {
  const arr = readEntries();
  const item = arr.find(x => x.id === id);
  if (!item) return;
  fullNameInput.value = item.fullName || '';
  emailInput.value = item.email || '';
  phoneInput.value = item.phone || '';
  noteInput.value = item.note || '';
  editIdInput.value = id;
  formState.textContent = 'Editing entry';
}

function applyEdit(id, data) {
  const arr = readEntries();
  const idx = arr.findIndex(x => x.id === id);
  if (idx === -1) return;
  arr[idx] = { ...arr[idx], ...data };
  saveEntries(arr);
  render();
}

function resetForm() {
  form.reset();
  editIdInput.value = '';
  formState.textContent = 'New entry';
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const payload = {
    fullName: fullNameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    note: noteInput.value.trim()
  };
  if (!payload.fullName) {
    alert('Full Name দরকার।');
    return;
  }
  if (editIdInput.value) {
    applyEdit(editIdInput.value, payload);
    resetForm();
  } else {
    addEntry(payload);
    form.reset();
  }
});
resetBtn.addEventListener('click', resetForm);
clearAllBtn.addEventListener('click', () => {
  if (confirm('Clear all entries?')) {
    localStorage.removeItem(STORAGE_KEY);
    render();
  }
});

render();

// expose for buttons
window.startEdit = startEdit;
window.removeEntry = removeEntry;
