'use strict';

var plurals = require('./plurals');
var gettextParser = require('gettext-parser');

module.exports = Gettext;

/**
 * Gettext function
 *
 * @constructor
 */
function Gettext() {
    this.domains = {};
    this._currentDomain = false;
}

/**
 * Adds a gettext to the domains list. If default textdomain is not set, uses it
 * as default
 *
 * @param {String} domain Case insensitive language identifier (domain)
 * @param {Buffer} fileContents Translations file (*.mo) contents as a Buffer object
 */
Gettext.prototype.addTextdomain = function(domain, file) {
    domain = this._normalizeDomain(domain);
    var translation;

    if (file && typeof file !== 'string') {
        translation = gettextParser.mo.parse(file, 'utf-8');
    }

    if (!translation) {
        translation = gettextParser.po.parse(file || '', 'utf-8');
    }

    // We do not want to parse and compile stuff from unknown sources
    // so we only use precompiled plural definitions
    var pluralsInfo = plurals[this._normalizeDomain(domain, true)];
    if (pluralsInfo && translation.headers) {
        translation.headers['plural-forms'] = pluralsInfo.pluralsText;
        translation.pluralsFunc = pluralsInfo.pluralsFunc;
    } else {
        // default plurals to EN rules
        translation.pluralsFunc = plurals.en.pluralsFunc;
    }

    this.domains[domain] = translation;

    if (!this._currentDomain) {
        this._currentDomain = domain;
    }
};

/**
 * Changes the current default textdomain
 *
 * @param {String} [domain] Case insensitive language identifier
 * @return {String} cuurent textdomain
 */
Gettext.prototype.textdomain = function(updatedDomain) {
    if (!arguments.length) {
        return this._currentDomain;
    }

    updatedDomain = this._normalizeDomain(updatedDomain);
    if (this._currentDomain !== updatedDomain && this.domains.hasOwnProperty(updatedDomain)) {
        this._currentDomain = updatedDomain;
        return true;
    } else {
        return false;
    }
};

/**
 * Translates a string using the default textdomain
 *
 * @param {String} msgid String to be translated
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.gettext = function(msgid) {
    return this.dnpgettext(this._currentDomain, '', msgid);
};

/**
 * Translates a string using a specific domain
 *
 * @param {String} domain Case insensitive language identifier
 * @param {String} msgid String to be translated
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.dgettext = function(domain, msgid) {
    return this.dnpgettext(domain, '', msgid);
};

/**
 * Translates a plural string using the default textdomain
 *
 * @param {String} msgid String to be translated
 * @param {String} msgidPlural If no translation was found, return this on count!=1
 * @param {Number} count Number count for the plural
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.ngettext = function(msgid, msgidPlural, count) {
    return this.dnpgettext(this._currentDomain, '', msgid, msgidPlural, count);
};

/**
 * Translates a plural string using a specific textdomain
 *
 * @param {String} domain Case insensitive language identifier
 * @param {String} msgid String to be translated
 * @param {String} msgidPlural If no translation was found, return this on count!=1
 * @param {Number} count Number count for the plural
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.dngettext = function(domain, msgid, msgidPlural, count) {
    return this.dnpgettext(domain, '', msgid, msgidPlural, count);
};

/**
 * Translates a string from a specific context using the default textdomain
 *
 * @param {String} msgctxt Translation context
 * @param {String} msgid String to be translated
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.pgettext = function(msgctxt, msgid) {
    return this.dnpgettext(this._currentDomain, msgctxt, msgid);
};

/**
 * Translates a string from a specific context using s specific textdomain
 *
 * @param {String} domain Case insensitive language identifier
 * @param {String} msgctxt Translation context
 * @param {String} msgid String to be translated
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.dpgettext = function(domain, msgctxt, msgid) {
    return this.dnpgettext(domain, msgctxt, msgid);
};

/**
 * Translates a plural string from a specifi context using the default textdomain
 *
 * @param {String} msgctxt Translation context
 * @param {String} msgid String to be translated
 * @param {String} msgidPlural If no translation was found, return this on count!=1
 * @param {Number} count Number count for the plural
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.npgettext = function(msgctxt, msgid, msgidPlural, count) {
    return this.dnpgettext(this._currentDomain, msgctxt, msgid, msgidPlural, count);
};

/**
 * Translates a plural string from a specifi context using a specific textdomain
 *
 * @param {String} domain Case insensitive language identifier
 * @param {String} msgctxt Translation context
 * @param {String} msgid String to be translated
 * @param {String} msgidPlural If no translation was found, return this on count!=1
 * @param {Number} count Number count for the plural
 * @return {String} translation or the original string if no translation was found
 */
Gettext.prototype.dnpgettext = function(domain, msgctxt, msgid, msgidPlural, count) {
    var defaultTranslation = msgid;
    var translation;
    var index;

    domain = this._normalizeDomain(domain);
    msgctxt = msgctxt || '';

    if (!isNaN(count) && count !== 1) {
        defaultTranslation = msgidPlural || msgid;
    }

    translation = this._getTranslation(domain, msgctxt, msgid);
    if (translation) {
        if (typeof count === 'number') {
            index = this.domains[domain].pluralsFunc(count);
            if (typeof index === 'boolean') {
                index = index ? 1 : 0;
            }
        } else {
            index = 0;
        }

        return translation.msgstr[index] || defaultTranslation;
    }
    return defaultTranslation;
};

/**
 * Retrieves comments object for a translation
 *
 * @param {String} domain Case insensitive language identifier
 * @param {String} msgctxt Translation context
 * @param {String} msgid String to be translated
 * @return {Object} comments object or false if not found
 */
Gettext.prototype.getComment = function(domain, msgctxt, msgid) {
    var translation;

    domain = this._normalizeDomain(domain);

    translation = this._getTranslation(domain, msgctxt, msgid);
    if (translation) {
        return translation.comments || {};
    }

    return {};
};

/**
 * Retrieves translation object from the domain and context
 *
 * @param {String} domain Case insensitive language identifier
 * @param {String} msgctxt Translation context
 * @param {String} msgid String to be translated
 * @return {Object} translation object or false if not found
 */
Gettext.prototype._getTranslation = function(domain, msgctxt, msgid) {
    var translation;

    msgctxt = msgctxt || '';
    domain = this._normalizeDomain(domain);

    if (this.domains.hasOwnProperty(domain)) {
        if (this.domains[domain].translations && this.domains[domain].translations[msgctxt]) {
            if ((translation = this.domains[domain].translations[msgctxt][msgid])) {
                return translation;
            }
        }
    }

    return false;
};

/**
 * Normalizes textdomain value
 *
 * @param {String} domain Textdomain
 * @param {Boolean} [isShort] If true then returns only language
 * @returns {String} Normalized textdomain
 */
Gettext.prototype._normalizeDomain = function(domain, isShort) {
    var parts = (domain || '').toString().split('.').shift().split(/[\-_]/);
    var language = (parts.shift() || '').toLowerCase();
    var locale = (parts.join('-') || '').toUpperCase();

    if (isShort) {
        return language;
    } else {
        return [].concat(language || []).concat(locale || []).join('_');
    }
};
