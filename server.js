const app = require('express')();
const indexRouter = require('./api/routes/index');
const AppRouter = require('./api/routes/app');

var port = process.env.PORT || 3000,
    bodyParser = require('body-parser');
//  Connect all our routes to our application
app.use('/', indexRouter);
app.use('/', AppRouter);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Turn on that server!
app.listen(port, () => {
  console.log('App listening on port '+ port);
});
