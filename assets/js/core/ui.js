let toastTimer = null;

function ensureToastRoot() {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    root.className = 'toast-root';
    document.body.appendChild(root);
  }
  return root;
}

function ensureModalRoot() {
  let root = document.getElementById('modal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'modal-root';
    root.className = 'modal-overlay';
    root.innerHTML = `
      <div class="modal-card">
        <div class="modal-head">
          <h3 id="modal-title">Thông báo</h3>
          <button type="button" class="btn btn-ghost btn-sm" id="modal-close">Đóng</button>
        </div>
        <div class="modal-body" id="modal-body"></div>
        <div class="modal-foot" id="modal-foot"></div>
      </div>`;
    document.body.appendChild(root);
    root.addEventListener('click', (event) => {
      if (event.target === root) closeModal();
    });
  }
  return root;
}

export function showToast(message, type = '') {
  const root = ensureToastRoot();
  root.textContent = message;
  root.className = `toast-root show ${type}`.trim();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    root.classList.remove('show');
  }, 2800);
}

export function openModal({ title = 'Thông báo', bodyHtml = '', actions = [] } = {}) {
  const modal = ensureModalRoot();
  const titleEl = modal.querySelector('#modal-title');
  const bodyEl = modal.querySelector('#modal-body');
  const footEl = modal.querySelector('#modal-foot');
  const closeEl = modal.querySelector('#modal-close');

  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHtml;
  footEl.innerHTML = '';

  actions.forEach((action) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn ${action.className || 'btn-outline'}`;
    btn.textContent = action.label || 'OK';
    btn.addEventListener('click', () => {
      if (typeof action.onClick === 'function') action.onClick();
    });
    footEl.appendChild(btn);
  });

  closeEl.onclick = () => closeModal();
  modal.classList.add('open');
}

export function closeModal() {
  const modal = document.getElementById('modal-root');
  if (modal) {
    modal.classList.remove('open');
  }
}

export function initialsFromName(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'SV';
}

export function formatDate(dateText) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return dateText;
  return date.toLocaleDateString('vi-VN');
}

export function statusBadge(status) {
  const map = {
    free: { label: 'Tự do', className: 'badge-success' },
    scheduled: { label: 'Có lịch', className: 'badge-warning' },
    closed: { label: 'Đã đóng', className: 'badge-error' },
    active: { label: 'Đang mở', className: 'badge-info' }
  };
  return map[status] || { label: status, className: 'badge-neutral' };
}
