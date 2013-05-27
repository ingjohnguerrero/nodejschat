var express = require("express")
, passport = require('passport')
, util = require('util')
, TwitterStrategy = require('passport-twitter').Strategy;;
var app = express();
var port = 8080;
/** Twitter app info**/
var TWITTER_CONSUMER_KEY = "2bMaPEq1u9AxcJ3ewbTXQ";
var TWITTER_CONSUMER_SECRET = "R01QZfTngTv2144C6xDCzzbSp2HhvpF3lUivGdcKs";
/** Informing Express about the public folder**/
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
/** Use body parser **/
app.use(express.bodyParser());
/** User Session data **/
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'SociedadAPISecrectKey' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
/** Setting Socket.io var **/
var io = require('socket.io').listen(app.listen(port));
app.get("/", function(req, res){
	res.render("sociedad/index.ejs");
});
/** Twitter passoort **/
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Twitter profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});
// Use the TwitterStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Twitter profile), and
//   invoke a callback with a user object.
passport.use(new TwitterStrategy({
	consumerKey: TWITTER_CONSUMER_KEY,
	consumerSecret: TWITTER_CONSUMER_SECRET,
	callbackURL: "http://127.0.0.1:8080/auth/twitter/callback"
},
function(token, tokenSecret, profile, done) {
    
}
));
// GET /auth/twitter
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Twitter authentication will involve redirecting
//   the user to twitter.com.  After authorization, the Twitter will redirect
//   the user back to this application at /auth/twitter/callback
app.get('/auth/twitter',
	passport.authenticate('twitter'),
	function(req, res){
    // The request will be redirected to Twitter for authentication, so this
    // function will not be called.
});

// GET /auth/twitter/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/twitter/callback', 
	passport.authenticate('twitter', { successRedirect: '/',
                                       failureRedirect: '/' })
	);

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

/** On conection of a client it will emit a message **/
io.sockets.on('connection', function (socket) {
	socket.on('send', function (data) {
		io.sockets.emit('message', data);
	});
});