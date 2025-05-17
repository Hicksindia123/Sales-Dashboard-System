const apiUrl = "https://script.google.com/macros/s/AKfycbzLUQ8RPuWecz4WtmXtnvlI8hjUpnMEsvzNC3D495Db/dev";
const table = document.getElementById("dataTable");
const tbody = table.querySelector("tbody");
const thead = table.querySelector("thead");
const totalDiv = document.getElementById("total");
let rawData = [];

function formatDateToISO(dateStr) {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

function populateFilters(data) {
  const sets = { state: new Set(), city: new Set(), rep: new Set(), distributor: new Set() };
  data.forEach(row => {
    sets.state.add(row["State"]);
    sets.city.add(row["City"]);
    sets.rep.add(row["Rep"]);
    sets.distributor.add(row["Distributor"]);
  });

  fillSelect("stateFilter", [...sets.state]);
  fillSelect("cityFilter", [...sets.city]);
  fillSelect("repFilter", [...sets.rep]);
  fillSelect("distributorFilter", [...sets.distributor]);

  document.querySelectorAll('.tom-select').forEach(el => new TomSelect(el));
}

function fillSelect(id, options) {
  const select = document.getElementById(id);
  options.sort().forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
}

function filterData() {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;
  const state = (document.getElementById("stateFilter").value || "").trim().toLowerCase();
  const city = (document.getElementById("cityFilter").value || "").trim().toLowerCase();
  const rep = (document.getElementById("repFilter").value || "").trim().toLowerCase();
  const distributor = (document.getElementById("distributorFilter").value || "").trim().toLowerCase();

  const filtered = rawData.filter(row => {
    const formattedDate = formatDateToISO(row["Bill Date"]);
    return (!from || formattedDate >= from) &&
           (!to || formattedDate <= to) &&
           (!state || (row["State"] || '').trim().toLowerCase() === state) &&
           (!city || (row["City"] || '').trim().toLowerCase() === city) &&
           (!rep || (row["Rep"] || '').trim().toLowerCase() === rep) &&
           (!distributor || (row["Distributor"] || '').trim().toLowerCase() === distributor);
  });

  const headers = Object.keys(rawData[0]);
  renderTable([headers, ...filtered.map(r => headers.map(h => r[h]))]);
}

function renderTable(data) {
  thead.innerHTML = "";
  tbody.innerHTML = "";

  const headerRow = document.createElement("tr");
  data[0].forEach(header => {
    const th = document.createElement("th");
    th.className = "px-4 py-2 text-left text-xs font-medium uppercase tracking-wider";
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  let total = 0;
  data.slice(1).forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.className = "px-4 py-2 text-sm text-gray-700";
      td.textContent = cell;
      tr.appendChild(td);
    });
    total += parseFloat(row[2]) || 0;
    tbody.appendChild(tr);
  });

  totalDiv.textContent = `Total Sale: ₹ ${total.toLocaleString("en-IN")}`;
}

fetch(apiUrl)
  .then(res => res.json())
  .then(data => {
    rawData = data;
    const headers = Object.keys(data[0]);
    const rows = data.map(r => headers.map(h => r[h]));
    populateFilters(data);
    renderTable([headers, ...rows]);
    document.getElementById("applyBtn").addEventListener("click", filterData);
  });
