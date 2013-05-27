/** Setting session Store variable **/
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat' );
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
    clientID: '116780783292',
    clientSecret: '6d0d64592936ac0279f4b84a0f776ea0',
    callbackURL: "http://sociedadchat.aws.af.cm/auth/facebook/callback"
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
    consumerKey: '2bMaPEq1u9AxcJ3ewbTXQ',
    consumerSecret: 'R01QZfTngTv2144C6xDCzzbSp2HhvpF3lUivGdcKs',
    callbackURL: "http://sociedadchat.aws.af.cm/auth/twitter/callback"
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
var port = 8080;
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
	socket.on('send', function (data) {
		io.sockets.emit('message', data);
	});
});