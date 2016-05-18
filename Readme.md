# Mongoosey

This is a simple Mongoose frontend that can be built into a pre-existing Express application.

## Installation and Usage

To add Mongoosey to a project, first install the npm package:

```
# npm install --save mongoosey
```

Then, pass your express app to Mongoosey:

```
var mongoosey = require('mongoosey');
mongoosey.set('app',app);
```

After that, Mongoosey will setup routes under `/db` to manage all defined Mongoose schemas. For instance, if there is a model named _User_, Mongoosey will setup the following pages to manage it:

* **/db/User** - Lists all MongoDB documents in the collection associated with that model
* **/db/User/new** - Creates a new instance of that model for editing
* **/db/User/<ObjectId>** - Displays the object with that ObjectId for editing

To add a layer of security, simply add another route handler similar to Connect app:

```
mongoosey.use(function(req,res,next) {
  // Authorization logic via HTTP authentication or session validation ...
});
```
