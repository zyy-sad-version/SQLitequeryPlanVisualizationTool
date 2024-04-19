var count;
var sum;
var avg;
var fromBtnNumOfClick = 0;
var originalQuery = "";
var orderByTableInformation = [];
var groupByTableInformation = [];
var pressedGroupBy = false;
var havingFunction = "";

function openFileUploader() {
  document.getElementById("file-input").click();
}

function handleFileUpload() {
  var fileInput = document.getElementById("file-input");
  var selectedFile = fileInput.files[0];
  if (fileInput) {
    const type = /\.(db)$/.exec(selectedFile.name);
    if (!type) {
      alert("Please upload DB file");
    } else {
      var formData = new FormData();
      formData.append("file", selectedFile);

      fetch("/dbupload", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            alert("File uploaded successfully");
          } else {
            alert("File upload failed");
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  } else alert("The file is null");
}
function redirectToInfoPage() {
  window.location.href = "./info.html";
}
function redirectToDBPage() {
  window.location.href = "./db.html";
}
function redirectToHistoryPage() {
  window.location.href = "./history.html";
}
function redirectToMainPage() {
  window.location.href = "./index.html";
}

function enterSQLcommand(event) {
  if (event.keyCode == 13) {
    var inputText = document.getElementById("input-text").value;

    var dbIndex = 0;
    var postBody = { sqlcommand: inputText, databaseIndex: databaseIndex };

    fetch("/upload/sql", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset = UTF-8" },
      body: JSON.stringify(postBody),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data) {
          alert("Query is invalid, please input valid sql query");
        } else {

          getAnalysedSQL(0);
        }
      })
      .catch((error) => {
        alert("error:", error);
      });
  }
}
function getAnalysedSQL(i) {
  var sqlIndex = { index: i };
  fetch("/getsqlarr", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset = UTF-8" },
    body: JSON.stringify(sqlIndex),
  })
    .then((response) => response.json())
    .then((data) => {

      var visualizationDiv = document.getElementById("visualization-area");
      if (visualizationDiv.childNodes.length > 0) {
        while (visualizationDiv.firstChild) {
          visualizationDiv.removeChild(visualizationDiv.firstChild);
        }
      }

      var keys = Object.keys(data);
      var notNullCount = 0;
      keys.forEach((element) => {
        if (data[element] == null) notNullCount++;
      });

      var fragment = document.createDocumentFragment();
      for (var i = 0; i < keys.length; i++) {
        if (data[keys[i]] != null) {
          var btn = document.createElement("button");
          var text = keys[i] + data[keys[i]];
          btn.id = "btn-" + keys[i];

          btn.textContent = text;
          if (text.includes("having")) {
            havingFunction = text;
          }
          btn.onclick = (function (key) {
            return function () {
              var text = document.getElementById("btn-" + key).textContent;
              executeVisualization(key, text);
            };
          })(keys[i]);
          fragment.appendChild(btn);
          fragment.appendChild(document.createElement("br"));
        }
      }
      visualizationDiv.appendChild(fragment);
    })
    .catch((error) => {
      console.error(error);
    });
}

function executeVisualization(keyWord, command) {
  switch (keyWord) {
    case "from":
      {
        fromBtnNumOfClick++;
        var count = 0;
        let joinTable = "select * " + command;
        if (originalQuery === "") {
          originalQuery = joinTable;
        }


        if(command.includes("join")){
          var fromButton = document.getElementById("btn-from");
          fromButton.style.backgroundColor = "red"
          let div = document.getElementById('visualization-container')
          let frag = document.createDocumentFragment();
          let canvas = document.createElement('canvas');
          canvas.id = 'mycanvas';
          frag.appendChild(canvas);
          div.appendChild(frag);
          if(command.includes("on")){


            let str = fromButton.innerHTML

            let joinIndex = str.indexOf("join");

            str = str.substring(0,joinIndex)+"\n"+str.substring(joinIndex+1)
            let equalIndex = str.indexOf('=');

            str =  str.substring(0, equalIndex + 1) + "\n" + str.substring(equalIndex + 1);

            setHasInnerJoinCondition(true)
            setCondition(str);
            getAnimation();
          }else{
         setCondition(command);
         getAnimation()
          }
         let postMsg = { query: originalQuery, databaseIndex: databaseIndex };
          fetch("/getsqlresult", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset = UTF-8" },
            body: JSON.stringify(postMsg),
          })
              .then((response) => response.json())
              .then((data) => {
                // remove old information
                var table = document.getElementById("database-table");

                if (table.childNodes.length > 0) {
                  while (table.firstChild) table.removeChild(table.firstChild);
                }
                var fragment = document.createDocumentFragment();
                // add new information
                for (var i = 0; i < data.length; i++) {
                  var tr = document.createElement("tr");
                  data[i].forEach((element) => {
                    var table_data = document.createElement("td");
                    table_data.textContent = element;
                    tr.appendChild(table_data);
                  });
                  fragment.appendChild(tr);
                }
                table.appendChild(fragment);
              });
        }

        // change to current table
        if (!command.includes(currentTableName)) {
          fetch("/database/getname")
            .then((response) => response.json())
            .then((data) => {
              var keys = Object.keys(data);

              for (var i = 0; i < data[keys[databaseIndex]].length; i++) {
                if (command.includes(data[keys[databaseIndex]][i])) {
                  currentTable = i + 1;
                  getTableInfo();
                }
              }
            });
        }

        // animation
        var blinkInterval = setInterval(function () {
          if (count % 2 === 0) {
            document.getElementById("database-container").style.border =
              "5px solid rgb(255, 0, 0)";
          } else {
            document.getElementById("database-container").style.border =
              "5px solid rgb(255, 255, 255)";
          }
          count++;
          if (count >= 6) {
            clearInterval(blinkInterval);
            document.getElementById("database-container").style.border =
              "transparent"; // 恢复原边框样式
          }
        }, 500);


      }
      break;
    case "where":
      {
        // only consider simple condition for where clause
        // gain name of variable
        // if query contains =, replace it with ==

        var filteredCommand = command.split(" ").filter(function (item) {
          return item !== keyWord;
        });
        var variableName = filteredCommand[0];
        for (var i = 0; i < filteredCommand.length; i++) {
          if (filteredCommand[i] == "=") {
            filteredCommand[i] = "==";
          }
        }
        var condition = filteredCommand.join("");

        var table = document.getElementById("database-table");
        var rows = table.rows;
        // headers
        var celIndex = 0;
        var headers = rows[0];

        for (var celindex = 0; celindex < headers.cells.length; celindex++) {
          if (
            areSimilarIgnoringCaseAndWhitespace(
              variableName,
              rows[0].cells[celindex].innerHTML
            )
          ) {
            celIndex = celindex;
            break;
          }
        }

        for (var i = 1; i < rows.length; i++) {
          var conSencentence = "var " + variableName + "=";
          var value = rows[i].cells[celIndex].innerHTML;
          var regPos = /^[0-9]+.?[0-9]*/; //判断是否是数字。

          // process variable name
          if (conSencentence.includes(".") || condition.includes(".")) {
            conSencentence = conSencentence.replace(/^[^\.]*\./, "");
            condition = condition.replace(/^[^\.]*\./, "");
          }
          if (regPos.test(value)) {
            conSencentence =
              conSencentence + rows[i].cells[celIndex].innerHTML + ";";
          } else {
            // process string
            //remove the space
            var value = rows[i].cells[celIndex].innerHTML
              .replace(/\s*/g, "")
              .toLowerCase();

            conSencentence = conSencentence + '"' + value + '"' + ";";
          }
          // translate string to command
          eval(conSencentence);

          if (eval(condition)) {
            rows[i].cells[celIndex].style.border = "5px solid orange";
          } else {
            // delete cells which are not satisfied
            rows[i].remove();
            i--;
          }
        }
        document.getElementById("btn-where").style.backgroundColor = "orange";
      }
      break;
    case "group by":
      {
        pressedGroupBy = true;
        // Check if it is number, sort the number ascending
        // reorgnization

        var groupByConditon = command.replace("group by", "");

        var table = document.getElementById("database-table");
        var rows = table.rows;
        // get table form html
        var table = document.getElementById("database-table");
        var rows = table.rows;
        var celName = "";
        var headerObj = {};

        for (var i = 0; i < rows[0].cells.length; i++) {
          headerObj[rows[0].cells[i].innerHTML.toLowerCase()] = null;
          if (
            groupByConditon.includes(rows[0].cells[i].innerHTML.toLowerCase())
          ) {
            celName = rows[0].cells[i].innerHTML.toLowerCase();
          }
        }

        //从前端获取数据
        for (var i = 1; i < rows.length; i++) {
          var newObj = JSON.parse(JSON.stringify(headerObj));
          for (var j = 0; j < rows[i].cells.length; j++) {
            newObj[rows[0].cells[j].innerHTML.toLowerCase()] =
              rows[i].cells[j].innerHTML;
          }
          groupByTableInformation.push(newObj);
        }

        // 进行排序
        groupByTableInformation.sort((a, b) => {
          return a[celName].localeCompare(b[celName], undefined, {
            numeric: true,
          });
        });


        var databaseTable = document.getElementById("database-table");
        if (databaseTable.childNodes.length > 0) {
          while (databaseTable.firstChild) {
            databaseTable.removeChild(databaseTable.firstChild);
          }
        }


        // header
        var headerValue = Object.keys(headerObj);
        var headerFrag = document.createDocumentFragment();

        var header_row = document.createElement("tr");

        headerValue.forEach((h) => {
          var header_td = document.createElement("td");
          header_td.textContent = h;
          header_row.appendChild(header_td);
        });

        headerFrag.appendChild(header_row);
        databaseTable.appendChild(headerFrag);


        for (var i = 0; i < groupByTableInformation.length; i++) {
          var prevaValue = null;
          (function (i) {
            setTimeout(function () {
              var currentValue = groupByTableInformation[i][celName];
              if (prevaValue == currentValue) {
                return;
              }
              prevaValue = (" " + currentValue).slice(1);
              var table_row = document.createElement("tr");
              for (var j = 0; j < headerValue.length; j++) {
                var currentValue = groupByTableInformation[i][headerValue[j]];
                var table_data = document.createElement("td");
                table_data.textContent =
                  groupByTableInformation[i][headerValue[j]];
                table_row.appendChild(table_data);
              }
              table_row.classList.add("highlight");
              databaseTable.appendChild(table_row); // Move this line outside of the if condition
            }, i * 50);
          })(i);
        }

        document.getElementById("btn-group by").style.backgroundColor =
          "yellow";
      }
      break;
    case "having":
      {
        if (pressedGroupBy) {
          if (havingFunction.includes("count")) {
            //  console.log);
            processDatabaseTable(
              "count",
              havingFunction.replace("having", "").replace("count", "")
            );
          }


          document.getElementById("btn-having").style.backgroundColor = "green";
        } else {
          alert("Please Get Group By Value First!");
        }

      }
      break;
    case "order by":
      {
        // sort data
        var conditions = command.replace("order by", "").split(",");

        // gain table
        var table = document.getElementById("database-table");
        // gain headers
        var rowOBJ = {};
        for (var i = 0; i < table.rows[0].cells.length; i++) {
          var keyName = table.rows[0].cells[i].innerHTML;
          rowOBJ[keyName] = null;
        }
        var keys = Object.keys(rowOBJ);
        for (var i = 1; i < table.rows.length; i++) {
          var newRowObj = JSON.parse(JSON.stringify(rowOBJ));
          for (var j = 0; j < table.rows[i].cells.length; j++) {
            newRowObj[keys[j]] = table.rows[i].cells[j].innerHTML;
          }
          orderByTableInformation.push(newRowObj);
        }

        conditions.forEach((condition) => {
          // extract keywords
          var sorterName = "";

          keys.forEach((key) => {
            if (condition.includes(key.toLowerCase())) {
              sorterName = key;
            }
          });

          if (condition.includes("desc")) {
            orderingFunction(false, sorterName);
          } else {
            orderingFunction(true, sorterName);
          }

          if (table.childNodes.length > 0) {
            while (table.firstChild) {
              table.removeChild(table.firstChild);
            }
          }

          var headerFrag = document.createDocumentFragment();
          var header_row = document.createElement("tr");
          keys.forEach((h) => {
            var header_td = document.createElement("td");
            header_td.textContent = h;

            if (h.includes(sorterName)) {
              header_td.style.backgroundColor = "purple";
            }
            header_row.appendChild(header_td);
          });

          headerFrag.appendChild(header_row);

          for (var i = 0; i < orderByTableInformation.length; i++) {
            var table_row = document.createElement("tr");
            for (var j = 0; j < keys.length; j++) {
              var table_data = document.createElement("td");
              table_data.textContent = orderByTableInformation[i][keys[j]];

              table_row.appendChild(table_data);
            }
            headerFrag.appendChild(table_row); // Move this line outside of the if condition
          }
          table.appendChild(headerFrag);
        });

        document.getElementById("btn-order by").style.backgroundColor =
          "purple";
      }
      break;
    case "limit":
      {
        var limitNumber = parseInt(command.replace("limit", "").trim());

        var table = document.getElementById("database-table");
        // number of rows
        var numOfRows = table.rows.length - 1;
        if (numOfRows < limitNumber) {
          limitNumber = numOfRows;
        }
        for (var i = numOfRows; i > limitNumber; i--) {
          table.rows[i].remove();
        }
        document.getElementById("btn-limit").style.backgroundColor = "pink";
      }
      break;
    case "select":
      {
        var distinct = command.replace("select", "").trim();

        var row = document.getElementById("database-table").rows[0];
        if (distinct.includes("*")) {
          var count = 0;
          //  row.classList.add("hightlight");
          var blinkInterval = setInterval(function () {
            if (count % 2 === 0) {
              row.style.backgroundColor = "blue";
            } else {
              row.style.backgroundColor = "transparent";
            }
            count++;
            if (count >= 6) {
              row.style.backgroundColor = "transparent";
            }
          }, 500);
        }
        // over 2
        else if (distinct.includes(",")) {
          var distincts = distinct.split(",");

          // get headers
          var headers = [];
          for (var i = 0; i < row.cells.length; i++) {
            headers[i] = row.cells[i].innerHTML.trim();
          }

          for (var i = 0; i < distincts.length; i++) {
            for (var j = 0; j < headers.length; j++) {
              console.log(headers[j])
              console.log(distincts[i])
              if (distincts[i].includes(headers[j])) {
                row.cells[j].style.backgroundColor = "blue";
                break;
              }
            }
          }
        }
        document.getElementById("btn-select").style.backgroundColor = "blue";
      }
      break;
  }
}

function areSimilarIgnoringCaseAndWhitespace(str1, str2) {
  //  remove space and convert to lower case then do comparison
  const cleanStr1 = str1.replace(/\s/g, "").toLowerCase();
  const cleanStr2 = str2.replace(/\s/g, "").toLowerCase();
  // compare 2 string if they're the same after processed
  return cleanStr1 === cleanStr2;
}
function processDatabaseTable(funcType, countCondition) {
  //   global is the sorted table whoes data type is json
  switch (funcType) {
    case "count":
      {
        let matches = havingFunction.match(/\(([^)]+)\)/);
        if (matches) {
          var countObj = matches[1];
          countCondition = countCondition
            .replace(countObj, "")
            .replace("(", "")
            .replace(")", "");

          var countOBJIndex = 0;
          let keysArr = Object.keys(groupByTableInformation[0]);

          for (var i = 0; i < keysArr.length; i++) {
            if (
              keysArr[i].includes(countObj) ||
              countObj.includes(keysArr[i])
            ) {
              countOBJIndex = i;
              break;
            }
          }

          var result = {};
          // count
          var countNumber = 0;
          var prevValue = null;

          for (var i = 0; i < groupByTableInformation.length; i++) {
            var currentVale =
              groupByTableInformation[i][keysArr[countOBJIndex]];

            if (prevValue === null) {
              prevValue = (" " + currentVale).slice(1);
            }
            if (prevValue != currentVale) {
              result[prevValue] = countNumber;
              prevValue = (" " + currentVale).slice(1);
              countNumber = 0;
            }

            countNumber++;
            if (i == groupByTableInformation.length - 1) {
              result[prevValue] = countNumber;
            }
          }

          let resKeys = Object.keys(result);
          countCondition = countObj + countCondition;
          for (var i = 0; i < resKeys.length; i++) {
            var assignSentence = "var " + countObj + " = " + result[resKeys[i]];
            eval(assignSentence);
            if (eval(countCondition)) {
              result[resKeys[i]] = true;
            } else {
              result[resKeys[i]] = false;
            }
          }
        }

        var table = document.getElementById("database-table");
        for (var i = 1; i < table.rows.length; i++) {
          var test = table.rows[i].cells[countOBJIndex].innerHTML;

          if (result[test]) {
            table.rows[i].classList.add("greenhighlight");
          } else {
            table.rows[i].remove();
            i--;
          }
        }
      }
      break;
    case "avg":
      {
      }
      break;
    case "sum":
      {
      }
      break;
  }
}

function orderingFunction(isAESC, sorterName) {
  if (isAESC) {
    //

    orderByTableInformation.sort((a, b) => {
      var nameA = null;
      var nameB = null;
      if (parseInt(a[sorterName].trim())) {
        nameA = parseInt(a[sorterName].trim());
        nameB = parseInt(b[sorterName].trim());
      } else {
        nameA = a[sorterName].trim().toUpperCase();
        nameB = b[sorterName].trim().toUpperCase();
      }
      if (nameA > nameB) {
        return 1;
      }
      if (nameA < nameB) {
        return -1;
      }
      return 0;
    });
  } else {
    // 降序
    orderByTableInformation.sort((a, b) => {
      var nameA = null;
      var nameB = null;
      if (parseInt(a[sorterName].trim())) {
        nameA = parseInt(a[sorterName].trim());
        nameB = parseInt(b[sorterName].trim());
      } else {
        nameA = a[sorterName].trim().toUpperCase();
        nameB = b[sorterName].trim().toUpperCase();
      }
      if (nameA < nameB) {
        return 1;
      }
      if (nameA > nameB) {
        return -1;
      }
      return 0;
    });
  }
}
