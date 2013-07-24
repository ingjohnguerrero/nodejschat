(function($,CHAT,undefined){
	window.onload = function() {
		$('.mesagges_container').css('height',$(window).height()-70);
		var messages = [];
		var socket = io.connect('http://localhost:8080');
		/** obtener Mensajes de historial **/
		socket.emit('getHistory');
		/** Receive Messages **/
		socket.on('message', function (data) {
			$('#messages').empty();
		});
		/** Send Messages **/
		$(document).on('submit','#message',function(e){
			var $this = $(this);
			var message = {'picture':CHAT.user.picture,'User':CHAT.user.name,'Message':$('#user_text').val()}
			socket.emit('send', { message: message });
			$('#user_text').val('');
			return false;
		});
		$(window).on('resize',function(){
			$('.mesagges_container').css('height',$(window).height()-70);
		});
		$(window).resize();
	};
})(window.jQuery,window.CHAT);
