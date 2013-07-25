(function($,CHAT,undefined){
	window.onload = function() {
		$('.mesagges_container').css('height',$(window).height()-70);
		var messages = [];
		var socket = io.connect('http://sociedadelectrochat.aws.af.cm');
		/** obtener Mensajes de historial **/
		socket.emit('getHistory');
		/** Receive Messages **/
		socket.on('message', function (data) {
			$('#messages').empty();
			for(x in data){
				var datos = data[x];
				var date_msj = moment(datos.datetime).zone("-05:00").format();
				var timeago = $.timeago(date_msj);
				var text = '<tr id="'+datos._id+'"><td>'+datos.content+'<span class="timeago">'+timeago+'</span></td></tr>';
				$('#messages').prepend(text);
			}
			$("#mesagges_container").animate({ scrollTop: $("#mesagges_container").prop("scrollHeight") - $('#mesagges_container').height() }, 1);
		});
		/** on typing **/
		socket.on('typing',function(data){
			if(data.user != CHAT.user.name){
				$('.typing').empty();
				$('.typing').html(data.user);
				$('#typing').show();
				setTimeout(function(){
					$('#typing').hide();	
				},1000)
			}
		})
		/** Send Messages **/
		$(document).on('submit','#message',function(e){
			var $this = $(this);
			var message = '<div style="float:left"><img src="'+CHAT.user.picture+'" style="float:left;margin-right:10px;" /><strong>'+CHAT.user.name+':</strong> '+$('#user_text').val()+'<div style="clear:both"></div></div>';
			socket.emit('send', { message: message });
			$('#user_text').val('');
			return false;
		});
		/** set the writing now **/
		$(document).keypress('#user_text',function(){
			socket.emit('typing',{user: CHAT.user.name});
		});
		$(window).on('resize',function(){
			$('.mesagges_container').css('height',$(window).height()-70);
		});
		$(window).resize();
	};
})(window.jQuery,window.CHAT);
