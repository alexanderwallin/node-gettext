var Iconv = require("iconv").Iconv;

// Expose to the world
module.exports = GettextDomain;

/**
 * Creates a textdomain object for a specific language
 * 
 * @constrctor
 * @param {Buffer} fileContents Binary file contents as a Buffer object
 */
function GettextDomain(fileContents){
    
    /**
     * Keeps the file contents, dumped after usage
     */
    this._fileContents = fileContents;
    
    /**
     * Method name for reading int32 values, depends on the endianness
     */
    this._readFunc = "";
    
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
     * Plural count
     */
    this._pluralCount = 1;
    
    /**
     * Charset for the input file, output is UTF-8
     */
    this.charset = "iso-8859-1"; // default charset
    
    // Check endianness of the file
    this._checkMagick();
    
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
    this._loadTranslationTable();
}

/**
 * Magic constant to check the endianness of the input file
 */
GettextDomain.prototype.MAGIC = 0x950412de;

/**
 * Checks if number values in the input file are in big- or littleendian format.
 * 
 * If magic is not found, throw an error 
 */
GettextDomain.prototype._checkMagick = function(){
    if(this._fileContents.readUInt32BE(0) == this.MAGIC){
        this._readFunc = "readUInt32BE";
    }else if(this._fileContents.readUInt32LE(0) == this.MAGIC){
        this._readFunc = "readUInt32LE";
    }else{
        throw new Error("Invalid magic!");
    }
};

/**
 * Read the original strings and translations from the input file. Use the
 * first translation string in the file as the header.
 */
GettextDomain.prototype._loadTranslationTable = function(){
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
 * Parse headers - detect charset and plural forms, save the values to this.headers
 * with lowercase keys.
 * 
 * @param {Buffer} headers Headers string as a Buffer object
 */
GettextDomain.prototype._parseHeaders = function(headers){
    // leia charset ja kui charset on olemas, siis convert headers ja peale seda otsi plural väärtusi jne
    var headersStr = headers.toString(),
        charset;
        
    if((charset = headersStr.match(/[; ]charset\s*=\s*([\w\-]+)/i))){
        this.charset = (charset[1] || "iso-8859-1").
                    replace(/^utf(\d+)$/i, "utf-$1"). // add missing hyphen
                    toLowerCase().trim();
    }
    
    if(this.charset != "utf-8"){
        this._iconv = new Iconv(this.charset, "UTF-8//TRANSLIT//IGNORE");
        headersStr = this._iconv.convert(headers).toString("utf-8");
    }
    
    headersStr.trim().split(/\r?\n/).forEach((function(line, i){
        var key, value;
        line = (line || "").split(":");
        key = line.shift().toLowerCase().trim();
        value = line.join(":");
        if(key){
            this.headers[key] = value;
        }
        if(key == "plural-forms"){
            this._parsePluralHeader(value);
        }
    }).bind(this));
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
        context = "default";
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
    if(typeof count == "undefined" || isNaN(count)){
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
            this._pluralCount = Number(match[1]) || 1;
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
            trim();
    if(str){
        try{
            return new Function("n", "return Number("+str+") || 0");
        }catch(E){
            throw new Error("Invalid plural header for translation file '"+str+"'");
        }
    }else{
        return false;
    }
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
    context = context || "default";
    count = this._getPluralIndex(count);
    
    return this._translationTable[context] && 
            this._translationTable[context][original] && 
            this._translationTable[context][original][count] ||
            false; 
};