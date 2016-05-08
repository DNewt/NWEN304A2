var express = require('express'); 
var app = express(); 
var port = process.env.PORT || 8080; 
var path = require("path");
var pg = require("pg").native;
var connectionString = "postgres://newtondavi2:dave@depot:5432/newtondavi2_nodejs"; 
var client = new pg.Client(connectionString); 
client.connect(); 

var bodyParser = require('body-parser')
app.use( bodyParser.json() ); // to support JSON­encoded bodies 
app.use(bodyParser.urlencoded({ // to support URL­encoded bodies 
extended: true 
}));  

//static files
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/fonts", express.static(__dirname + '/fonts'));

// //error handling for db
//     query.on('error', function () {
//         res.status(400).send({message: "fail to complete item"});
//     });
// //error handling for request



app.use(function(req, res, next) {
    if (req.headers.origin) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
        res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
        if (req.method === 'OPTIONS') return res.send(200)
    }
    next();
})

app.get('/', function(request, response){
    response.sendFile(path.join(__dirname+'/index.html'));
}); 

//Accessible at localhost:8080/get/tasks/ I use test_database instead
app.get('/get/tasks/', function (req, res) { 
res.send('This is a task.'); 
// Extend this later to return tasks from the database. 
});
 
app.listen(port, function () { 
console.log('Example app listening on port 8080!'); 
});

// Put an item in the database. 
app.put('/add/', function(req,res){
    req.on('error', function (err) {
        res.status(404, {message: "invalid request, could not add task"});
    });

    var query = client.query("insert into todo (item, iscomplete) values ('" + req.body.sendData + "', false)");
    res.send({ response: "OK, task added to the database"})
    query.on('end', function() { 
        res.status(401).end;
    }); 


}); 

// Delete an item in the database
app.delete('/delete', function(req,res){
    req.on('error', function (err) {
        res.status(404, {message: "invalid request, could not delete task"});
    });
    var query = client.query("DELETE FROM todo WHERE item = '" + req.body.task + "'");
	res.send({ response: "OK, task deleted from the database"})
    query.on('end', function() { 
        res.status(401).end;
    }); 

});

app.post('/switchToComplete', function(req,res){
    req.on('error', function (err) {
        res.status(404, {message: "invalid request, could not switch task to complete"});
    });
    
    var query = client.query("UPDATE todo SET iscomplete = true WHERE item = '" + req.body.taskName + "'");
    res.send({ response: "OK, switched task to complete"})
	query.on('end', function() { 
		res.status(401).end;
	}); 
});

app.post('/switchToIncomplete', function(req,res){
    req.on('error', function (err) {
        res.status(404, {message: "invalid request, could not switch task to incomplete"});
    });
    var query = client.query("UPDATE todo SET iscomplete = false WHERE item = '" + req.body.taskName + "'");
    res.send({ response: "OK, switched task to incomplete"})
	query.on('end', function() { 
		res.status(401).end;
	}); 
});

app.get('/test_database', function(request, response) { 
// SQL Query > Select Data 
var query = client.query("SELECT * FROM todo"); 
var results = [] 
// Stream results back one row at a time 
query.on('row', function(row) { 
results.push(row); 
}); 
console.log(results);

// After all data is returned, close connection and return results 
query.on('end', function() { 
response.json(results); 
}); 
}); 
