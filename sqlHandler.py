import re
import sqlite3
class SQLHandler:
    query = ''
    
    def __init__(self, query):
        self.query = query

    def isQuerySatisfied(self, dbConn):
        if dbConn:
            cur = dbConn.cursor()
            try:
                cur.execute(self.query)
                dbConn.close()
                return True
            except Exception as e:
                print('invalid')
                dbConn.close()
                return False
        else:
            dbConn.close()
            return False
    
    
    def separateQuery(self):
        # split query
        parts = re.split(r'(from|where|group by|having|select|order by|limit)', self.query, flags=re.IGNORECASE)
        # remove \n
        parts = [part.strip("\n") for part in parts if part.strip()]
        # create a sorted dictionary
        part_indices = {"from": None, "where": None, "group by": None, "having": None, "select": None, "order by": None, "limit": None}

        keys = part_indices.keys()
        for key in keys:
            index = 0
            for part in parts:
                if key == part:
                    part_indices[key] = parts[index+1]
                    break
                index+=1
        
        return part_indices   
