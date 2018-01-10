var express = require('express');
var passport = require('passport');
var Gpio = require('onoff').Gpio;
var iopi = require('../node_modules/iopi/iopi');
var sleep = require('sleep');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
var path = require('path');
var app = express();

var server    =app.listen(80);
var io        = require('socket.io').listen(server);

var read_bus_1 = new IoPi(0x20);//board 1
var write_bus_1 = new IoPi(0x21);//board 1
var read_bus_2 = new IoPi(0x22);//board 2
var write_bus_2 = new IoPi(0x23);//board 2

read_bus_1.setPortDirection(0, 0xFF);//read bus 1,port0 = input
read_bus_1.setPortDirection(1, 0xFF);//read bus 1,port1 = input
read_bus_2.setPortDirection(0, 0xFF);//read bus 2,port0 = input
read_bus_2.setPortDirection(1, 0xFF);//read bus 2,port1 = input

read_bus_1.setPortPullups(0, 0x00);
read_bus_1.setPortPullups(1, 0x00);
read_bus_2.setPortPullups(0, 0x00);
read_bus_2.setPortPullups(1, 0x00);

write_bus_1.setPortDirection(0, 0x00);//write bus 1,port0 = output
write_bus_1.setPortDirection(1, 0x00);//write bus 1,port1 = output
write_bus_2.setPortDirection(0, 0x00);//write bus 2,port0 = output
write_bus_2.setPortDirection(1, 0x00);//write bus 2,port1 = output


passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));


passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Define routes.------------------------ROUTES--------------------------------------
app.get('/',
  function(req, res) {
    res.render('login', { user: req.user });
  });

app.get('/login',		//for fail logins
  function(req, res){
    res.render('login');
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/smarthome');
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/smarthome',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('smarthome', { user: req.user });
  });

//----------------------------------------------------------------------

io.on('connection', function(socket){
	socket.on('set_pin', function(msg){
		if (msg>=1 && msg<=16){
			write_bus_1.writePin(msg, 1);
			setTimeout(function fast(){
				//sleep.msleep(70);
				write_bus_1.writePin(msg, 0);
			},70);
		}
		else if (msg>16 && msg<=20){
			write_bus_2.writePin(msg-16, 1);
			setTimeout(function fast2(){
				write_bus_2.writePin(msg-16, 0);
			},70);
		}	
		else if (msg>20 && msg<=30){
			if (msg%2){ //entoles gia up
				if (!read_bus_2.readPin(msg-15)){	//tserkare epomeno pin an going down
					write_bus_2.writePin(msg-16, 1);
					//console.log("going up",read_bus_2.readPin(msg-15))
					setTimeout(function slow(){
						write_bus_2.writePin(msg-16, 0);
					},7000);
				}
			}
			else{   //entoles gia gown
				if (!read_bus_2.readPin(msg-17)){ 	//tsek to proigoymeno pin an going up
					write_bus_2.writePin(msg-16, 1);
					//console.log("going down",read_bus_2.readPin(msg-17))
					setTimeout(function slow2(){
						write_bus_2.writePin(msg-16, 0);
					},7000);
				}
			}
			
		}	
		
		else if (msg===31){//21 up //22 down //23 up// 24 down
			if(!read_bus_2.readPin(6) && !read_bus_2.readPin(8) && !read_bus_2.readPin(10) && !read_bus_2.readPin(12) && !read_bus_2.readPin(14)){//if all down are false
				write_bus_2.writePin(5, 1); //5=21-16
				write_bus_2.writePin(7, 1);
				write_bus_2.writePin(9, 1);
				write_bus_2.writePin(11, 1);
				write_bus_2.writePin(13, 1);
				//console.log('set_pin: ' + msg);
				setTimeout(function slowallup(){
					write_bus_2.writePin(5, 0); //5=21-16
					write_bus_2.writePin(7, 0);
					write_bus_2.writePin(9, 0);
					write_bus_2.writePin(11, 0);
					write_bus_2.writePin(13, 0);
				},7000);
			}
		}	
		
		
		else if (msg===32){//21 up //22 down //23 up// 24 down
		if(!read_bus_2.readPin(5) && !read_bus_2.readPin(7) && !read_bus_2.readPin(9) && !read_bus_2.readPin(11) && !read_bus_2.readPin(13)){//if all down are false
				write_bus_2.writePin(6, 1);
				write_bus_2.writePin(8, 1);
				write_bus_2.writePin(10, 1);
				write_bus_2.writePin(12, 1);
				write_bus_2.writePin(14, 1);
				
				//console.log('set_pin: ' + msg);
				setTimeout(function slowalldown(){
					write_bus_2.writePin(6, 0);
					write_bus_2.writePin(8, 0);
					write_bus_2.writePin(10, 0);
					write_bus_2.writePin(12, 0);
					write_bus_2.writePin(14, 0);
				},7000);
			}	
		}
	});
});

setInterval(function(){
	//console.log(Object.keys(io.sockets.connected).length);
	
	if (Object.keys(io.sockets.connected).length){
	//console.log("good");
	//}
	
		var read_values = []; 
	
		for (var j = 1; j<=16;j++){
			read_values.push(read_bus_1.readPin(j)); // add at the end 
		}
		for (var k = 17; k<=20;k++){
			read_values.push(read_bus_2.readPin(k-16)); // add at the end 
		}//eos kai 20
		for (var l = 21; l<=30;l=l+2){
			if (read_bus_2.readPin(l-16)){		
				read_values.push('up');
			}
			else if (read_bus_2.readPin(l-15)){
				read_values.push('down');
			}
			else {
				read_values.push('stop');
			}
		}
		//console.log('flags ' + read_values);
		io.emit('pin_status', read_values);
	}
}, 1200);