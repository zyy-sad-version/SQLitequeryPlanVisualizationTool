window.onload = function () {
  getDatabaseName();
};

function getDatabaseName() {
  // get the table by id
  var table = document.getElementById("database-table");

  // get the file name form the back-end
  fetch("/database/getdbname")
    .then((response) => response.json())
    .then((data) => {
      for (var i = 0; i < data.length; i++) {
        var row = table.insertRow(i);
        var cell = row.insertCell(0);
        cell.textContent = data[i];
      }
    });
}
