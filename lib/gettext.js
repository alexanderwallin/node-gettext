'use strict';

var plurals = require('./plurals');
var gettextParser = require('gettext-parser');

module.exports = Gettext;

var _cache = {};

function cacheFile(locale, filename, file) {
    if (!_cache[locale])
        _cache[locale] = {};
    _cache[locale][filename] = file;
}

function tryCache(locale, filename) {
    if (!_cache[locale])
        return undefined;
    return _cache[locale][filename];
}

/**
 * Gettext function
 *
 * @constructor
 */
function Gettext() {
    this.domains = {};
    this._locale = 'en_US';
    this._currentDomain = false;

    // default plurals to EN rules
    this._pluralsInfo = plurals.en;
    this._pluralsFunc = plurals.en.pluralsFunc;
}

function normalizeLocale(locale, isShort) {
    var parts = (locale || '').toString().split('.').shift().split(/[\-_]/);
    var language = (parts.shift() || '').toLowerCase();
    var country = (parts.join('-') || '').toUpperCase();

    if (isShort) {
        return language;
    } else {
        return [].concat(language || []).concat(country || []).join('_');
    }
}

/**
 * Set the locale of this gettext instance, and loads relevant plural rules.
 */
Gettext.prototype.setlocale = function(locale) {
    this._locale = locale;

    // We do not want to parse and compile stuff from unknown sources
    // so we only use precompiled plural definitions
    var pluralsInfo = plurals[normalizeLocale(locale, true)];
    if (pluralsInfo) {
        this._pluralsInfo = pluralsInfo;
        this._pluralsFunc = this._pluralsInfo.pluralsFunc;
    }
}

/**
 * Adds a gettext to the domains list. If default textdomain is not set, uses it
 * as default
 *
 * @param {String} domain gettext domain
 * @param {Buffer} fileContents Translations file (*.mo) contents as a Buffer object
 */
Gettext.prototype.addTextdomain = function(domain, file) {
    var translation;

    if (file && file.translations) {
        translation = file;
    } else if (file && typeof file !== 'string') {
        translation = gettextParser.mo.parse(file, 'utf-8');
    }

    if (!translation) {
        translation = gettextParser.po.parse(file || '', 'utf-8');
    }

    if (translation.headers)
        translation.headers['plural-forms'] = this._pluralsInfo.pluralsText;

    this.domains[domain] = translation;

    if (!this._currentDomain) {
        this._currentDomain = domain;
    }
};

/**
 * Adds a gettext domain to the domains list, loading it from the disk
 *
 * @param {String} domain gettext domain
 * @param {String} filename Translations file name
 */
Gettext.prototype.loadTextdomain = function(domain, filename) {
    var file;
    if ((file = tryCache(this._locale, filename)) !== undefined)
        return this.addTextdomain(domain, file);

    // lazy require fs so that the module works in the browser too
    var fs = require('fs');
    file = fs.readFileSync(filename);
    this.addTextdomain(domain, file);

    // use the parsed version of the file in the cache (it's more
    // efficient)
    cacheFile(this._locale, filename, this.domains[domain]);
};

/**
 * Adds a gettext domain to the domains list, loading it from a directory
 * of files named as $locale.mo, eg it.mo or en_GB.mo
 * This corresponds to the "uninstalled" layout of gettext files, with all
 * files for one domain in one place, usually together with the code.
 * OTOH, the installed layout is /usr/share/$locale/LC_MESSAGES/$domain.mo
 *
 * @param {String} domain gettext domain
 * @param {String} modir directory containing translation (*.mo) files
 */
Gettext.prototype.loadTextdomainDirectory = function(domain, modir) {
    var locale = this._locale.split(/[-_\.@]/);
    var mo = modir + '/' + locale.join('_') + '.mo';

    // lazy require fs so that the module works in the browser too
    var fs = require('fs');
    while (!fs.existsSync(mo) && locale.length) {
        locale.pop();
        mo = modir + '/' + locale.join('_') + '.mo';
    }
    this.loadTextdomain(domain, mo);
}


/**
 * Changes the current default textdomain
 *
 * @param {String} [domain] gettext domain
 * @return {String} cuurent textdomain
 */
Gettext.prototype.textdomain = function(updatedDomain) {
    if (!arguments.length) {
        return this._currentDomain;
    }

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
 * @param {String} domain gettext domain
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
 * @param {String} domain gettext domain
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
 * @param {String} domain gettext domain
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
 * @param {String} domain gettext domain
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

    msgctxt = msgctxt || '';

    if (!isNaN(count) && count !== 1) {
        defaultTranslation = msgidPlural || msgid;
    }

    translation = this._getTranslation(domain, msgctxt, msgid);
    if (translation) {
        if (typeof count === 'number') {
            index = this._pluralsFunc(count);
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
 * @param {String} domain gettext domain
 * @param {String} msgctxt Translation context
 * @param {String} msgid String to be translated
 * @return {Object} comments object or false if not found
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
 * @param {String} domain gettext domain
 * @param {String} msgctxt Translation context
 * @param {String} msgid String to be translated
 * @return {Object} translation object or false if not found
 */
Gettext.prototype._getTranslation = function(domain, msgctxt, msgid) {
    var translation;

    msgctxt = msgctxt || '';

    if (this.domains.hasOwnProperty(domain)) {
        if (this.domains[domain].translations && this.domains[domain].translations[msgctxt]) {
            if ((translation = this.domains[domain].translations[msgctxt][msgid])) {
                return translation;
            }
        }
    }

    return false;
};
