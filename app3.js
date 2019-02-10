const mongoose = require("mongoose");
const express = require("express");
const Schema = mongoose.Schema;
const app = express();
const jsonParser = express.json();
 
const userScheme = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  }
});

userScheme.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

userScheme.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hash = this.encryptPassword(password);
  })
  .get(function() { return this._plainPassword; });


userScheme.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hash;
};

const User = mongoose.model("User", userScheme);
 
app.use(express.static(__dirname));
 
mongoose.connect("mongodb://localhost:27017/usersdb", { useNewUrlParser: true }, function(err){
    if(err) return console.log(err);
    app.listen(3000, function(){
        console.log("Connected...");
    });
});
  
app.get("/api/users", function(req, res){
        
    User.find({}, function(err, users){
 
        if(err) return console.log(err);
        res.send(users)
    });
});
 
app.get("/api/users/:id", function(req, res){
         
    const id = req.params.id;
    User.findOne({_id: id}, function(err, user){
          
        if(err) return console.log(err);
        res.send(user);
    });
});
    
app.post("/api/users", jsonParser, function (req, res) {
        
    if(!req.body) return res.sendStatus(400);
        
    const userName = req.body.name;
    const userHash = req.body.hash;
    const userSalt = req.body.salt;
    const userPassword = this._plainPassword;
    const user = new User({name: userName, hash: userHash, salt: userSalt, password: userPassword});
        
    user.save(function(err){
        if(err) return console.log(err);
        res.send(user);
    });
});
     
app.delete("/api/users/:id", function(req, res){
         
    const id = req.params.id;
    User.findByIdAndDelete(id, function(err, user){
                
        if(err) return console.log(err);
        res.send(user);
    });
});
    
app.put("/api/users", jsonParser, function(req, res){
         
    if(!req.body) return res.sendStatus(400);
    const id = req.body.id;
    const userName = req.body.name;
    const userHash = req.body.hash;
    const userSalt = req.body.salt;
    const userPassword = this._plainPassword;
    const newUser = {name: userName, hash: userHash, salt: userSalt, password: userPassword};
     
    User.findOneAndUpdate({_id: id}, newUser, {new: true}, function(err, user){
        if(err) return console.log(err); 
        res.send(user);
    });
});