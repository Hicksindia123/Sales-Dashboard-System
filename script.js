const salesUrl = https://script.google.com/macros/s/AKfycbzB488oPQwyo4mAIf13jMFJjbnaWC14AYi4ThQtNmK-lJ3xBPGNF82Yzji1T72rkcg1tA/exec
const filterUrl = https://script.google.com/macros/s/AKfycbzB488oPQwyo4mAIf13jMFJjbnaWC14AYi4ThQtNmK-lJ3xBPGNF82Yzji1T72rkcg1tA/exec

let rawData = [];

function formatDateToISO(dateStr) {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

function populateFiltersFromSheet(data) {
  const sets = { state: [], city: [], rep: [], distributor: [] };
  data.forEach(row => {
    sets.distributor.push(row["Distributor"]);
    sets.city.push(row["City"]);
    sets.state.push(row["State"]);
    sets.rep.push(row["Rep"]);
  });

  fillSelect("stateFilter", sets.state);
  fillSelect("cityFilter", sets.city);
  fillSelect("repFilter", sets.rep);
  fillSelect("distributorFilter", sets.distributor);

  document.querySelectorAll('.tom-select').forEach(el => new TomSelect(el));
}

function fillSelect(id, options) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">All</option>';
  [...new Set(options)].sort().forEach(opt => {
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
  const table = document.getElementById("dataTable");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

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

  document.getElementById("total").textContent = `Total Sale: ₹ ${total.toLocaleString("en-IN")}`;
}

Promise.all([
  fetch(salesUrl).then(res => res.json()),
  fetch(filterUrl).then(res => res.json())
]).then(([salesData, filterData]) => {
  rawData = salesData;
  const headers = Object.keys(salesData[0]);
  const rows = salesData.map(r => headers.map(h => r[h]));
  populateFiltersFromSheet(filterData);
  renderTable([headers, ...rows]);
  document.getElementById("applyBtn").addEventListener("click", filterData);
});
