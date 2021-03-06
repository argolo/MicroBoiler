var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var publish = require('./event/publish')
var subscribe = require('./event/consumer')
//& region (logging)
//& region (logging:morgan)
var logger = require('morgan');
//& end (logging:morgan)
//& end (logging)

//& region (database)
//& region (database:postgresql)
var entityTestRouter = require('./controllers/entitytest')
//& end (database:postgresql)

//& region (database:mysql)
var entityTestRouter = require('./controllers/entitytest')
//& end (database:mysql)

//& region (database:mongodb)
var mongoose = require('mongoose');
var entityRouter = require('./controllers/entity');
//& end (database:mongodb)
//& end (database)

var bodyParser = require('body-parser');

//& region (authorization)
var authtestRouter = require('./controllers/authtest');
//& end (authorization)

require('dotenv').config()
var environment = process.env.ENVIRONMENT;

var app = express();

app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//& region (database)
//& region (database:mongodb)
app.use('/entity', entityRouter);
//& end (database:mongodb)
//& region (database:postgresql)
app.use('/entity', entityTestRouter);
//& end (database:postgresql)
//& region (database:mysql)
app.use('/entity', entityTestRouter);
//& end (database:mysql)
//& end (database)

//& region (authorization)
app.use('/authtest', authtestRouter);
//& end (authorization)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 11000;        // set our port
port = 11000;
if (environment == 'development')
{
  //& region (database)
  //& region (database:mongodb)
  mongoose.connect('localhost')
  .then(()=>{
    console.log("Connected to mongodb")
  })
  .catch(err=> console.error.bind(console, err) );  
  //& end (database:mongodb)
  //& end (database)
}else{
  //& region (database)
  //& region (database:mongodb)
  mongoose.connect('{{mongoose_connection}}')
  .then(()=>{
    console.log("Connected to mongodb")
  })
  .catch(err=> console.error.bind(console, err) );  
  //& end (database:mongodb)
  //& end (database)
}

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // the error response
  res.status(err.status || 500);
  
  res.json({ message: 'Error!',err:err.message, status:err.status });
});

app.listen(port);
subscribe();
publish({message:"Nodejs App Connected To Eventbus"},'')
console.log('App Listening On Port:' + port);
console.log('App Environment => '+environment);
module.exports = app;
