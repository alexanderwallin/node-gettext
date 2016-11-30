'use strict';

var get = require('lodash.get');
var plurals = require('./plurals');

module.exports = Gettext;

/**
 * Gettext function
 *
 * @constructor
 */
function Gettext(options) {
    options = options || {};

    this.catalogs = {};
    this.locale = null;
    this.domain = 'messages';

    this.debug = options.debug === true;
}

/**
 * Logs a warning to the console if debug mode is enabled.
 *
 * @param  {String} message  A warning message
 */
Gettext.prototype.warn = function(message) {
    if (this.debug) {
        console.warn(message);
    }
};

/**
 * Stores a set of translations in the set of gettext
 * catalogs.
 *
 * @param {String} locale        A locale string
 * @param {String} domain        A domain name
 * @param {Object} translations  An object of gettext-parser JSON shape
 */
Gettext.prototype.addTranslations = function(locale, domain, translations) {
    if (!this.catalogs[locale]) {
        this.catalogs[locale] = {};
    }

    this.catalogs[locale][domain] = translations;
};

/**
 * Sets the locale to get translated messages for.
 *
 * @param {String} locale  A locale
 */
Gettext.prototype.setLocale = function(locale) {
    if (!locale) {
        this.warn('You called setLocale() with an empty value, which makes little sense.');
        return;
    }

    if (!this.catalogs[locale]) {
        this.warn('You called setLocale() with "' + locale + '", but no translations for that locale has been added.');
        return;
    }

    this.locale = locale;
};

/**
 * Sets the default gettext domain.
 *
 * @param {String} domain  A gettext domain name
 */
Gettext.prototype.setTextDomain = function(domain) {
    if (!domain) {
        this.warn('You called setTextDomain() with an empty `domain` value, which is not allowed.');
        return;
    }

    this.domain = domain;
};

/**
 * TODO(alexanderwallin): Remove this function when 2.0.0 is released.
 *
 * @deprecated
 */
Gettext.prototype.addTextdomain = function() {

    // TODO(alexanderwallin): Add instructions for file i/o
    console.error('addTextdomain() is deprecated.\n\n' +
        '* To add translations, use addTranslations()\n' +
        '* To set the default domain, use setTextDomain()');
};

/**
 * TODO(alexanderwallin): Remove this function when 2.0.0 is released.
 *
 * @deprecated
 */
Gettext.prototype.textdomain = function() {
    console.error('textdomain() is deprecated.\n\n' +
        '* To set the current locale, use setLocale()\n' +
        '* To set the default domain, use setTextDomain()');
};

/**
 * Translates a string using the default textdomain
 *
 * @param {String} msgid  String to be translated
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.gettext = function(msgid) {
    return this.dnpgettext(this.domain, '', msgid);
};

/**
 * Translates a string using a specific domain
 *
 * @param  {String} domain  A gettext domain name
 * @param  {String} msgid   String to be translated
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.dgettext = function(domain, msgid) {
    return this.dnpgettext(domain, '', msgid);
};

/**
 * Translates a plural string using the default textdomain
 *
 * @param {String} msgid        String to be translated
 * @param {String} msgidPlural  If no translation was found, return this on count!=1
 * @param {Number} count        Number count for the plural
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.ngettext = function(msgid, msgidPlural, count) {
    return this.dnpgettext(this.domain, '', msgid, msgidPlural, count);
};

/**
 * Translates a plural string using a specific textdomain
 *
 * @param {String} domain       A gettext domain name
 * @param {String} msgid        String to be translated
 * @param {String} msgidPlural  If no translation was found, return this on count!=1
 * @param {Number} count        Number count for the plural
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.dngettext = function(domain, msgid, msgidPlural, count) {
    return this.dnpgettext(domain, '', msgid, msgidPlural, count);
};

/**
 * Translates a string from a specific context using the default textdomain
 *
 * @param {String} msgctxt  Translation context
 * @param {String} msgid    String to be translated
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.pgettext = function(msgctxt, msgid) {
    return this.dnpgettext(this.domain, msgctxt, msgid);
};

/**
 * Translates a string from a specific context using s specific textdomain
 *
 * @param {String} domain   A gettext domain name
 * @param {String} msgctxt  Translation context
 * @param {String} msgid    String to be translated
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.dpgettext = function(domain, msgctxt, msgid) {
    return this.dnpgettext(domain, msgctxt, msgid);
};

/**
 * Translates a plural string from a specifi context using the default textdomain
 *
 * @param {String} msgctxt      Translation context
 * @param {String} msgid        String to be translated
 * @param {String} msgidPlural  If no translation was found, return this on count!=1
 * @param {Number} count        Number count for the plural
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.npgettext = function(msgctxt, msgid, msgidPlural, count) {
    return this.dnpgettext(this.domain, msgctxt, msgid, msgidPlural, count);
};

/**
 * Translates a plural string from a specifi context using a specific textdomain
 *
 * @param {String} domain       A gettext domain name
 * @param {String} msgctxt      Translation context
 * @param {String} msgid        String to be translated
 * @param {String} msgidPlural  If no translation was found, return this on count!=1
 * @param {Number} count        Number count for the plural
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.dnpgettext = function(domain, msgctxt, msgid, msgidPlural, count) {
    var defaultTranslation = msgid;
    var translation;
    var index;

    msgctxt = msgctxt || '';

    if (!isNaN(count) && count !== 1) {
        defaultTranslation = msgidPlural || msgid;
    }

    if (!this.locale) {
        this.warn('You need to set a locale using setLocale(locale) before getting translated messages.');
        return defaultTranslation;
    }

    translation = this._getTranslation(domain, msgctxt, msgid);

    if (translation) {
        if (typeof count === 'number') {
            var pluralsFunc = plurals[Gettext.getLanguageCode(this.locale)].pluralsFunc;
            index = pluralsFunc(count);
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
 * @param {String} domain   A gettext domain name
 * @param {String} msgctxt  Translation context
 * @param {String} msgid    String to be translated
 * @return {Object} Comments object or false if not found
 */
Gettext.prototype.getComment = function(domain, msgctxt, msgid) {
    var translation;

    translation = this._getTranslation(domain, msgctxt, msgid);
    if (translation) {
        return translation.comments || {};
    }

    return {};
};

/**
 * Retrieves translation object from the domain and context
 *
 * @param {String} domain   A gettext domain name
 * @param {String} msgctxt  Translation context
 * @param {String} msgid    String to be translated
 * @return {Object} Translation object or false if not found
 */
Gettext.prototype._getTranslation = function(domain, msgctxt, msgid) {
    msgctxt = msgctxt || '';

    return get(this.catalogs, [this.locale, domain, 'translations', msgctxt, msgid]);
};

/**
 * Returns the language code part of a locale
 *
 * @param {String} locale  A case-insensitive locale string
 * @returns {String} A language code
 */
Gettext.getLanguageCode = function(locale) {
    var parts = (locale || '').toString().split(/[\-_]/);
    return parts[0].toLowerCase();
};
