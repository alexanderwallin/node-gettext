
var Iconv = require("iconv").Iconv,
    vm = require('vm'),
    util = require("util");

var buftools = require("./buffer-helpers");

function GettextDomain(textdomain){
    this.textdomain = textdomain;
    this.checkMagick();
    
    this.revision = buftools.bufferReadint(this.textdomain, this.byteorder);
    this.total = buftools.bufferReadint(this.textdomain, this.byteorder);
    this.originals = buftools.bufferReadint(this.textdomain, this.byteorder);
    this.translations = buftools.bufferReadint(this.textdomain, this.byteorder);
    
    this.table_originals = [];
    this.table_translations = [];
    this.cache = [];
    
    this.charset = "iso-8859-1";
    this.headers = false;

    this.iconv = {
        convert: function(data){
            return data;
        }
    }

    if(this.total){
        this.load_tables();
    }
}

GettextDomain.bigMagic = [0x95, 0x04, 0x12, 0xde];
GettextDomain.littleMagic = [0xde, 0x12, 0x04, 0x95];

GettextDomain.prototype.checkMagick = function(){
    var magic = buftools.bufferRead(this.textdomain, 4);
    if(buftools.bufferEquals(magic, GettextDomain.bigMagic)){
        this.byteorder = ">i";
    }else if(buftools.bufferEquals(magic, GettextDomain.littleMagic)){
        this.byteorder = "<i";
    }else{
        throw new Error("Invalid magic!");
    }
}

GettextDomain.prototype.load_tables = function(){
    var original, translation;
    
    // get originals
    buftools.bufferSeek(this.textdomain, this.originals);
    for(var i=0; i<this.total; i++){
        this.table_originals.push([buftools.bufferReadint(this.textdomain, this.byteorder), buftools.bufferReadint(this.textdomain, this.byteorder)]);
    }
    
    // get translations
    buftools.bufferSeek(this.textdomain, this.translations);
    for(var i=0; i<this.total; i++){
        this.table_translations.push([buftools.bufferReadint(this.textdomain, this.byteorder), buftools.bufferReadint(this.textdomain, this.byteorder)]);
    }
    
    // cache strings
    for(var i=0; i<this.total; i++){
        buftools.bufferSeek(this.textdomain, this.table_originals[i][1]);
        original = buftools.bufferRead(this.textdomain, this.table_originals[i][0]);
        
        buftools.bufferSeek(this.textdomain, this.table_translations[i][1]);
        translation = buftools.bufferRead(this.textdomain, this.table_translations[i][0]);
        
        this.handle_strings(original, translation);
    }

}

GettextDomain.prototype.handle_strings = function(original, translation){
    var o, t, c, oparts, tparts;
    if(!original.length){
        this.parseHeaders(translation);
        this.parsePluralHeader();
        // probably should look other header fields too
    }else{
        o = this.iconv.convert(original).toString("utf-8");
        t = this.iconv.convert(translation).toString("utf-8");
        
        // get context
        oparts = o.split("\u0004");
        c = oparts.length>1 ? oparts.shift() : "default";
        o = oparts.join("\u0004");
        if(!this.cache[c]){
            this.cache[c] = {};
        }
        
        // find plurals
        
        // keep only the first of source
        oparts = o.split("\u0000");
        o = oparts.shift();
        
        // keep all from translation
        tparts = t.split("\u0000");
        
        this.cache[c][o] = tparts;
    }
}

GettextDomain.prototype.parseHeaders = function(data){
    var headers = {}, charset, iconv;
    
    if(this.charset != "utf-8"){
        this.iconv = new Iconv(this.charset, 'UTF-8');
        data = this.iconv.convert(data);
    }else{
        this.iconv = {
            convert: function(data){
                return data;
            }
        }
    }
    
    data.toString("utf-8").trim().split("\n").forEach(function(row){
        var parts = row.split(":");
        headers[parts.shift().trim().toLowerCase()] = parts.join(":").trim();
    });
    
    if(headers["content-type"]){
        if(charset = headers["content-type"].match(/charset\s*=([^;]*)/i) || false){
            charset = charset[1].toLowerCase();
        }
    }
    
    charset = charset || "iso-8859-1";
    
    // if charset changed start over (might include charset dependent characters)
    if(charset != this.charset){
        this.charset = charset;
        return this.parseHeaders(data);
    }
    
    this.headers = headers;
}

GettextDomain.prototype.parsePluralHeader = function(){
    var parts, nr, sentence;
    if(!this.headers['plural-forms'])return;
    
    parts = this.headers['plural-forms'].split(";");
    
    nr = parts.shift() || "";
    if(nr = nr.match(/nplurals\s*=\s*(\d+)/i) || false){
        nr = Number(nr[1]);
    }
    nr = Math.abs(nr || 1);
    
    sentence = (parts.shift() || "").trim().replace(/^plural\s*=s*/,'') || "0";
    
    if(nr<=1 || sentence == "0"){
        return;
    }
    
    var script;
    try{
        script = vm.createScript("plural = " + sentence);
    }catch(E){
        script = vm.createScript("plural = 0");
    }
    
    // generate plural detector
    this.get_plural = function(n){
        var sandbox = {n:n, plural:0}
        try{
            script.runInNewContext(sandbox);
            return Number(sandbox.plural);
        }catch(E){
            return 0;
        }
    }
}

GettextDomain.prototype.get_plural = function(n){
    return 0;
}


/** PUBLIC METHODS **/

GettextDomain.prototype.gettext = function(msgid){
    if(!this.cache["default"]){
        return msgid;
    }
    return this.cache["default"][msgid] && this.cache["default"][msgid][0] || msgid;
}

GettextDomain.prototype.ngettext = function(msgid, msgid_plural, count){
    var n;
    if(this.cache["default"] && this.cache["default"][msgid]){
        n = this.get_plural(count);
        return this.cache["default"][msgid][n] || this.cache["default"][msgid][0];
    }else{
        return count!=1 ? msgid_plural : msgid;
    }
}

GettextDomain.prototype.pgettext = function(msgctxt, msgid){
    if(!this.cache[msgctxt]){
        return msgid;
    }
    return this.cache[msgctxt][msgid] && this.cache[msgctxt][msgid][0] || msgid;
}

GettextDomain.prototype.npgettext = function(msgctxt, msgid, msgid_plural, count){
    var n;
    if(this.cache[msgctxt] && this.cache[msgctxt][msgid]){
        n = this.get_plural(count);
        return this.cache[msgctxt][msgid][n] || this.cache[msgctxt][msgid][0];
    }else{
        return count!=1 ? msgid_plural : msgid;
    }
}

function Gettext(){
    this.current_textdomain = false;
    this.domains = {};
}

Gettext.prototype.addTextdomain = function(domain, data){
    this.domains[domain] = new GettextDomain(data);
}

Gettext.prototype.textdomain = function(domain){
    if(this.domains[domain]){
        this.current_textdomain = this.domains[domain];
    }else{
        this.current_textdomain = false;
    }
}

Gettext.prototype.gettext = function(msgid){
    if(this.current_textdomain){
        return this.current_textdomain.gettext(msgid);
    }else{
        return msgid;
    }
}

Gettext.prototype.dgettext = function(domain, msgid){
    if(this.domains[domain]){
        return this.domains[domain].gettext(msgid);
    }else{
        return msgid;
    }
}

Gettext.prototype.ngettext = function(msgid, msgid_plural, count){
    if(this.current_textdomain){
        return this.current_textdomain.ngettext(msgid, msgid_plural, count);
    }else{
        return count==1?msgid:msgid_plural;
    }
}

Gettext.prototype.dngettext = function(domain, msgid, msgid_plural, count){
    if(this.domains[domain]){
        return this.domains[domain].ngettext(msgid, msgid_plural, count);
    }else{
        return count==1?msgid:msgid_plural;
    }
}


Gettext.prototype.pgettext = function(msgctxt, msgid){
    if(this.current_textdomain){
        return this.current_textdomain.pgettext(msgctxt, msgid);
    }else{
        return msgid;
    }
}

Gettext.prototype.dpgettext = function(domain, msgctxt, msgid){
    if(this.domains[domain]){
        return this.domains[domain].dpgettext(msgctxt, msgid);
    }else{
        return msgid;
    }
}


Gettext.prototype.npgettext = function(msgctxt, msgid, msgid_plural, count){
    if(this.current_textdomain){
        return this.current_textdomain.npgettext(msgctxt, msgid, msgid_plural, count);
    }else{
        return count==1?msgid:msgid_plural;
    }
}

Gettext.prototype.dnpgettext = function(domain, msgctxt, msgid, msgid_plural, count){
    if(this.domains[domain]){
        return this.domains[domain].dnpgettext(msgctxt, msgid, msgid_plural, count);
    }else{
        return count==1?msgid:msgid_plural;
    }
}

module.exports = Gettext;    