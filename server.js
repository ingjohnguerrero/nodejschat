/** Setting session Store variable **/
var mongoose = require('mongoose');
/** use appfog services for mongo **/
if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
    var mongo = {
    "hostname":"localhost",
    "port":27017,
    "username":"",
    "password":"",
    "name":"",
    "db":"chat"
    }
}
var generate_mongo_url = function(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'chat');
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
}
var mongourl = generate_mongo_url(mongo);
mongoose.connect(mongourl);
require('./models/message');
var express = require("express")
, util = require('util')
, Message = mongoose.model('Message');

/** passport for facebook & twitter **/
var passport = require('passport')
, FacebookStrategy = require('passport-facebook').Strategy
, TwitterStrategy = require('passport-twitter').Strategy;
/** Passport Use facebook **/
passport.use(new FacebookStrategy({
  clientID: '', // Here the customer key from facebook
  clientSecret: '', // Here the customer secret from facebook
  callbackURL: "http://sociedadelectrochat.aws.af.cm/auth/facebook/callback" // callbackURL
},
function(accessToken, refreshToken, profile, done) {
 var User = {
  id: profile.id,
  user_name : profile.displayName,
  avatar: 'https://graph.facebook.com/'+profile.username+'/picture'
}
done(null, User);
}
));
/** Passport use twitter **/
passport.use(new TwitterStrategy({
  consumerKey: '', // Here the customer key from twitter
  consumerSecret: '', // Here the customer secret from twitter
  callbackURL: "http://sociedadelectrochat.aws.af.cm/auth/twitter/callback" // callbackURL
},
function(token, tokenSecret, profile, done) {
  var User = {
    id: profile.id,
    user_name : profile.username,
    avatar: profile._json.profile_image_url_https
  }
  done(null, User);
}
));
var app = express();
var port = 80;
/** express-mongoose **/
require('express-mongoose');
require('datejs/lib/date-es-ES');
/** Informing Express about the public folder and views folder **/
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
/** HTML engine EJS **/
app.engine('html', require('ejs').renderFile);
/** Use body parser **/
app.use(express.bodyParser());
/** User Session data **/
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'SociedadAPISecrectKey'}));
/** Passport Middeware **/
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
/** Passport user session **/
passport.serializeUser(function(User, done) {
  done(null, User);
});
passport.deserializeUser(function(User, done) {
  done(null, User);
});
/** Setting Socket.io var **/
var io = require('socket.io').listen(app.listen(port));
io.set('transports', ['xhr-polling']);
/** ROUTES **/
app.get("/", function(req, res){
	res.render("index.ejs");
});
app.get("/chat_room", function(req, res){
	res.render("chatroom.ejs",{name:req.user.user_name,picture:req.user.avatar});
});
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
/** Route for facebook passport **/
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/chat_room',
    failureRedirect: '/' }));
/** Route for twitter passport **/
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/chat_room',
    failureRedirect: '/' }));

/** On conection of a client it will emit a message **/
io.sockets.on('connection', function (socket) {
  socket.on('getHistory',function(data){
    Message.find({}).sort({_id:-1}).limit(200).execFind(function(err,mensaje){
      io.sockets.emit('message', mensaje);
    });
  });
  socket.on('send', function (data) {
    var msj = new Message();
    msj.content = data.message;
    msj.save();
    Message.find({}).sort({_id:-1}).limit(200).execFind(function(err,mensaje){
      io.sockets.emit('message', mensaje);
    });
  });
});