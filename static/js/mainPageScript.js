var currentTable = 1;
var numOfTable;
var databaseIndex;
var currentTableName = "";

window.onload = function () {
  databaseIndex = 0;
  generatePagination();
  getTableInfo();
};

function generatePagination() {
  fetch("/database/getnumoftables")
    .then((response) => response.json())
    .then((data) => {
      numOfTable = data.numOftables;

      var fragment = document.createDocumentFragment();
      var prev_button = document.createElement("button");
      prev_button.textContent = "Prev";
      prev_button.id = "pagination-button";
      prev_button.onclick = function () {
        if (currentTable > 1) {
          currentTable--;

          getTableInfo();
        }
      };
      fragment.appendChild(prev_button);

      var next_button = document.createElement("button");
      next_button.textContent = "Next";
      next_button.id = "pagination-button";
      next_button.onclick = function () {
        if (currentTable < numOfTable) {
          currentTable++;
          getTableInfo();
        }
      };
      fragment.appendChild(next_button);

      document.getElementById("upload-content").appendChild(fragment);
    });
}

function getTableInfo(dbindex, tableindex) {
  fetch("/database/getname")
    .then((response) => response.json())
    .then((data) => {
      var keys = Object.keys(data);
      document.getElementById("current-db-name").textContent =
        "Current Database: " + keys[databaseIndex];
      // document.getElementById("current-table-name").textContent =
      //   "Current Table: " + data[keys[databaseIndex]][currentTable - 1];
      // currentTableName = data[keys[databaseIndex]][currentTable - 1];
      document.getElementById("current-table-name").textContent =
        "Current Table: student_catalog inner join module_catalog on \nstudent_catalog.studentid = module_catalog.studentid";


    });

  // remove old information
  var databaseTable = document.getElementById("database-table");
  if (databaseTable.childNodes.length > 0) {
    while (databaseTable.firstChild) {
      databaseTable.removeChild(databaseTable.firstChild);
    }
  }
  var index = {
    dbIndex: databaseIndex.toString(),
    tableIndex: currentTable.toString(),
  };
  fetch("/database/getdbheaders", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset = UTF-8" },
    body: JSON.stringify(index),
  })
    .then((response) => response.json())
    .then((tableHeader) => {
      fetch("/database/getdbtables", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset = UTF-8" },
        body: JSON.stringify(index),
      })
        .then((response) => response.json())
        .then((data) => {
          traslationToTable(data, tableHeader);
        })
        .catch((error) => {
          console.error("REQUEST ERROR", error);
        });
    });
}

function traslationToTable(tableInfo, tableHeader) {
  var fragment = document.createDocumentFragment();

  var arr = tableInfo.split('"], ');
  var headerArr = tableHeader.split(",");
  var header_row = document.createElement("tr");

  headerArr.forEach((header) => {
    header = header.replace("[", "");
    header = header.replace('"', "");
    header = header.replace('"', "");
    header = header.replace("]", "");
    var header_name = document.createElement("td");
    header_name.textContent = header;
    header_row.appendChild(header_name);
  });
  fragment.appendChild(header_row);
  for (var i = 0; i < arr.length; i++) {
    var table_row = document.createElement("tr");

    rows = arr[i].split(",");
    rows.forEach((element) => {
      element = element.replace("[", "");
      element = element.replace("[", "");
      element = element.replace('"', "");
      element = element.replace('"', "");
      element = element.replace("]", "");
      element = element.replace("]", "");
      var table_data = document.createElement("td");
      table_data.textContent = element;
      table_row.appendChild(table_data);
    });
    fragment.appendChild(table_row);
  }

  document.getElementById("database-table").appendChild(fragment);
}
