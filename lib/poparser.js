var Iconv = require("iconv").Iconv;

module.exports = POParser;

/**
 * Creates a parser for parsing a PO file
 * 
 * @constructor
 * @param {Buffer} fileContents PO file contents as a Buffer 
 */
function POParser(fileContents){
    this._fileContents = fileContents || new Buffer(0);
    
    this._charset = false; // default charset
    
    this._detectCharset();
    
    if(this._charset != "utf-8"){
        this._iconv = new Iconv(this._charset, "UTF-8//TRANSLIT//IGNORE");
        this._fileContents = this._iconv.convert((this._fileContents || "")).toString("utf-8");
    }else{
        this._fileContents = (this._fileContents || "").toString();
    }
}

/**
 * Detects the charset for current PO file and if needed (not utf-8) converts it.
 * Uses the first msgstr value as the header.
 */
POParser.prototype._detectCharset = function(){
    var str = (this._fileContents || "").toString(),
        pos, headers = str, charset = "iso-8859-1", match;
    
    if((pos = str.search(/^\s*msgid/im))>=0){
        if((pos = pos+str.substr(pos+5).search(/^\s*(msgid|msgctxt)/im))){
            headers = str.substr(0, pos);
        }
    }
    
    if((match = headers.match(/[; ]charset\s*=\s*([\w\-]+)(?:[\s;]|\\n)*"\s*$/mi))){
        charset = (match[1] || "iso-8859-1").toString().
                    replace(/^utf(\d+)$/i, "utf-$1").
                    toLowerCase().trim();
    }
    
    this._charset = charset;
};

/**
 * State constants for parsing FSM
 */
POParser.prototype.states = {
    none: 0x01,
    comments: 0x02,
    key: 0x03,
    string: 0x04
};

/**
 * Value types for lexer
 */
POParser.prototype.types = {
    comments: 0x01,
    key: 0x02,
    string: 0x03
};

/**
 * String matches for lexer
 */
POParser.prototype.symbols = {
    quotes: /['"]/,
    comments: /\#/,
    whitespace: /\s/,
    key: /[\w\-\[\]]/
};

/**
 * Lexer for tokenizing the input PO file into a stream of typed tokens
 * 
 * @return {Array} Array of typed tokens
 */
POParser.prototype._lexer = function(){
    var chr,
        escaped = false,
        lex = [],
        node,
        state = this.states.none;
    
    for(var i=0, len = this._fileContents.length; i<len; i++){
        chr = this._fileContents.charAt(i);
        switch(state){
            case this.states.none:
                if(chr.match(this.symbols.quotes)){
                    node = {
                        type: this.types.string,
                        value: "",
                        quote: chr
                    };
                    lex.push(node);
                    state = this.states.string;
                }else if(chr.match(this.symbols.comments)){
                    node = {
                        type: this.types.comments,
                        value: ""
                    };
                    lex.push(node);
                    state = this.states.comments;
                }else if(!chr.match(this.symbols.whitespace)){
                    node = {
                        type: this.types.key,
                        value: chr
                    };
                    lex.push(node);
                    state = this.states.key;
                }
                break;
            case this.states.comments:
                if(chr == "\n"){
                    state = this.states.none;
                }else if(chr != "\r"){
                    node.value += chr;
                }
                break;
            case this.states.string:
                if(escaped){
                    if(chr == "n"){
                        node.value += "\n";
                    }else if(chr == "r"){
                        node.value += "\r";
                    }else if(chr == "t"){
                        node.value += "\t";
                    }else{
                        node.value += chr;
                    }
                    escaped = false;
                }else{
                    if(chr == node.quote){
                        state = this.states.none;
                    }else if(chr == "\\"){
                        escaped = true;
                        break;
                    }else{
                        node.value += chr;
                    }
                    escaped = false;
                }
                break;
            case this.states.key:
                if(!chr.match(this.symbols.key)){
                    state = this.states.none;
                    i--;
                }else{
                    node.value += chr;
                }
                break;
        }
    }
        
    return lex;
};

/**
 * Parses a PO file and returns an array of structured {msgid, msgcntx, msgstr}
 * objects
 * 
 * @return {Array} An array of translations
 */
POParser.prototype.parse = function(){
    var lex = this._lexer(),
        response = [], lastNode, curContext, curComments;
    
    // join strings and comments
    for(var i=0, len = lex.length; i<len; i++){
        if(lastNode && lex[i].type == this.types.string && lastNode.type == this.types.string){
            lastNode.value += lex[i].value;
        }else if(lastNode && lex[i].type == this.types.comments && lastNode.type == this.types.comments){
            lastNode.value += "\n" + lex[i].value;
        }else{
            response.push(lex[i]);
            lastNode = lex[i];
        }
    }
    
    // parse comments
    lex.forEach((function(node){
        var comment, lines;

        if(node && node.type == this.types.comments){
            comment = {code: [], comment: [], note: []};
            lines = (node.value || "").split(/\n/);
            lines.forEach(function(line){
                switch(line.charAt(0) || ""){
                    case ":": 
                        comment.code.push(line.substr(1).trim());
                        break;
                    case ".": 
                        comment.note.push(line.substr(1).replace(/^\s+/, ""));
                        break;
                    default: 
                        comment.comment.push(line.replace(/^\s+/, ""));
                }
            });

            node.value = {};

            if(comment.comment.length){
                node.value.comment = comment.comment.join("\n");
            }

            if(comment.note.length){
                node.value.note = comment.note.join("\n");
            }

            if(comment.code.length){
                node.value.code = comment.code.join("\n");
            }
        }
    }).bind(this));

    lex = response;
    response = [];
    lastNode = false;
    
    // match keys with values
    for(var i=0, len = lex.length; i<len; i++){
        if(lex[i].type == this.types.key){
            lastNode = {
                key: lex[i].value
            };
            if(i && lex[i-1].type == this.types.comments){
                lastNode.comments = lex[i-1].value;
            }
            lastNode.value = "";
            response.push(lastNode);
        }else if(lex[i].type == this.types.string && lastNode){
            lastNode.value += lex[i].value;
        }
    }
    
    lex = response;
    response = [];
    lastNode = false;

    // group originals with translations and context
    for(var i=0, len = lex.length; i<len; i++){
        if(lex[i].key.toLowerCase() == "msgctxt"){
            curContext = lex[i].value;
            curComments = lex[i].comments;
        }else if(lex[i].key.toLowerCase() == "msgid"){
            lastNode = {
                msgid: lex[i].value
            };
            
            if(curContext){
                lastNode.msgctxt = curContext;
            }
            
            if(curComments){
                lastNode.comments = curComments;
            }
            
            if(lex[i].comments && !lastNode.comments){
                lastNode.comments = lex[i].comments;
            }
            
            curContext = false;
            curComments = false;
            response.push(lastNode);
        }else if(lex[i].key.substr(0, 6).toLowerCase() == "msgstr"){
            if(lastNode){
                lastNode.msgstr = (lastNode.msgstr || []).concat(lex[i].value);
            }
            
            if(lex[i].comments && !lastNode.comments){
                lastNode.comments = lex[i].comments;
            }
            
            curContext = false;
            curComments = false;
        }
    }

    return response;
}