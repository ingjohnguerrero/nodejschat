window.CHAT = {app_name:"chat",user:{data:{name:null}},picture:null};
(function($,CHAT,undefined){   
	window.onload = function() {
		/** Codebird **/
		$('#loading-div').show();
		FB.init({
			appId      : '116780783292',
			status     : true, 
			cookie     : true, 
			xfbml      : true  
		});
		if(true === CHAT.statusLog){
			$('#LoginFrame').hide();
			$('#ChatFrame').show();
		}else{
			CHAT.provider = null;
			$('#LoginFrame').show();
			$('#ChatFrame').hide();
		}
		$('#loading-div').hide();
		var messages = [];
		var socket = io.connect('http://localhost:8080');
		/** Receive Messages **/
		var content = document.getElementById("messages");

		socket.on('message', function (data) {
			if(data.message) {
				messages.push(data);
				var html = '';
				for(var i=0; i<messages.length; i++) {
					html += messages[i].message;
				}
				content.innerHTML = html;
			} else {
				console.log("There is a problem:", data);
			}
		});

		/** Send Messages **/
		$(document).on('submit','#message',function(e){
			if(true === CHAT.statusLog){
				var $this = $(this);
				var message = '<div><img src="'+CHAT.user.picture+'" style="float:left;margin-right:10px;" /><strong>'+CHAT.user.data.name+":</strong>"+$('#user_text').val()+'<div style="clear:both"></div></div>';
				socket.emit('send', { message: message });
			}
			return e.preventDefault();
		})
	};
	/** Get Facebook login status **/
	CHAT.loginStatusFacebook = function(){
		FB.getLoginStatus(function(response) {
			if(response.status === 'connected'){
				CHAT.statusLog = true;
			} else if (response.status === 'not_authorized') {
				CHAT.statusLog = false;
			} else {
				CHAT.statusLog = false;
			}
		});
	};
	/** Set user info based on facebook API **/
	CHAT.setFacebookInfo = function(){
		FB.api('/me', function(response) {
			CHAT.user.data.name = response.first_name;
		});
		FB.api("/me/picture?width=50&height=50",  function(response) {
			CHAT.user.picture = response.data.url;
		});
	};
	/** Do a facebook Login **/
	CHAT.facebookLogin = function(){
		FB.login(function(response) {
			if (response.authResponse) {
				CHAT.setFacebookInfo();
				CHAT.statusLog = true;
				$('#LoginFrame').hide();
				$('#ChatFrame').show();
				CHAT.provider = 'facebook';
			}else{
				alert('Error Login in with facebook');
			}
		}, {
			scope:'email,user_birthday,user_about_me'
		});
	};
	/** Triguer the facebook login **/
	$(document).on('click','.facebookIcon',function(){
		CHAT.facebookLogin();
	});

	$(document).on('click','.twitterIcon',function(){
		
	});

})(window.jQuery,window.CHAT);