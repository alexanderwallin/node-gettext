'use strict';

var get = require('lodash.get');
var plurals = require('./plurals');

module.exports = Gettext;

/**
 * Creates and returns a new Gettext instance.
 *
 * @constructor
 * @param  {Object}  [options]             A set of options
 * @param  {String}  options.sourceLocale  The locale that the source code and its
 *                                         texts are written in. Translations for
 *                                         this locale is not necessary.
 * @param  {Boolean} options.debug         Whether to output debug info into the
 *                                         console.
 * @return {Object}  A Gettext instance
 */
function Gettext(options) {
    options = options || {};

    this.catalogs = {};
    this.locale = '';
    this.domain = 'messages';

    this.listeners = [];

    // Set source locale
    this.sourceLocale = '';
    if (options.sourceLocale) {
        if (typeof options.sourceLocale === 'string') {
            this.sourceLocale = options.sourceLocale;
        }
        else {
            this.warn('The `sourceLocale` option should be a string');
        }
    }

    // Set debug flag
    this.debug = 'debug' in options && options.debug === true;
}

/**
 * Adds an event listener.
 *
 * @param  {String}   eventName  An event name
 * @param  {Function} callback   An event handler function
 */
Gettext.prototype.on = function(eventName, callback) {
    this.listeners.push({
        eventName: eventName,
        callback: callback
    });
};

/**
 * Removes an event listener.
 *
 * @param  {String}   eventName  An event name
 * @param  {Function} callback   A previously registered event handler function
 */
Gettext.prototype.off = function(eventName, callback) {
    this.listeners = this.listeners.filter(function(listener) {
        return (
            listener.eventName === eventName &&
            listener.callback === callback
        ) === false;
    });
};

/**
 * Emits an event to all registered event listener.
 *
 * @private
 * @param  {String} eventName  An event name
 * @param  {any}    eventData  Data to pass to event listeners
 */
Gettext.prototype.emit = function(eventName, eventData) {
    for (var i = 0; i < this.listeners.length; i++) {
        var listener = this.listeners[i];
        if (listener.eventName === eventName) {
            listener.callback(eventData);
        }
    }
};

/**
 * Logs a warning to the console if debug mode is enabled.
 *
 * @ignore
 * @param  {String} message  A warning message
 */
Gettext.prototype.warn = function(message) {
    if (this.debug) {
        console.warn(message);
    }

    this.emit('error', new Error(message));
};

/**
 * Stores a set of translations in the set of gettext
 * catalogs.
 *
 * @example
 *     gt.addTranslations('sv-SE', 'messages', translationsObject)
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
 * @example
 *     gt.setLocale('sv-SE')
 *
 * @param {String} locale  A locale
 */
Gettext.prototype.setLocale = function(locale) {
    if (typeof locale !== 'string') {
        this.warn(
            'You called setLocale() with an argument of type ' + (typeof locale) + '. ' +
            'The locale must be a string.'
        );
        return;
    }

    if (locale.trim() === '') {
        this.warn('You called setLocale() with an empty value, which makes little sense.');
    }

    if (locale !== this.sourceLocale && !this.catalogs[locale]) {
        this.warn('You called setLocale() with "' + locale + '", but no translations for that locale has been added.');
    }

    this.locale = locale;
};

/**
 * Sets the default gettext domain.
 *
 * @example
 *     gt.setTextDomain('domainname')
 *
 * @param {String} domain  A gettext domain name
 */
Gettext.prototype.setTextDomain = function(domain) {
    if (typeof domain !== 'string') {
        this.warn(
            'You called setTextDomain() with an argument of type ' + (typeof domain) + '. ' +
            'The domain must be a string.'
        );
        return;
    }

    if (domain.trim() === '') {
        this.warn('You called setTextDomain() with an empty `domain` value.');
    }

    this.domain = domain;
};

/**
 * Translates a string using the default textdomain
 *
 * @example
 *     gt.gettext('Some text')
 *
 * @param  {String} msgid  String to be translated
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.gettext = function(msgid) {
    return this.dnpgettext(this.domain, '', msgid);
};

/**
 * Translates a string using a specific domain
 *
 * @example
 *     gt.dgettext('domainname', 'Some text')
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
 * @example
 *     gt.ngettext('One thing', 'Many things', numberOfThings)
 *
 * @param  {String} msgid        String to be translated when count is not plural
 * @param  {String} msgidPlural  String to be translated when count is plural
 * @param  {Number} count        Number count for the plural
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.ngettext = function(msgid, msgidPlural, count) {
    return this.dnpgettext(this.domain, '', msgid, msgidPlural, count);
};

/**
 * Translates a plural string using a specific textdomain
 *
 * @example
 *     gt.dngettext('domainname', 'One thing', 'Many things', numberOfThings)
 *
 * @param  {String} domain       A gettext domain name
 * @param  {String} msgid        String to be translated when count is not plural
 * @param  {String} msgidPlural  String to be translated when count is plural
 * @param  {Number} count        Number count for the plural
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.dngettext = function(domain, msgid, msgidPlural, count) {
    return this.dnpgettext(domain, '', msgid, msgidPlural, count);
};

/**
 * Translates a string from a specific context using the default textdomain
 *
 * @example
 *    gt.pgettext('sports', 'Back')
 *
 * @param  {String} msgctxt  Translation context
 * @param  {String} msgid    String to be translated
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.pgettext = function(msgctxt, msgid) {
    return this.dnpgettext(this.domain, msgctxt, msgid);
};

/**
 * Translates a string from a specific context using s specific textdomain
 *
 * @example
 *     gt.dpgettext('domainname', 'sports', 'Back')
 *
 * @param  {String} domain   A gettext domain name
 * @param  {String} msgctxt  Translation context
 * @param  {String} msgid    String to be translated
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.dpgettext = function(domain, msgctxt, msgid) {
    return this.dnpgettext(domain, msgctxt, msgid);
};

/**
 * Translates a plural string from a specific context using the default textdomain
 *
 * @example
 *     gt.npgettext('sports', 'Back', '%d backs', numberOfBacks)
 *
 * @param  {String} msgctxt      Translation context
 * @param  {String} msgid        String to be translated when count is not plural
 * @param  {String} msgidPlural  String to be translated when count is plural
 * @param  {Number} count        Number count for the plural
 * @return {String} Translation or the original string if no translation was found
 */
Gettext.prototype.npgettext = function(msgctxt, msgid, msgidPlural, count) {
    return this.dnpgettext(this.domain, msgctxt, msgid, msgidPlural, count);
};

/**
 * Translates a plural string from a specifi context using a specific textdomain
 *
 * @example
 *     gt.dnpgettext('domainname', 'sports', 'Back', '%d backs', numberOfBacks)
 *
 * @param  {String} domain       A gettext domain name
 * @param  {String} msgctxt      Translation context
 * @param  {String} msgid        String to be translated
 * @param  {String} msgidPlural  If no translation was found, return this on count!=1
 * @param  {Number} count        Number count for the plural
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
    else if (!this.sourceLocale || this.locale !== this.sourceLocale) {
        this.warn('No translation was found for msgid "' + msgid + '" in msgctxt "' + msgctxt + '" and domain "' + domain + '"');
    }

    return defaultTranslation;
};

/**
 * Retrieves comments object for a translation. The comments object
 * has the shape `{ translator, extracted, reference, flag, previous }`.
 *
 * @example
 *     const comment = gt.getComment('domainname', 'sports', 'Backs')
 *
 * @private
 * @param  {String} domain   A gettext domain name
 * @param  {String} msgctxt  Translation context
 * @param  {String} msgid    String to be translated
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
 * @private
 * @param  {String} domain   A gettext domain name
 * @param  {String} msgctxt  Translation context
 * @param  {String} msgid    String to be translated
 * @return {Object} Translation object or false if not found
 */
Gettext.prototype._getTranslation = function(domain, msgctxt, msgid) {
    msgctxt = msgctxt || '';

    return get(this.catalogs, [this.locale, domain, 'translations', msgctxt, msgid]);
};

/**
 * Returns the language code part of a locale
 *
 * @example
 *     Gettext.getLanguageCode('sv-SE')
 *     // -> "sv"
 *
 * @private
 * @param   {String} locale  A case-insensitive locale string
 * @returns {String} A language code
 */
Gettext.getLanguageCode = function(locale) {
    return locale.split(/[\-_]/)[0].toLowerCase();
};

/* C-style aliases */

/**
 * C-style alias for [setTextDomain](#gettextsettextdomaindomain)
 *
 * @see Gettext#setTextDomain
 */
Gettext.prototype.textdomain = function(domain) {
    if (this.debug) {
        console.warn('textdomain(domain) was used to set locales in node-gettext v1. ' +
            'Make sure you are using it for domains, and switch to setLocale(locale) if you are not.\n\n ' +
            'To read more about the migration from node-gettext v1 to v2, ' +
            'see https://github.com/alexanderwallin/node-gettext/#migrating-from-1x-to-2x\n\n' +
            'This warning will be removed in the final 2.0.0');
    }

    this.setTextDomain(domain);
};

/**
 * C-style alias for [setLocale](#gettextsetlocalelocale)
 *
 * @see Gettext#setLocale
 */
Gettext.prototype.setlocale = function(locale) {
    this.setLocale(locale);
};

/* Deprecated functions */

/**
 * This function will be removed in the final 2.0.0 release.
 *
 * @deprecated
 */
Gettext.prototype.addTextdomain = function() {
    console.error('addTextdomain() is deprecated.\n\n' +
        '* To add translations, use addTranslations()\n' +
        '* To set the default domain, use setTextDomain() (or its alias textdomain())\n' +
        '\n' +
        'To read more about the migration from node-gettext v1 to v2, ' +
        'see https://github.com/alexanderwallin/node-gettext/#migrating-from-1x-to-2x');
};
