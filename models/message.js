var mongoose = require('mongoose'),
    request = require('request'),
    qs = require('querystring');
/* Recoje datos del mensaje para un schema en mongoose
Contenido, fecha, publicacion, ip */
var messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  datetime: { type: Date, 'default': Date.now },
  activado: { type: Boolean, 'default': true }
});
/** Get messages **/
messageSchema.methods.get_content = function () {
    var text = this.content;
    // Ataques
    text = text.replace(/&(?!\s)|</g, function (s) { if(s == '&') return '&amp;'; else return '&lt;'; });
    // links
    text = text.replace(/https?:\/\/(\S+)/, '');
    // emoticons
    text = text.replace(/(:\)|:8|:D|:\(|:O|:P|:cool:|:'\(|:\|)/g, '<span title="$1" class="emoticon"></span>');
    return text;
};
messageSchema.post('save', function (message) {
    if(message.publish) {

    }
});
/* Guarda el mensaje */
mongoose.model('Message', messageSchema);