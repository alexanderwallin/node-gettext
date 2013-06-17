
var GettextDomain = require("./domain");

// expose to the world
module.exports = Gettext;

/**
 * Gettext function
 * 
 * @constructor
 */
function Gettext(){
    this._domains = {};
    this._textdomain = false;
}

////////////////// PRIVATE API //////////////////

/**
 * Loads a translation from the TextDomain object
 * 
 * @param {String} [domain] Case insensitive language identifier
 * @param {String} msgid String to be translated
 * @param {String} [context] Translation context
 * @param {Number} [count] Number count for plural translations
 * @return {String|Boolean} Returns the translation or false if not found
 */
Gettext.prototype._getTranslation = function(domain, msgid, context, count){
    domain = (domain || this._textdomain || "").toLowerCase().trim();
    if(this._domains[domain]){
        return this._domains[domain].getTranslation(msgid, context, count);
    }else{
        return false;
    }
};

////////////////// PUBLIC API //////////////////

/**
 * Adds a gettext to the domains list. If default textdomain is not set, uses it
 * as default
 * 
 * @param {String} domain Case insensitive language identifier (domain)
 * @param {Buffer} fileContents Translations file (*.mo) contents as a Buffer object
 */
Gettext.prototype.addTextdomain = function(domain, fileContents){
    domain = (domain || "").toString().toLowerCase().trim();
    this._domains[domain] = new GettextDomain(domain, fileContents);
    
    if(!this._textdomain){
        this._textdomain = domain;
    }
};

/**
 * Changes the current default textdomain
 * 
 * @param {String} [domain] Case insensitive language identifier
 * @return {String} cuurent textdomain
 */
Gettext.prototype.textdomain = function(domain){
    domain = (domain || "").toString().toLowerCase().trim();
    if(domain){
        this._textdomain = domain;
    }
    return this._textdomain;
};

/**
 * Translates a string using the default textdomain
 * 
 * @param {String} msgid String to be translated
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.gettext = function(msgid){
    return this.dnpgettext(false, false, msgid);
};

/**
 * Translates a string using a specific domain
 * 
 * @param {String} domain Case insensitive language identifier
 * @param {String} msgid String to be translated
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.dgettext = function(domain, msgid){
    return this.dnpgettext(domain, false, msgid);
};

/**
 * Translates a plural string using the default textdomain 
 * 
 * @param {String} msgid String to be translated
 * @param {String} msgidPlural If no translation was found, return this on count!=1
 * @param {Number} count Number count for the plural
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.ngettext = function(msgid, msgidPlural, count){
    return this.dnpgettext(false, false, msgid, msgidPlural, count);
};

/**
 * Translates a plural string using a specific textdomain 
 * 
 * @param {String} domain Case insensitive language identifier
 * @param {String} msgid String to be translated
 * @param {String} msgidPlural If no translation was found, return this on count!=1
 * @param {Number} count Number count for the plural
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.dngettext = function(domain, msgid, msgidPlural, count){
    return this.dnpgettext(domain, false, msgid, msgidPlural, count);
};

/**
 * Translates a string from a specific context using the default textdomain
 * 
 * @param {String} context Translation context
 * @param {String} msgid String to be translated
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.pgettext = function(context, msgid){
    return this.dnpgettext(false, context, msgid);
};

/**
 * Translates a string from a specific context using s specific textdomain
 * 
 * @param {String} domain Case insensitive language identifier
 * @param {String} context Translation context
 * @param {String} msgid String to be translated
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.dpgettext = function(domain, context, msgid){
    return this._getTranslation(domain, msgid, context) || msgid;
    return this.dnpgettext(domain, context, msgid);
};

/**
 * Translates a plural string from a specifi context using the default textdomain 
 * 
 * @param {String} context Translation context
 * @param {String} msgid String to be translated
 * @param {String} msgidPlural If no translation was found, return this on count!=1
 * @param {Number} count Number count for the plural
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.npgettext = function(context, msgid, msgidPlural, count){
    return this.dnpgettext(false, context, msgid, msgidPlural, count);
};

/**
 * Translates a plural string from a specifi context using a specific textdomain 
 * 
 * @param {String} domain Case insensitive language identifier
 * @param {String} context Translation context
 * @param {String} msgid String to be translated
 * @param {String} msgidPlural If no translation was found, return this on count!=1
 * @param {Number} count Number count for the plural
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.dnpgettext = function(domain, context, msgid, msgidPlural, count){
    var defaultTranslation = msgid;
    if(!isNaN(count) && count != 1){
        defaultTranslation = msgidPlural;
    } 
    return this._getTranslation(domain, msgid, context, count) || defaultTranslation;
};

/**
 * Retrieves comments for a translation
 * 
 * @param {String} domain Case insensitive language identifier
 * @param {String} context Translation context
 * @param {String} msgid String to be translated
 * @return {Object} comments for the translation in the form of {comment, note, code}
 */
Gettext.prototype.getComment = function(domain, context, msgid){
    domain = (domain || this._textdomain || "").toLowerCase().trim();
    if(this._domains[domain]){
        return this._domains[domain].getComment(msgid, context);
    }else{
        return false;
    }
};

/**
 * Sets a comment for a translation
 * 
 * @param {String} domain Case insensitive language identifier
 * @param {String} context Translation context
 * @param {String} msgid String to be translated
 * @return {String|Object} comment for the translation in the form of {comment, note, code} or a string
 */
Gettext.prototype.setComment = function(domain, context, msgid, comment){
    domain = (domain || this._textdomain || "").toLowerCase().trim();
    var textdomain = this._domains[domain] || this._domains[this._textdomain] || false;
    if(textdomain){
        textdomain.setComment(msgid, context, comment);
    }
};

/**
 * Adds/replaces a translation in the translation table
 * 
 * @param {String} domain Case insensitive language identifier
 * @param {String} context Translation context
 * @param {String} original Original string
 * @param {Array|String} translations Translations
 */
Gettext.prototype.setTranslation = function(domain, context, original, translations){
    domain = (domain || "").toString().toLowerCase().trim();
    var textdomain = this._domains[domain] || this._domains[this._textdomain] || false;
    if(textdomain){
        textdomain.setTranslation(context, original, translations);
    }
};

/**
 * Removes a translation from the translation table
 * 
 * @param {String} domain Case insensitive language identifier
 * @param {String} context Translation context
 * @param {String} original Original string
 */
Gettext.prototype.deleteTranslation = function(domain, context, original){
    domain = (domain || "").toString().toLowerCase().trim();
    var textdomain = this._domains[domain] || this._domains[this._textdomain] || false;
    if(textdomain){
        textdomain.setTranslation(context, original);
    }
};

/**
 * List available context names
 * 
 * @param {String} [domain] Case insensitive language identifier
 * @return {Array} An array of context names
 */
Gettext.prototype.listContextNames = function(domain){
    domain = (domain || "").toString().toLowerCase().trim();
    var textdomain = this._domains[domain] || this._domains[this._textdomain] || false;
    if(textdomain){
        return Object.keys(textdomain._translationTable).sort(function(a,b){
            return a.localeCompare(b);
        });
    }
    
    return [];
};

/**
 * List available translation keys
 * 
 * @param {String} [domain] Case insensitive language identifier
 * @param {String} context Context name
 * @return {Array} An array of translation keys
 */
Gettext.prototype.listKeys = function(domain, context){
    domain = (domain || "").toString().toLowerCase().trim();
    context = (context || "").toString();
    
    var textdomain = this._domains[domain] || this._domains[this._textdomain] || false;
    if(textdomain){
        if(textdomain._translationTable[context]){
            return Object.keys(textdomain._translationTable[context]).sort(function(a,b){
                return a.localeCompare(b);
            });
        }
    }
    
    return [];
};

/**
 * Compiles a language table into a .MO file
 * 
 * @return {Buffer} Binary MO file contents, can be saved to disk etc.
 */
Gettext.prototype.compileMO = function(domain){
    domain = (domain || "").toString().toLowerCase().trim();
    var textdomain = this._domains[domain] || this._domains[this._textdomain] || false;
    if(textdomain){
        return textdomain.compileMO();
    }
};

/**
 * Compiles a language table into a .PO file
 * 
 * @return {Buffer} PO file contents, can be saved to disk etc.
 */
Gettext.prototype.compilePO = function(domain){
    domain = (domain || "").toString().toLowerCase().trim();
    var textdomain = this._domains[domain] || this._domains[this._textdomain] || false;
    if(textdomain){
        return textdomain.compilePO();
    }
};

/**
 * Registers gettext functions to String.prototype for easier (and global) access
 */
Gettext.prototype.registerStringHelpers = function(){
    var gt = this;
    
    // textdomain
    if(!("textdomain" in String.prototype)){
        Object.defineProperty(String.prototype, "textdomain", {
            value: function(domain){
                return gt.textdomain(domain);
            },
            enumerable: false
        });
    }
    
    // gettext
    if(!("gettext" in String.prototype)){
        Object.defineProperty(String.prototype, "gettext", {
            value: function(){
                return gt.gettext(this.toString());
            },
            enumerable: false
        });
    }
    
    // dgettext
    if(!("dgettext" in String.prototype)){
        Object.defineProperty(String.prototype, "dgettext", {
            value: function(domain){
                return gt.dgettext(domain, this.toString());
            },
            enumerable: false
        });
    }
    
    // ngettext
    if(!("ngettext" in String.prototype)){
        Object.defineProperty(String.prototype, "ngettext", {
            value: function(msgidPlural, count){
                return gt.ngettext(this.toString(), msgidPlural, count);
            },
            enumerable: false
        });
    }
    
    // dngettext
    if(!("dngettext" in String.prototype)){
        Object.defineProperty(String.prototype, "dngettext", {
            value: function(domain, msgidPlural, count){
                return gt.dngettext(domain, this.toString(), msgidPlural, count);
            },
            enumerable: false
        });
    }
    
    // pgettext
    if(!("pgettext" in String.prototype)){
        Object.defineProperty(String.prototype, "pgettext", {
            value: function(context){
                return gt.pgettext(context, this.toString());
            },
            enumerable: false
        });
    }
    
    // dpgettext
    if(!("dpgettext" in String.prototype)){
        Object.defineProperty(String.prototype, "dpgettext", {
            value: function(domain, context){
                return gt.dpgettext(domain, context, this.toString());
            },
            enumerable: false
        });
    }
    
    // npgettext
    if(!("npgettext" in String.prototype)){
        Object.defineProperty(String.prototype, "npgettext", {
            value: function(context, msgidPlural, count){
                return gt.npgettext(context, this.toString(), msgidPlural, count);
            },
            enumerable: false
        });
    }
    
    // dnpgettext
    if(!("dnpgettext" in String.prototype)){
        Object.defineProperty(String.prototype, "dnpgettext", {
            value: function(domain, context, msgidPlural, count){
                return gt.dnpgettext(domain, context, this.toString(), msgidPlural, count);
            },
            enumerable: false
        });
    }
};
