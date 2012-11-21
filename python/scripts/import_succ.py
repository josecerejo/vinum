import sys, codecs, re, os
sys.path.append('/home/christian/gh/little_pger')
from little_pger import *

conn = psycopg2.connect("dbname=vinum")
cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

with open('../../data/raw/succursales_saq.txt') as f:
    for line in f:
        parts = [p.strip() for p in line.split('|')]
        values = {'no_succursale': parts[0], 'adresse': parts[1], 'ville': parts[2].strip()}
        insert(cursor, 'succursale_saq', values=values)
        
conn.commit()
conn.close()
