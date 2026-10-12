/**
 * University Research Opportunity Portal - Frontend Application JavaScript
 * Utilizes JavaScript Fetch API & Bootstrap 5 Modals / Toasts
 */

const API_BASE_URL = '/api/opportunities';

// Local State
let opportunities = [];
let deleteTargetId = null;

// Bootstrap Modal Instances
let opportunityModalInstance = null;
let detailModalInstance = null;
let deleteModalInstance = null;
let toastInstance = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  opportunityModalInstance = new bootstrap.Modal(document.getElementById('opportunityModal'));
  detailModalInstance = new bootstrap.Modal(document.getElementById('detailModal'));
  deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  toastInstance = new bootstrap.Toast(document.getElementById('appToast'));

  // Attach delete confirm event listener
  document.getElementById('confirmDeleteBtn').addEventListener('click', executeDelete);

  // Initial fetch
  fetchOpportunities();
});

/**
 * Show Floating Toast Notification
 */
function showToast(message, type = 'success') {
  const toastEl = document.getElementById('appToast');
  const toastMsg = document.getElementById('toastMessage');
  
  // Reset classes
  toastEl.className = 'toast align-items-center text-white border-0 shadow';
  
  if (type === 'success') {
    toastEl.classList.add('bg-success');
  } else if (type === 'danger' || type === 'error') {
    toastEl.classList.add('bg-danger');
  } else if (type === 'warning') {
    toastEl.classList.add('bg-warning', 'text-dark');
  } else {
    toastEl.classList.add('bg-info');
  }

  toastMsg.textContent = message;
  toastInstance.show();
}

/**
 * Fetch all opportunities from backend REST API
 */
async function fetchOpportunities() {
  const container = document.getElementById('opportunitiesContainer');
  
  try {
    const statusFilter = document.getElementById('filterStatus').value;
    const deptFilter = document.getElementById('filterDepartment').value;
    const searchFilter = document.getElementById('searchInput').value.trim();

    let url = `${API_BASE_URL}?`;
    if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;
    if (deptFilter) url += `department=${encodeURIComponent(deptFilter)}&`;
    if (searchFilter) url += `search=${encodeURIComponent(searchFilter)}&`;

    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'Failed to load opportunities');
    }

    opportunities = result.data || [];

    // Update stats and department filter list
    updateStats(opportunities);
    populateDepartmentFilter(opportunities);
    renderOpportunities(opportunities);

  } catch (error) {
    console.error('Error fetching opportunities:', error);
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-danger d-inline-block px-4 py-3 shadow-sm rounded-3">
          <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          Failed to load opportunities. ${error.message}
        </div>
      </div>
    `;
    showToast(`Error: ${error.message}`, 'danger');
  }
}

/**
 * Render opportunity cards to DOM
 */
function renderOpportunities(items) {
  const container = document.getElementById('opportunitiesContainer');
  const countBadge = document.getElementById('resultCountBadge');
  
  countBadge.textContent = `Showing ${items.length} opportunity${items.length === 1 ? '' : 'ies'}`;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="empty-state-icon mb-3"><i class="bi bi-folder-x"></i></div>
        <h5 class="fw-bold text-muted">No Research Opportunities Found</h5>
        <p class="text-secondary small">Try adjusting your filters or post a new research opportunity.</p>
        <button class="btn btn-primary btn-sm mt-2" onclick="openCreateModal()">
          <i class="bi bi-plus-lg me-1"></i> Post Opportunity
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(opp => {
    const isOpen = opp.status === 'Open';
    const statusBadgeClass = isOpen ? 'bg-success' : 'bg-secondary';
    const indicatorClass = isOpen ? 'status-indicator-open' : 'status-indicator-closed';
    
    // Format deadline
    const deadlineDate = new Date(opp.application_deadline);
    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const isPastDeadline = deadlineDate < new Date() && isOpen;

    // Format skills badges
    const skillsList = opp.required_skills
      ? opp.required_skills.split(',').map(s => `<span class="badge badge-skill me-1 mb-1">${s.trim()}</span>`).join('')
      : '';

    return `
      <div class="col-lg-6 col-xl-4">
        <div class="card opportunity-card h-100 shadow-sm">
          <div class="card-header-status ${indicatorClass}"></div>
          <div class="card-body p-4 d-flex flex-column">
            
            <!-- Top Row: Department & Status -->
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-primary-subtle text-primary fw-semibold px-2 py-1 fs-7">
                <i class="bi bi-building me-1"></i>${escapeHtml(opp.department)}
              </span>
              <span class="badge ${statusBadgeClass} px-3 py-1 fs-7 rounded-pill">
                ${opp.status}
              </span>
            </div>

            <!-- Title & Faculty -->
            <h5 class="card-title fw-bold mb-1 mt-1">${escapeHtml(opp.title)}</h5>
            <p class="text-muted small mb-2">
              <i class="bi bi-person-badge-fill me-1 text-secondary"></i> ${escapeHtml(opp.faculty_name)}
            </p>

            <!-- Research Area -->
            <div class="mb-3">
              <span class="text-dark small fw-semibold">Area:</span> 
              <span class="text-secondary small">${escapeHtml(opp.research_area)}</span>
            </div>

            <!-- Description excerpt -->
            <p class="card-text text-secondary small mb-3 flex-grow-1">
              ${escapeHtml(truncateText(opp.description, 110))}
            </p>

            <!-- Skills Badges -->
            <div class="mb-3">
              ${skillsList}
            </div>

            <!-- Footer Details: Positions & Deadline -->
            <div class="pt-3 border-top d-flex justify-content-between align-items-center mb-3">
              <span class="small fw-semibold text-dark">
                <i class="bi bi-people-fill text-info me-1"></i> ${opp.available_positions} Position${opp.available_positions > 1 ? 's' : ''}
              </span>
              <span class="small ${isPastDeadline ? 'text-danger fw-bold' : 'text-muted'} deadline-badge">
                <i class="bi bi-calendar-event me-1"></i> ${formattedDeadline}
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary btn-sm flex-fill" onclick="viewDetails(${opp.id})">
                <i class="bi bi-eye-fill me-1"></i> Details
              </button>
              <button class="btn btn-outline-warning btn-sm flex-fill" onclick="openEditModal(${opp.id})">
                <i class="bi bi-pencil-square me-1"></i> Edit
              </button>
              <button class="btn btn-outline-secondary btn-sm" onclick="toggleStatus(${opp.id}, '${opp.status}')" title="Toggle Open/Closed">
                <i class="bi ${isOpen ? 'bi-toggle-on text-success' : 'bi-toggle-off'} fs-6"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" onclick="promptDelete(${opp.id}, '${escapeHtml(opp.title)}')" title="Delete Opportunity">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Update Stats Dashboard
 */
function updateStats(items) {
  const total = items.length;
  const openCount = items.filter(i => i.status === 'Open').length;
  const closedCount = items.filter(i => i.status === 'Closed').length;
  
  const depts = new Set(items.map(i => i.department).filter(Boolean));

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statOpen').textContent = openCount;
  document.getElementById('statClosed').textContent = closedCount;
  document.getElementById('statDepartments').textContent = depts.size;
}

/**
 * Populate department select filter
 */
function populateDepartmentFilter(items) {
  const select = document.getElementById('filterDepartment');
  const currentValue = select.value;

  const depts = Array.from(new Set(items.map(i => i.department).filter(Boolean))).sort();

  select.innerHTML = '<option value="">All Departments</option>' +
    depts.map(d => `<option value="${escapeHtml(d)}" ${d === currentValue ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('');
}

/**
 * Filter opportunities handler
 */
function filterOpportunities() {
  fetchOpportunities();
}

/**
 * Reset all filters
 */
function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterDepartment').value = '';
  fetchOpportunities();
}

/**
 * Open Create Opportunity Modal
 */
function openCreateModal() {
  const form = document.getElementById('opportunityForm');
  form.reset();
  form.classList.remove('was-validated');
  
  document.getElementById('oppId').value = '';
  document.getElementById('opportunityModalLabel').innerHTML = '<i class="bi bi-plus-circle me-2"></i> Post New Research Opportunity';
  document.getElementById('saveBtn').innerHTML = '<i class="bi bi-check-circle me-1"></i> Save Opportunity';
  document.getElementById('oppStatus').value = 'Open';

  // Default deadline to 30 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);
  document.getElementById('oppDeadline').value = defaultDate.toISOString().split('T')[0];

  opportunityModalInstance.show();
}

/**
 * Open Edit Opportunity Modal
 */
async function openEditModal(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'Opportunity not found');
    }

    const opp = result.data;
    const form = document.getElementById('opportunityForm');
    form.reset();
    form.classList.remove('was-validated');

    document.getElementById('oppId').value = opp.id;
    document.getElementById('oppTitle').value = opp.title;
    document.getElementById('oppFaculty').value = opp.faculty_name;
    document.getElementById('oppDepartment').value = opp.department;
    document.getElementById('oppResearchArea').value = opp.research_area;
    document.getElementById('oppPositions').value = opp.available_positions;
    document.getElementById('oppStatus').value = opp.status;

    if (opp.application_deadline) {
      const deadlineDate = new Date(opp.application_deadline).toISOString().split('T')[0];
      document.getElementById('oppDeadline').value = deadlineDate;
    }

    document.getElementById('oppSkills').value = opp.required_skills;
    document.getElementById('oppDescription').value = opp.description;

    document.getElementById('opportunityModalLabel').innerHTML = '<i class="bi bi-pencil-square me-2"></i> Edit Research Opportunity';
    document.getElementById('saveBtn').innerHTML = '<i class="bi bi-check-circle me-1"></i> Update Opportunity';

    opportunityModalInstance.show();

  } catch (error) {
    console.error('Error fetching opportunity for edit:', error);
    showToast(`Error: ${error.message}`, 'danger');
  }
}

/**
 * Save Opportunity (Create or Update)
 */
async function saveOpportunity(event) {
  event.preventDefault();
  const form = document.getElementById('opportunityForm');

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const id = document.getElementById('oppId').value;
  const isEdit = Boolean(id);

  const payload = {
    title: document.getElementById('oppTitle').value.trim(),
    faculty_name: document.getElementById('oppFaculty').value.trim(),
    department: document.getElementById('oppDepartment').value.trim(),
    research_area: document.getElementById('oppResearchArea').value.trim(),
    available_positions: parseInt(document.getElementById('oppPositions').value, 10),
    status: document.getElementById('oppStatus').value,
    application_deadline: document.getElementById('oppDeadline').value,
    required_skills: document.getElementById('oppSkills').value.trim(),
    description: document.getElementById('oppDescription').value.trim()
  };

  try {
    const url = isEdit ? `${API_BASE_URL}/${id}` : API_BASE_URL;
    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const errorMsg = result.error?.details
        ? result.error.details.join(' ')
        : (result.error?.message || 'Failed to save opportunity');
      throw new Error(errorMsg);
    }

    opportunityModalInstance.hide();
    showToast(isEdit ? 'Opportunity updated successfully!' : 'New opportunity posted successfully!', 'success');
    fetchOpportunities();

  } catch (error) {
    console.error('Error saving opportunity:', error);
    showToast(`Failed: ${error.message}`, 'danger');
  }
}

/**
 * View Opportunity Details in Modal
 */
async function viewDetails(id) {
  const bodyEl = document.getElementById('detailModalBody');
  const footerEl = document.getElementById('detailModalFooter');

  bodyEl.innerHTML = `
    <div class="text-center py-4">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2">Loading details...</p>
    </div>
  `;

  detailModalInstance.show();

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'Failed to load details');
    }

    const opp = result.data;
    const isOpen = opp.status === 'Open';
    const statusBadge = isOpen ? 'bg-success' : 'bg-secondary';
    
    const formattedDeadline = new Date(opp.application_deadline).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const skillsBadges = opp.required_skills
      ? opp.required_skills.split(',').map(s => `<span class="badge badge-skill fs-6 me-1 mb-1">${s.trim()}</span>`).join('')
      : 'None specified';

    bodyEl.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 mb-2">
            ${escapeHtml(opp.department)}
          </span>
          <h4 class="fw-bold text-dark mb-1">${escapeHtml(opp.title)}</h4>
          <p class="text-muted mb-0">
            <i class="bi bi-person-fill text-secondary me-1"></i> Supervisor: <strong>${escapeHtml(opp.faculty_name)}</strong>
          </p>
        </div>
        <span class="badge ${statusBadge} fs-6 px-3 py-2 rounded-pill">
          ${opp.status}
        </span>
      </div>

      <hr class="my-3 text-muted opacity-25">

      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="bg-light p-3 rounded-3 border">
            <span class="text-muted small d-block mb-1">Research Area</span>
            <span class="fw-bold text-dark">${escapeHtml(opp.research_area)}</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="bg-light p-3 rounded-3 border">
            <span class="text-muted small d-block mb-1">Available Positions</span>
            <span class="fw-bold text-primary fs-5"><i class="bi bi-people-fill me-1"></i> ${opp.available_positions}</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="bg-light p-3 rounded-3 border">
            <span class="text-muted small d-block mb-1">Application Deadline</span>
            <span class="fw-bold text-dark"><i class="bi bi-calendar-check me-1"></i> ${formattedDeadline}</span>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <h6 class="fw-bold text-dark mb-2"><i class="bi bi-tools me-2 text-primary"></i> Required Skills & Prerequisites</h6>
        <div>${skillsBadges}</div>
      </div>

      <div class="mb-2">
        <h6 class="fw-bold text-dark mb-2"><i class="bi bi-card-text me-2 text-primary"></i> Project Overview & Scope</h6>
        <div class="p-3 bg-light rounded-3 border text-secondary leading-relaxed" style="white-space: pre-line;">
          ${escapeHtml(opp.description)}
        </div>
      </div>
    `;

    footerEl.innerHTML = `
      <button type="button" class="btn btn-outline-secondary" onclick="toggleStatus(${opp.id}, '${opp.status}')">
        <i class="bi ${isOpen ? 'bi-door-closed' : 'bi-door-open'} me-1"></i> Mark as ${isOpen ? 'Closed' : 'Open'}
      </button>
      <button type="button" class="btn btn-warning fw-semibold" onclick="detailModalInstance.hide(); openEditModal(${opp.id});">
        <i class="bi bi-pencil-square me-1"></i> Edit Opportunity
      </button>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    `;

  } catch (error) {
    console.error('Error loading opportunity details:', error);
    bodyEl.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> Failed to load details. ${error.message}
      </div>
    `;
  }
}

/**
 * Toggle Status ('Open' <-> 'Closed')
 */
async function toggleStatus(id, currentStatus) {
  const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'Failed to update status');
    }

    showToast(`Opportunity status changed to ${newStatus}`, 'info');
    fetchOpportunities();

    // If detail modal is open, update it
    const detailModalEl = document.getElementById('detailModal');
    if (detailModalEl.classList.contains('show')) {
      viewDetails(id);
    }

  } catch (error) {
    console.error('Error toggling status:', error);
    showToast(`Error: ${error.message}`, 'danger');
  }
}

/**
 * Prompt Delete Confirmation
 */
function promptDelete(id, title) {
  deleteTargetId = id;
  document.getElementById('deleteOppTitle').textContent = title;
  deleteModalInstance.show();
}

/**
 * Execute Delete Request
 */
async function executeDelete() {
  if (!deleteTargetId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${deleteTargetId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'Failed to delete opportunity');
    }

    deleteModalInstance.hide();
    showToast('Research opportunity deleted successfully!', 'warning');
    deleteTargetId = null;
    fetchOpportunities();

  } catch (error) {
    console.error('Error deleting opportunity:', error);
    showToast(`Delete failed: ${error.message}`, 'danger');
  }
}

/**
 * Helpers
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
