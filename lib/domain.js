var Iconv = require("iconv").Iconv,
    pluralsInfo = require("./plurals.json"),
    POParser = require("./poparser");

/*
 * TODO: msgid_plural is currently not used - why is it needed anyway?
 * TODO: comments from PO files are not used but should be
 */

// Expose to the world
module.exports = GettextDomain;

/**
 * Creates a textdomain object for a specific language
 * 
 * @constrctor
 * @param {Buffer} fileContents Binary file contents as a Buffer object
 */
function GettextDomain(domain, fileContents){
    
    this._domain = (domain || "").toString().toLowerCase().trim();
    
    /**
     * Keeps the file contents, dumped after usage
     */
    this._fileContents = fileContents;
    
    /**
     * Method name for writing int32 values, default littleendian
     */
    this._writeFunc = "writeUInt32LE";
    
    /**
     * Method name for reading int32 values, default littleendian
     */
    this._readFunc = "readUInt32LE";
    
    /**
     * Iconv conversion object
     */
    this._iconv = false;
    
    /**
     * Headers object, header keys are in lowercase
     */
    this.headers = {};
    
    /**
     * Table for keeping translations
     */
    this._translationTable = {};
    
    /**
     * "Compiled" function for determining which plural form to use
     */
    this._pluralFunc = false;
    
    /**
     * Default plural count
     */
    this._pluralCount = false;
    
    /**
     * Default plural rules
     */
    this._pluralRules = "nplurals=2; plural=(n != 1)";
    
    /**
     * Charset for the input file, output is UTF-8
     */
    this.charset = "iso-8859-1"; // default charset
    
    if(fileContents && fileContents.length){
        // Check endianness of the file
        if(this._checkMagick()){
            /**
             * GetText revision nr, usually 0
             */
            this.revision = this._fileContents[this._readFunc](4);
            
            /**
             * Total count of translated strings
             */
            this.total = this._fileContents[this._readFunc](8); 
            
            /**
             * Offset position for original strings table
             */
            this._offsetOriginals = this._fileContents[this._readFunc](12);
            
            /**
             * Offset position for translation strings table
             */
            this._offsetTranslations = this._fileContents[this._readFunc](16);
        
            // Load translations into this._translationTable
            this._loadMOTranslationTable();
        }else{
            // Load translations into this._translationTable
            this._loadPOTranslationTable();
        }
    }
    
    if(this._pluralCount === false){
        this._detectPlurals();
    }
   
}

/**
 * Magic constant to check the endianness of the input file
 */
GettextDomain.prototype.MAGIC = 0x950412de;

/**
 * Tries to check the plural forms for a domain
 */
GettextDomain.prototype._detectPlurals = function(){
    var domain = this._domain,
        plurals = false;
    if(pluralsInfo[domain]){
        plurals = pluralsInfo[domain];
    }else if((domain = domain.split("_")[0]) && pluralsInfo[domain]){
        plurals = pluralsInfo[domain];
    }

    if(!plurals || !plurals.plurals){
        // defaults to the same rules as with 'en'
        this._pluralCount = 2;
        this._pluralRules = "nplurals=2; plural=(n != 1)";
        return;
    }else{
        this._pluralCount = plurals.numbers.length;
        this._pluralRules = plurals.plurals;
    }
};

/**
 * Checks if number values in the input file are in big- or littleendian format.
 * 
 * @return {Boolean} Return true if magic was detected
 */
GettextDomain.prototype._checkMagick = function(){
    if(this._fileContents.readUInt32LE(0) == this.MAGIC){
        this._readFunc = "readUInt32LE";
        this._writeFunc = "writeUInt32LE";
        return true;
    }else if(this._fileContents.readUInt32BE(0) == this.MAGIC){
        this._readFunc = "readUInt32BE";
        this._writeFunc = "writeUInt32BE";
        return true;
    }else{
        return false;
    }
};

/**
 * Read the original strings and translations from the input MO file. Use the
 * first translation string in the file as the header.
 */
GettextDomain.prototype._loadMOTranslationTable = function(){
    var offsetOriginals = this._offsetOriginals,
        offsetTranslations = this._offsetTranslations,
        position, length,
        original, translation;
        
    for(var i = 0; i < this.total; i++){
        
        // original string
        length = this._fileContents[this._readFunc](offsetOriginals);
        offsetOriginals += 4;
        position = this._fileContents[this._readFunc](offsetOriginals);
        offsetOriginals += 4;
        original = this._fileContents.slice(position, position + length);
        
        // matching translation
        length = this._fileContents[this._readFunc](offsetTranslations);
        offsetTranslations += 4;
        position = this._fileContents[this._readFunc](offsetTranslations);
        offsetTranslations += 4;
        translation = this._fileContents.slice(position, position + length);
        
        if(!i){
            // assume the first row is the header
            this._parseHeaders(translation);
        }else{
            //translation
            this._addString(original, translation);
        }
    }
    
    // dump the file contents object
    this._fileContents = null;
};

/**
 * Read the original strings and translations from the input PO file. Use the
 * first translation string in the file as the header.
 */
GettextDomain.prototype._loadPOTranslationTable = function(){
    var parser = new POParser(this._fileContents),
        po = parser.parse(),
        context;
    
    for(var i=0, len = po.length; i<len; i++){
        if(!i){
            this._parseHeaders(po[i].msgstr && po[i].msgstr[0] || "", true);
        }else{
            context = po[i].msgctxt || "";
            if(!this._translationTable[context]){
                this._translationTable[context] = {};
            }
            this._translationTable[context][po[i].msgid || ""] = po[i].msgstr || "";
            if(po[i].comments){
                this._translationTable[context]["\x05" + (po[i].msgid || "")] = po[i].comments;
            }
        }
    }
    
    // dump the file contents object
    this._fileContents = null;
    po = null;
}

/**
 * Parse headers - detect charset and plural forms, save the values to this.headers
 * with lowercase keys.
 * 
 * @param {Buffer} headers Headers string as a Buffer object
 * @param {Boolean} keepCharset If true, do not convert charset
 */
GettextDomain.prototype._parseHeaders = function(headers, keepCharset){

    var headersStr = headers.toString(),
        charset;
        
    if((charset = headersStr.match(/[; ]charset\s*=\s*([\w\-]+)/i))){
        this.charset = (charset[1] || "iso-8859-1").
                    replace(/^utf(\d+)$/i, "utf-$1"). // add missing hyphen
                    toLowerCase().trim();
    }
    
    if(!keepCharset && this.charset != "utf-8"){
        this._iconv = new Iconv(this.charset, "UTF-8//TRANSLIT//IGNORE");
        headersStr = this._iconv.convert(headers).toString("utf-8");
    }
    
    headersStr.trim().split(/\r?\n/).forEach((function(line, i){
        var key, value;
        line = (line || "").split(":");
        key = line.shift().toLowerCase().trim();
        value = line.join(":");
        if(key){
            this.headers[key] = value;
        }
        if(key == "plural-forms" && value.trim()){
            this._pluralRules = value;
        }
    }).bind(this));
    
    this._parsePluralHeader(this._pluralRules);
};

/**
 * Adds a string to the translation table. Detects also the context and plural forms.
 * 
 * @param {Buffer} original Original string
 * @param {Buffer} translation Translationl string
 */
GettextDomain.prototype._addString = function(original, translation){
    var context, parts;
    
    if(this._iconv){
        try{
            original = this._iconv.convert(original);
        }catch(E){}
        try{
            translation = this._iconv.convert(translation);
        }catch(E){}
    }
    
    original = original.toString("utf-8");
    translation = translation.toString("utf-8");
    
    // Get context
    parts = original.split("\u0004");
    
    if(parts.length>1){
        context = parts.shift();
        original = parts.join("\u0004");
    }else{
        context = "";
    }
    
    if(!this._translationTable[context]){
        this._translationTable[context] = {};
    }
    
    // Handle plurals, add to table
    original = original.split("\u0000")[0]; // keep the first
    
    this._translationTable[context][original] = translation.split("\u0000");
};

/**
 * Resolves the plural index for a number count
 * 
 * @param {Number} count Number count
 * @return{Number} plural index (0 based)
 */ 
GettextDomain.prototype._getPluralIndex = function(count){
    if(typeof count == "undefined" || isNaN(count)){
        return 0;
    }
    
    if(this._pluralFunc){
        return this._pluralFunc(count);
    }else{
        return 0;
    }
};

/**
 * Parses the plural header string.
 * 
 * @param {String} str Plural header string
 */
GettextDomain.prototype._parsePluralHeader = function(str){
    var match,
        parts = str.split(/\s*;\s*/),
        pluralFunc = function(){return 0;};

    for(var i=0, len = parts.length; i<len; i++){
        if((match = parts[i].trim().match(/nplurals\s*=\s*(\d+)/i))){
            this._pluralCount = Number(match[1]) || 1;
        }else if(parts[i].match(/^\s*plural\s*=/i)){
            this._pluralFunc = this._createPluralFunc(parts[i].trim()) || pluralFunc;
        }
    }
};

/**
 * "Compiles" a function for detecting plural indexes. Throws an error if the
 * syntax is invalid.
 * 
 * @param {String} str Plural detection code
 * @return {Function} Function for calculating plural indexes
 */
GettextDomain.prototype._createPluralFunc = function(str){
    str = str.replace(/^\s*plural\s*=\s*/, "").
            replace(/[^n\s\d%&>=<\|\?:!\(\)\/\+]/g, ""). // sanitize non-allowed chars
            replace(/([^\|])\|([^\|])/g, "$1 $2"). // sanitize bitwise |
            replace(/([^&])&([^&])/g, "$1 $2"). // sanitize bitwise &
            replace(/<</g, " "). // sanitize bitwise <<
            replace(/>>/g, " "). // sanitize bitwise >>
            trim();
    if(str){
        try{
            return new Function("n", "return Number("+str+") || 0");
        }catch(E){
            throw new Error("Invalid plural header for translation file '"+str+"'");
        }
    }else{
        return false;
    }
};

/**
 * Generates header value for compiling
 * 
 * @return {String} Header value
 */
GettextDomain.prototype._generateHeaders = function(){
    return ["Project-Id-Version: node-gettext",
            "MIME-Version: 1.0",
            "Content-Type: text/plain; charset=UTF-8",
            "Content-Transfer-Encoding: 8bit",
            "Plural-Forms: " + this._pluralRules,
            ""].join("\n");
};

/**
 * Creates a string value that can be included in PO file
 * 
 * @param {String} key Key name
 * @param {String} value Key value
 * @return {String} Formatted string usable in PO files
 */
GettextDomain.prototype._addPOString = function(key, value){
    var line = "";
    key = (key || "").toString();
    value = (value || "").toString().
            replace(/\\/g, "\\\\").
            replace(/\"/g, "\\\"").
            replace(/\r/g, "\\r");
    if(value.match(/\n/)){
        value = value.replace(/\n/g, "\\n\n").replace(/\n$/, "");
        line = ("\n"+value).split("\n").map(function(l){
            return '"' + l + '"' + "\n";
        }).join("");
    }else{
        line = '"' + value + '"' + "\n";
    }
    
    return key + " " + line;
};    

/**
 * Translates a string based of the context and number count.
 * 
 * @param {String} original String to be translated
 * @param {String} [context] Translation context
 * @param {Number} [count] Number count
 * @return {String|Boolean} Translated string (or false, if no translation was found)
 */
GettextDomain.prototype.getTranslation = function(original, context, count){
    context = (context || "").toString();
    count = this._getPluralIndex(count);
    
    return this._translationTable[context] && 
            this._translationTable[context][original] && 
            this._translationTable[context][original][count] ||
            false; 
};

/**
 * Retrieves a comment object for a translation
 * 
 * @param {String} original String to be translated
 * @param {String} [context] Translation context
 * @return {Object|Boolean} Comment object for the translation
 */
GettextDomain.prototype.getComment = function(original, context){
    original = (original || "").toString();
    context = (context || "").toString();
    
    return this._translationTable[context] && 
            this._translationTable[context]["\x05" + original]
            false; 
};

/**
 * Sets a comment object for a translation
 * 
 * @param {String} original String to be translated
 * @param {String} [context] Translation context
 * @param {String|Object} comment Comment for a translation. Either a string or an object `{comment, note, code}`
 * @return {Object|Boolean} Comment object for the translation
 */
GettextDomain.prototype.setComment = function(original, context, comment){
    original = (original || "").toString();
    context = (context || "").toString();

    comment = comment || "";

    var curComment = this.getComment(original, context) || {};
    if(typeof comment == "string"){
        curComment.comment = comment;
    }else{
        Object.keys(comment).forEach(function(key){
            curComment[key] = comment[key];
        });
    }
    
    if(!this._translationTable[context]){
        this._translationTable[context] = {};
    }

    return this._translationTable[context]["\x05" + original] = curComment;
};


/**
 * Adds/replaces a translation in the translation table
 * 
 * @param {String} context Translation context
 * @param {String} original Original string
 * @param {Array|String} translations Translations
 */
GettextDomain.prototype.setTranslation = function(context, original, translations){
    original = (original || "").toString();
    translations = (translations && [].concat(translations) || []).map(function(translation){
        return (translation || "").toString();
    });
    context = (context || "").toString();
    
    if(!this._translationTable[context]){
        this._translationTable[context] = {};
    }
    
    this._translationTable[context][original] = translations;
};

/**
 * Removes a translation from the translation table
 * 
 * @param {String} context Translation context
 * @param {String} original Original string
 */
GettextDomain.prototype.deleteTranslation = function(context, original){
    original = (original || "").toString();
    context = (context || "").toString() || "";
    
    if(this._translationTable[context] && this._translationTable[context][original]){
        delete this._translationTable[context][original];
        if(!Object.keys(this._translationTable[context]).length){
            delete this._translationTable[context];
        }
    }
};

/**
 * Compiles the current translation structure to a .PO file
 * 
 * @return {Buffer} PO file contents, can be saved to disk etc.
 */
GettextDomain.prototype.compilePO = function(){
    var translationTable = [],
        returnStr = "";
    
    // add header as the first field
    translationTable.push({translation: [this._generateHeaders()]});
    
    // gather all strings as key value pairs
    Object.keys(this._translationTable).forEach((function(context){
        Object.keys(this._translationTable[context]).forEach((function(original){
            if(original.charAt(0) == "\x05"){
                return; // special string for comments
            }
            var originalArr = [];
            for(var i=0, len = Math.max(this._translationTable[context][original].length, 1); i< len; i++){
                originalArr[i] = original;
            }
            translationTable.push({
                context: context,
                original: originalArr,
                translation: this._translationTable[context][original],
                comment: this._translationTable[context]["\x05" + original] || false
            });
            
        }).bind(this));
    }).bind(this));

    translationTable.forEach((function(line, i){
        if(i){
            returnStr += "\n";
        }

        if(line.comment){
            if(line.comment.comment){
                returnStr += "# " + line.comment.comment.replace(/\r?\n|\r/g, "\n# ") + "\n";
            }
            if(line.comment.note){
                returnStr += "#. " + line.comment.note.replace(/\r?\n|\r/g, "\n#. ") + "\n";
            }
            if(line.comment.code){
                returnStr += "#: " + line.comment.code.replace(/\r?\n|\r/g, "\n#: ") + "\n";
            }
        }

        if(line.context){
            returnStr += this._addPOString("msgctxt", line.context);
        }
        
        returnStr += this._addPOString("msgid", line.original && line.original[0]);
        if(line.original && line.original.length>1){
            returnStr += this._addPOString("msgid_plural", line.original[1]);
        }
        
        if(line.translation.length<=1){
            returnStr += this._addPOString("msgstr", line.translation[0]);
        }else{
            returnStr += line.translation.map((function(translation, i){
                return this._addPOString("msgstr["+i+"]", translation);
            }).bind(this)).join("");
        }
        
    }).bind(this));
    
    return new Buffer(returnStr, "utf-8");
};

/**
 * Compiles the current translation structure to a .MO file
 * 
 * @return {Buffer} Binary MO file contents, can be saved to disk etc.
 */
GettextDomain.prototype.compileMO = function(){
    var translationTable = [],
        originalsLength = 0,
        translationsLength = 0,
        totalLength = 0,
        curPosition = 0,
        returnBuffer,
        i, len;
    
    // add header as the first field
    translationTable.push(["", this._generateHeaders()]);
     
    // gather all strings as key value pairs
    Object.keys(this._translationTable).forEach((function(context){
        Object.keys(this._translationTable[context]).forEach((function(original){
            if(original.charAt(0) == "\x05"){
                return; // special string for comments
            }
            var originalArr = this._translationTable[context][original].length > 1 ? 
                                        [original, original] : [original];
            translationTable.push([
                (context ? context+"\u0004" : "")+originalArr.join("\u0000"), 
                this._translationTable[context][original].join("\u0000")
              ]);
        }).bind(this));
    }).bind(this));
    
    // create buffers and calculate table lengths
    translationTable = translationTable.map(function(line){
        var original = new Buffer(line[0], "utf-8"),
            translation = new Buffer(line[1], "utf-8");
        originalsLength += original.length + 1; // + extra 0x00
        translationsLength += translation.length + 1; // + extra 0x00
        return [original, translation];
    });

    // sort by the original string
    translationTable.sort(function(a,b){
        if(a[0] > b[0]){
            return 1;
        }
        if(a[0] < b[0]){
            return -1;
        }
        return 0;
    });
    
    totalLength = 4 + // magic number
                  4 + // revision
                  4 + // string count
                  4 + // original string table offset
                  4 + // translation string table offset
                  4 + // hash table size
                  4 + // hash table offset
                  (4+4) * translationTable.length + // original string table
                  (4+4) * translationTable.length + // translations string table
                  originalsLength +  // originals
                  translationsLength; // translations
    
    returnBuffer = new Buffer(totalLength);
    
    // magic
    returnBuffer[this._writeFunc](this.MAGIC, 0);
    
    // revision
    returnBuffer[this._writeFunc](0, 4);
    
    // string count
    returnBuffer[this._writeFunc](translationTable.length, 8);
    
    // original string table offset
    returnBuffer[this._writeFunc](28, 12);
    
    // translation string table offset
    returnBuffer[this._writeFunc](28 + (4+4) * translationTable.length, 16);
    
    // hash table size
    returnBuffer[this._writeFunc](0, 20);
 
    // hash table offset
    returnBuffer[this._writeFunc](28 + (4+4) * translationTable.length, 24);
    
    // build originals table
    curPosition = 28 + 2 * (4+4) * translationTable.length;
    for(i=0, len = translationTable.length; i<len; i++){
        translationTable[i][0].copy(returnBuffer, curPosition);
        returnBuffer[this._writeFunc](translationTable[i][0].length, 28 + i*8);
        returnBuffer[this._writeFunc](curPosition, 28 + i*8 + 4);
        returnBuffer[curPosition + translationTable[i][0].length] = 0x00;
        curPosition += translationTable[i][0].length+1;
    }
        
    // build translations table
    for(i=0, len = translationTable.length; i<len; i++){
        translationTable[i][1].copy(returnBuffer, curPosition);
        returnBuffer[this._writeFunc](translationTable[i][1].length, 28 + (4+4) * translationTable.length + i*8);
        returnBuffer[this._writeFunc](curPosition, 28 + (4+4) * translationTable.length + i*8 + 4);
        returnBuffer[curPosition + translationTable[i][1].length] = 0x00;
        curPosition += translationTable[i][1].length+1;
    }
    
    return returnBuffer;
};
