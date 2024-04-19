from flask import Flask, render_template, request, jsonify
import os
import json
import dbToJson
import sqlHandler


app = Flask(__name__, template_folder='./static/template')
app.config['JSON_SORT_KEYS'] = False


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index.html')
def index1():
    return render_template('index.html')

@app.route('/history.html')
def history():
    return render_template('history.html')

@app.route('/db.html')
def database():
    return render_template('db.html')

@app.route('/info.html')
def info():
    return render_template('info.html')

@app.route('/dbupload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part'

    file = request.files['file']

    if file.filename == '':
        return 'No selected file'

    # 这里可以根据您的需求保存文件到服务器的指定路径
    file.save("./static/db/"+file.filename)
    return 'File uploaded successfully'

@app.route('/database/getname',methods=['GET'])
def get_database_table_name():
    folder_path = 'static/db'
    file_names = os.listdir(folder_path)
    # obtain all the tables' name
    dbinfo = {}
    for file_name in file_names:
        cvtOBJ = dbToJson.DBToJson(file_name)
        dbinfo[file_name] = cvtOBJ.getTableNames()
    
    return jsonify(dbinfo)




@app.route('/database/getdbtables',methods=['POST'])
def get_database_tables():
    data = request.get_json() 
    # get index
    dbIndex = int(data.get('dbIndex'))
    tableIndex = int(data.get('tableIndex') )
    dbName = os.listdir('static/db')[dbIndex]
    cvtOBJ = dbToJson.DBToJson(dbName)
    tableInfo = cvtOBJ.getTableInfo(tableIndex-1)
    json_info = json.dumps(tableInfo)
    return jsonify(json_info)

@app.route('/database/getdbheaders',methods=['POST'])
def get_database_tableheaders():
    data = request.get_json() 
    # get index
    dbIndex = int(data.get('dbIndex'))
    tableIndex = int(data.get('tableIndex') )
    dbName = os.listdir('static/db')[dbIndex]
    cvtOBJ = dbToJson.DBToJson(dbName)
    
    headers = cvtOBJ.getTableHeader(tableIndex-1)
    json_info = json.dumps(headers)
    return jsonify(json_info)

@app.route('/database/getnumoftables',methods = ['GET'])
def getNumOfTable():
    folder_path = 'static/db'
    first_file = os.listdir(folder_path)[0]
    cvtOBJ = dbToJson.DBToJson(first_file)
    num = cvtOBJ.getNumOfTable()
    return  jsonify({'numOftables': num})

@app.route('/upload/sql', methods = ['POST'])
def saveSQLCommand():
    sql = request.get_json()
    query = sql.get('sqlcommand')
    databaseIndex = int(sql.get('databaseIndex'))
    # get database name by index 
    folder_path = 'static/db'
    db = os.listdir(folder_path)[databaseIndex]
    cvtOBJ = dbToJson.DBToJson(db)
    dbConn = cvtOBJ.connectDB()
    handler = sqlHandler.SQLHandler(query)
    isValid = handler.isQuerySatisfied(dbConn)
    if isValid:
        query = query.lower()
        with open('static/sql/sql.txt','r+') as file:
            content = file.read()
            file.seek(0,0)
            file.write(query+'\n'+content)    
    return jsonify(isValid)

@app.route('/getsqlarr', methods = ['POST'])
def getSQLArray():
    sqlIndex = int(request.get_json().get('index'))
    result = None
    with open('static/sql/sql.txt') as file:
        for num, line in enumerate(file):
            if num == sqlIndex:
                handler = sqlHandler.SQLHandler(line)
                result = handler.separateQuery()
                break
    
    return jsonify(result)

@app.route('/getsqlresult', methods = ['POST'])
def getSQLresult():
    sqlOBJ = request.get_json()
    # get sql query and which db 
    query = sqlOBJ.get('query')
    databaseIndex = int(sqlOBJ.get('databaseIndex'))
    folder_path = 'static/db'
    db = os.listdir(folder_path)[databaseIndex]
    cvtOBJ = dbToJson.DBToJson(db)
    dbConn = cvtOBJ.connectDB()
    handler = sqlHandler.SQLHandler(query)
    isValid = handler.isQuerySatisfied(dbConn)
    if isValid: 
        return jsonify(cvtOBJ.getQueryResult(query))
    else:
        return jsonify("invalid query")

if __name__ == '__main__':
    app.run(debug=True)