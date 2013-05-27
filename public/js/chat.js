(function($,CHAT,undefined){   
	window.onload = function() {
		var messages = [];
		var socket = io.connect('http://localhost:8080');
		/** Receive Messages **/
		socket.on('message', function (data) {
			if(data.message) {				
				console.log(message);
				$('#messages').prepend(data.message);
			} else {
				console.log("There is a problem:", data);
			}
		});

		/** Send Messages **/
		$(document).on('submit','#message',function(e){
			var $this = $(this);
			var message = '<div><img src="'+CHAT.user.data.picture+'" style="float:left;margin-right:10px;" /><strong>'+CHAT.user.data.name+":</strong>"+$('#user_text').val()+'<div style="clear:both"></div></div>';
			socket.emit('send', { message: message });
			$('#user_text').val('');
			return e.preventDefault();
		})
	};
})(window.jQuery,window.CHAT);