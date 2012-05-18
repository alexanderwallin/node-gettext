
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
    domain = (domain || "").toLowerCase().trim();
    this._domains[domain] = new GettextDomain(fileContents);
    
    if(!this._textdomain){
        this._textdomain = domain;
    }
};

/**
 * Changes the current default textdomain
 * 
 * @param {String} domain Case insensitive language identifier
 */
Gettext.prototype.textdomain = function(domain){
    domain = (domain || "").toLowerCase().trim();
    this._textdomain = domain;
};

/**
 * Translates a string using the default textdomain
 * 
 * @param {String} msgid String to be translated
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.gettext = function(msgid){
    return this._getTranslation(false, msgid) || msgid;
};

/**
 * Translates a string using a specific domain
 * 
 * @param {String} domain Case insensitive language identifier
 * @param {String} msgid String to be translated
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.dgettext = function(domain, msgid){
    return this._getTranslation(domain, msgid) || msgid;
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
    return this.dngettext(false, msgid, msgidPlural, count);
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
    var defaultTranslation = msgid;
    if(!isNaN(count) && count != 1){
        defaultTranslation = msgidPlural;
    } 
    return this._getTranslation(domain, msgid, false, count) || defaultTranslation;
};

/**
 * Translates a string from a specific context using the default textdomain
 * 
 * @param {String} context Translation context
 * @param {String} msgid String to be translated
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.pgettext = function(context, msgid){
    return this._getTranslation(false, msgid, context) || msgid;
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
}
