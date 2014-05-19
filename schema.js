// var localdatabase = postgres://username:password@host/database

var pg = require('pg').native
  , connectionString = process.env.DATABASE_URL
  , client
  , query;

client = new pg.Client(connectionString);
client.connect();
query = client.query('CREATE TABLE locations (lat FLOAT, lon FLOAT, monster TEXT)');
query.on('end', function(result) { client.end(); });
