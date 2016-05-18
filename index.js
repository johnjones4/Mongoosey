var routes = require('./lib/routes');

routes.filepathBase = __dirname;

var app;
var mongoose;
var handlers = [
  function(req,res,next) {
    req.models = mongoose.modelNames();
    next();
  },
  function(req,res,next) {
    if (req.params.model) {
      var Model = mongoose.model(req.params.model);
      if (Model) {
        req.Model = Model;
        next();
      } else {
        res.sendStatus(404);
      }
    } else {
      next();
    }
  },
  function(req,res,next) {
    if (req.Model && req.params.id) {
      req.Model.findOne(req.params.id,function(err,object) {
        if (err) {
          next(err);
        } else if (object) {
          req.object = object;
          next();
        } else {
          res.sendStatus(404);
        }
      })
    } else {
      next();
    }
  }
];

exports.set = function(key,value) {
  switch(key) {
    case 'app':
      app = value;
      exports.buildConfiguration();
      break;
    case 'render':
      routes.render = value;
      break;
    case 'mongoose':
      mongoose = value;
      break;
  }
}

exports.use = function(handler) {
  handlers.push(handler);
}

exports.buildConfiguration = function() {
  if (app) {
    app.get('/db',handlers,routes.index);
    app.get('/db/static/:file',handlers,routes.static);
    app.get('/db/:model',handlers,routes.list);
    app.get('/db/:model/new',handlers,routes.create);
    app.get('/db/:model/:id',handlers,routes.display);
    app.post('/db/:model/new',handlers,routes.saveNew);
    app.post('/db/:model/:id',handlers,routes.save);
  }
}
