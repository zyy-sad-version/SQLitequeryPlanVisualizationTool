
import sqlite3
class DBToJson:
    databaseName = ''

    def __init__(self, databaseName):
        self.databaseName = databaseName

    def connectDB(self):
        path = 'static/db/'+self.databaseName
        conn = sqlite3.connect(path)
        return conn
    
    def getTableNames(self):
        db = self.connectDB()
        if(db):
            cur = db.cursor()
            try:
                cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
                table_names = cur.fetchall()
                db.close()
                return table_names  
            except Exception as e:
                print('ERROR:'+e)
                db.close()
                return "Some error happened, cannot get the information of tables in this database"
            
    def getNumOfTable(self):
        db = self.connectDB()
        if(db):
            cur = db.cursor()
            try:
                cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
                num_of_table = len(cur.fetchall())
                db.close()
                return num_of_table
            except Exception as e:
                print('ERROR:'+e)
                db.close()
                return "Some error happened, cannot get the information of tables in this database"
            
    def getTableInfo(self, index):
        db = self.connectDB()
        if(db):
            cur = db.cursor()
            try:
                cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
                table_name = cur.fetchall()
                selected_table = str(table_name[index][0])
                cur.execute("SELECT * FROM "+selected_table+";")
                result = cur.fetchall()
                db.close()
                return result
            except Exception as e:
                print('ERROR:'+e)
                db.close()

    def getTableHeader(self,index):
        db = self.connectDB()
        if db:
            cur = db.cursor()
            try:
                cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
                table_name = cur.fetchall()
                selected_table = str(table_name[index][0])
                cur.execute(f"PRAGMA table_info({selected_table})")
                columns = cur.fetchall()
                table_headers = []
                for col in columns:
                    table_headers.append(col[1])
                db.close()
                return table_headers
            except Exception as e:
                print(e)
                db.close()
                return "Some error happened, cannot get the information of tables in this database"
    
    def getQueryResult(self,query):
        db = self.connectDB()
        if db:
            cur = db.cursor()
            try:
                cur.execute(query)
                columns = [description[0] for description in cur.description]
                result = (cur.fetchall())
                finalRes = []
                finalRes.append(columns)
                for r in result:
                    finalRes.append(list(r))
                
                return finalRes
            except Exception as e:
                db.close()
                return "ERROR"