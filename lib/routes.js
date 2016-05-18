var path = require('path');
var jade = require('jade');
var fs = require('fs');

var templates = {};
var statics = {};

exports.filepathBase = './';

exports.index = function(req,res,next) {
  res.send(exports.render('base',{
    'title': 'Database',
    'models': req.models,
    'currentModel': req.params.model
  }));
}

exports.list = function(req,res,next) {
  req.Model.find().exec(function(err,objects) {
    if (err) {
      next(err);
    } else {
      res.send(exports.render('list',{
        'title': 'Objects of Type ' + req.params.model,
        'models': req.models,
        'currentModel': req.params.model,
        'objects': objects.map(function(object) {
          return {
            '_id': object._id.toString(),
            'description': object.getDescription ? object.getDescription() : object._id,
            'url': '/db/' + req.params.model + '/' + object._id
          };
        })
      }));
    }
  });
}

exports.create = function(req,res,next) {
  req.object = new req.Model();
  exports.display(req,res,next);
}

exports.display = function(req,res,next) {
  var json = JSON.stringify(req.object.toObject());
  res.send(exports.render('edit',{
    'title': 'Edit ' + (req.object.getDescription ? req.object.getDescription() : req.object._id),
    'models': req.models,
    'currentModel': req.params.model,
    'json': json,
    'errors': req.errors
  }));
}

exports.saveNew = function(req,res,next) {
  req.object = new req.Model();
  exports.save(req,res,next);
}

exports.save = function(req,res,next) {
  var submitted = JSON.parse(req.body.json);
  delete submitted._id;
  delete submitted.__v;
  for(var property in submitted) {
    req.object[property] = submitted[property];
  }
  var errors = req.object.validateSync();
  if (errors) {
    var errorArray = [];
    for(var error in errors.errors) {
      errorArray.push(errors.errors[error].message);
    }
    req.errors = errorArray;
    exports.display(req,res,next);
  } else {
    req.object.save(function(err) {
      if (err) {
        next(err);
      } else {
        res.redirect('/db/' + req.params.model + '/' + req.object._id);
      }
    });
  }
}

exports.static = function(req,res,next) {
  function sendFile() {
    switch(path.extname(req.params.file)) {
      case '.svg':
        res.setHeader('Content-Type','image/svg+xml');
        break;
      case '.css':
        res.setHeader('Content-Type','text/css');
        break;
      case '.js':
        res.setHeader('Content-Type','text/javascript');
        break;
    }
    res.send(statics[req.params.file]);
  }
  if (req.params.file && ['jsoneditor-icons.svg','jsoneditor.min.css','jsoneditor.min.js'].indexOf(req.params.file) >= 0) {
    if (statics[req.params.file]) {
      sendFile();
    } else {
      fs.readFile(path.join(exports.filepathBase,'static',req.params.file),'utf8',function(err,content) {
        if (err) {
          next(err);
        } else if (content) {
          statics[req.params.file] = content;
          sendFile();
        } else {
          res.sendStatus(404);
        }
      });
    }
  } else {
    res.sendStatus(404);
  }
}

exports.render = function(template,data) {
  if (!templates[template]) {
    var fn = jade.compileFile(path.join(exports.filepathBase,'templates',template+'.jade'));
    if (!fn) {
      return;
    } else {
      templates[template] = fn;
    }
  }
  return templates[template](data);
}
