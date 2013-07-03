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
			for(x in data){
				var datos = data[x];
				var html = "<tr><td>";
				html += datos.content;
				date = $.format.date(datos.datetime, "hh-mm a");
				html += '<div style="float:right">'+date+'</div><div style="clear:both"></div>';
				html += "</td></tr>";
				$('#messages').append(html);
			}
		});

		/** Send Messages **/
		$(document).on('submit','#message',function(e){
			var $this = $(this);
			var message = '<div style="float:left"><img src="'+CHAT.user.data.picture+'" style="float:left;margin-right:10px;" /><strong>'+CHAT.user.data.name+":</strong> "+$('#user_text').val()+'<div style="clear:both"></div></div>';
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
