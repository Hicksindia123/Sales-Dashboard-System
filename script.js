const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwaiN2x_68OYELDCAiH6gtuNbP0vLxdOY6QmTsg0zLxHLRGsaFHi_qm2fOfhGajPl6XjDmBJrKoSvx/pub?output=csv";
const table = document.getElementById("dataTable");
const tbody = table.querySelector("tbody");
const thead = table.querySelector("thead");
const totalDiv = document.getElementById("total");

let rawData = [];

function parseCSV(text) {
  return text.trim().split("\n").map(row => row.split(","));
}

function formatDateToISO(dateStr) {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

function populateFilters(data) {
  const sets = {
    state: new Set(),
    city: new Set(),
    rep: new Set(),
    distributor: new Set()
  };

  data.slice(1).forEach(row => {
    sets.state.add(row[6]);        // State
    sets.city.add(row[4]);         // City
    sets.rep.add(row[7]);          // Rep
    sets.distributor.add(row[3]);  // Distributor
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
  const state = document.getElementById("stateFilter").value.trim();
  const city = document.getElementById("cityFilter").value.trim();
  const rep = document.getElementById("repFilter").value.trim();
  const distributor = document.getElementById("distributorFilter").value.trim();

  const filtered = rawData.slice(1).filter(row => {
    const formattedDate = formatDateToISO(row[1]); // Bill Date = column B
    return (!from || formattedDate >= from) &&
           (!to || formattedDate <= to) &&
           (!state || row[6].trim() === state) &&
           (!city || row[4].trim() === city) &&
           (!rep || row[7].trim() === rep) &&
           (!distributor || row[3].trim() === distributor);
  });

  renderTable([rawData[0], ...filtered]);
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
    total += parseFloat(row[2]) || 0; // Bill Amount = column C
    tbody.appendChild(tr);
  });

  totalDiv.textContent = `Total Sale: ₹ ${total.toLocaleString("en-IN")}`;
}

fetch(csvUrl)
  .then(res => res.text())
  .then(text => {
    rawData = parseCSV(text);
    populateFilters(rawData);
    renderTable(rawData);

    document.getElementById("applyBtn").addEventListener("click", filterData);
  });
