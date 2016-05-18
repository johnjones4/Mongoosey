var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var mongoosey = require('./index');

var schema = new mongoose.Schema({
  'created': {
    'type': Date,
    'default': Date.now
  },
  'modified': {
    'type': Date,
    'default': Date.now
  },
  'email': {
    'type': String,
    'index': {
      'unique': true
    }
  },
  'active': {
    'type': Boolean,
    'default': true
  }
});

schema.methods.getDescription = function() {
  return this.email ? this.email : this._id;
}

schema.pre('save', function(next) {
  this.modified = new Date();
  next();
});

var User = mongoose.model('User',schema);

mongoose.connect('mongodb://localhost/mongooseyDemo');

var app = express();
app.use(bodyParser.urlencoded({
  extended:true
}));

mongoosey.set('app',app);
mongoosey.set('mongoose',mongoose);

app.listen(8000,function() {
  console.log('Server running.');
});
