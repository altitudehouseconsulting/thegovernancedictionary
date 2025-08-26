
async function loadGovernanceData() {
  const response = await fetch('aviation_governance_500.json');
  const data = await response.json();

  const searchInput = document.getElementById('searchInput');
  const tbody = document.querySelector('#governanceTable tbody');
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');

  const filters = { governance_area: new Set(), framework: new Set(), function: new Set() };
  let currentPage = 1;
  const rowsPerPage = 25;

  function sanitize(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);
  }

  function renderCheckboxes(set, id, key) {
    const container = document.getElementById(id);
    container.innerHTML = '';
    Array.from(set).sort().forEach(val => {
      const input = document.createElement('input');
      input.type = 'checkbox'; input.value = val;
      input.onchange = () => { input.checked ? filters[key].add(val) : filters[key].delete(val); renderTable(); };
      const label = document.createElement('label');
      label.appendChild(input); label.append(" " + val);
      container.appendChild(label);
    });
  }

  function populateFilters() {
    const areas = new Set(), frameworks = new Set(), functions = new Set();
    data.forEach(d => { areas.add(d.governance_area); frameworks.add(d.framework); functions.add(d.function); });
    renderCheckboxes(areas, 'governanceAreaFilter', 'governance_area');
    renderCheckboxes(frameworks, 'frameworkFilter', 'framework');
    renderCheckboxes(functions, 'functionFilter', 'function');
  }

  function getFilteredData() {
    return data.filter(row => {
      const areaOk = !filters.governance_area.size || filters.governance_area.has(row.governance_area);
      const fwOk = !filters.framework.size || filters.framework.has(row.framework);
      const fnOk = !filters.function.size || filters.function.has(row.function);
      const searchOk = Object.values(row).some(v => v.toLowerCase().includes(searchInput.value.toLowerCase()));
      return areaOk && fwOk && fnOk && searchOk;
    });
  }

  function renderTable() {
    const filtered = getFilteredData();
    const start = (currentPage - 1) * rowsPerPage;
    const paginated = filtered.slice(start, start + rowsPerPage);
    tbody.innerHTML = '';
    paginated.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${sanitize(row.governance_area)}</td>
        <td>${sanitize(row.framework)}</td>
        <td>${sanitize(row.function)}</td>
        <td>${sanitize(row.example)}</td>
        <td>${sanitize(row.consequence)}</td>
      `;
      tbody.appendChild(tr);
    });
    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(filtered.length / rowsPerPage)}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === Math.ceil(filtered.length / rowsPerPage);
  }

  prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderTable(); } };
  nextBtn.onclick = () => { currentPage++; renderTable(); };
  searchInput.oninput = () => { currentPage = 1; renderTable(); };

  populateFilters();
  renderTable();
}
loadGovernanceData();
