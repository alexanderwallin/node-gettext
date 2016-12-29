
<p align="center">
 <img src="docs/node-gettext-logo.png" width="160" height="160" />
</p>

<h1 align="center">
 node-gettext
</h1>

[![Build Status](https://travis-ci.org/alexanderwallin/node-gettext.svg?branch=master)](http://travis-ci.org/alexanderwallin/node-gettext)
[![npm version](https://badge.fury.io/js/node-gettext.svg)](https://badge.fury.io/js/node-gettext)

**`node-gettext`** is a JavaScript implementation of [gettext](https://www.gnu.org/software/gettext/gettext.html).

If you just want to parse or compile mo/po files, check out [gettext-parser](https://github.com/andris9/gettext-parser).

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [API](#api)
* [License](#license)
* [See also](#see-also)


## Features

* Supports domains, contexts and plurals
* Supports JSON, .mo and .po files with the help of [gettext-parser](https://github.com/andris9/gettext-parser)
* Ships with plural forms for 136 languages
* Change locale or domain on the fly
* Useful error messages enabled by a `debug` option
* **Events** Subscribe and unsubscribe to internal error events, such as missing translations
* **File I/O** Load, parse and add translations from file paths
* **File I/O** Load, parse and add translations from locale and domain names, using a file path pattern
* **File I/O** Supports .mo and .po files (using [gettext-parser](https://github.com/andris9/gettext-parser))


## Installation

```sh
npm install --save node-gettext
```


## Usage

```js
import Gettext from 'node-gettext'
import swedishTranslations from './translations/sv-SE.json'

const gt = new Gettext()
gt.addTranslations('sv-SE', 'messages', swedishTranslations)
gt.setLocale('sv-SE')

gt.gettext('The world is a funny place')
// -> "Världen är en underlig plats"
```

### Events extension

```js
import Gettext from 'node-gettext'
import withGettextEvents from 'node-gettext/events'

const EnhancedGettext = withGettextEvents(Gettext)
const gt = new EnhancedGettext()
// Add translations here...

// We can now subscribe to 'error' events
gt.on('error', error => console.log('oh nose'))

// This will nog log "oh nose" to the console
gt.gettext('An unrecognized message')
```

### File I/O helpers extension

```js
import Gettext from 'node-gettext'
import withFileIOHelpers from 'node-gettext/io'

const EnhancedGettext = withFileIOHelpers(Gettext)
const gt = new EnhancedGettext()

// We can now load translations by providing file paths
gt.addTranslationsFromFile('sv-SE', './path/to/translations.mo', 'messages')
```


## Migrating from 1.x to 2.x

Version 1.x of `node-gettext` confused domains with locales, which version 2 has corrected. This contains the following breaking changes:

* `textdomain(domain)` is now `setLocale(locale)`
* `dgettext`, `dngettext`, `dpgettext` and `dnpgettext` does not treat the leading `domain` argument as a locale, but as a domain. To get a translation from a certain locale you need to call `setLocale(locale)` beforehand.
* A new `setTextDomain(domain)` has been introduced

On top of that there a couple of more breaking changes to be aware of:

* `addTextdomain(domain, file)` is now `addTranslations(locale, domain, translations)`
* `addTranslations(locale, domain, translations)` only accepts a JSON object with the [shape described in the `gettext-parser` README](https://github.com/smhg/gettext-parser#data-structure-of-parsed-mopo-files). To load translations from .mo or .po files, use the `node-gettext/io` extension.
* `_currentDomain` is now `domain`
* `domains` is now `catalogs`
* The instance method `__normalizeDomain(domain)` has been replaced by a static method `Gettext.getLanguageCode(locale)`


## API

<a name="Gettext"></a>

## Gettext
<a name="new_Gettext_new"></a>

### new Gettext(options)
Creates and returns a new Gettext instance.

**Returns**: <code>Object</code> - A Gettext instance  
**Params**

- `options`: <code>Object</code> - A set of options
    - `.debug`: <code>Boolean</code> - Whether to output debug info into the
                                 console.

<a name="Gettext+addTranslations"></a>

### gettext.addTranslations(locale, domain, translations)
Stores a set of translations in the set of gettext
catalogs.

**Params**

- `locale`: <code>String</code> - A locale string
- `domain`: <code>String</code> - A domain name
- `translations`: <code>Object</code> - An object of gettext-parser JSON shape

**Example**  
```js
gt.addTranslations('sv-SE', 'messages', translationsObject)
```
<a name="Gettext+setLocale"></a>

### gettext.setLocale(locale)
Sets the locale to get translated messages for.

**Params**

- `locale`: <code>String</code> - A locale

**Example**  
```js
gt.setLocale('sv-SE')
```
<a name="Gettext+setTextDomain"></a>

### gettext.setTextDomain(domain)
Sets the default gettext domain.

**Params**

- `domain`: <code>String</code> - A gettext domain name

**Example**  
```js
gt.setTextDomain('domainname')
```
<a name="Gettext+gettext"></a>

### gettext.gettext(msgid) ⇒ <code>String</code>
Translates a string using the default textdomain

**Returns**: <code>String</code> - Translation or the original string if no translation was found  
**Params**

- `msgid`: <code>String</code> - String to be translated

**Example**  
```js
gt.gettext('Some text')
```
<a name="Gettext+dgettext"></a>

### gettext.dgettext(domain, msgid) ⇒ <code>String</code>
Translates a string using a specific domain

**Returns**: <code>String</code> - Translation or the original string if no translation was found  
**Params**

- `domain`: <code>String</code> - A gettext domain name
- `msgid`: <code>String</code> - String to be translated

**Example**  
```js
gt.dgettext('domainname', 'Some text')
```
<a name="Gettext+ngettext"></a>

### gettext.ngettext(msgid, msgidPlural, count) ⇒ <code>String</code>
Translates a plural string using the default textdomain

**Returns**: <code>String</code> - Translation or the original string if no translation was found  
**Params**

- `msgid`: <code>String</code> - String to be translated
- `msgidPlural`: <code>String</code> - If no translation was found, return this on count!=1
- `count`: <code>Number</code> - Number count for the plural

**Example**  
```js
gt.ngettext('One thing', 'Many things', numberOfThings)
```
<a name="Gettext+dngettext"></a>

### gettext.dngettext(domain, msgid, msgidPlural, count) ⇒ <code>String</code>
Translates a plural string using a specific textdomain

**Returns**: <code>String</code> - Translation or the original string if no translation was found  
**Params**

- `domain`: <code>String</code> - A gettext domain name
- `msgid`: <code>String</code> - String to be translated
- `msgidPlural`: <code>String</code> - If no translation was found, return this on count!=1
- `count`: <code>Number</code> - Number count for the plural

**Example**  
```js
gt.dngettext('domainname', 'One thing', 'Many things', numberOfThings)
```
<a name="Gettext+pgettext"></a>

### gettext.pgettext(msgctxt, msgid) ⇒ <code>String</code>
Translates a string from a specific context using the default textdomain

**Returns**: <code>String</code> - Translation or the original string if no translation was found  
**Params**

- `msgctxt`: <code>String</code> - Translation context
- `msgid`: <code>String</code> - String to be translated

**Example**  
```js
gt.pgettext('sports', 'Back')
```
<a name="Gettext+dpgettext"></a>

### gettext.dpgettext(domain, msgctxt, msgid) ⇒ <code>String</code>
Translates a string from a specific context using s specific textdomain

**Returns**: <code>String</code> - Translation or the original string if no translation was found  
**Params**

- `domain`: <code>String</code> - A gettext domain name
- `msgctxt`: <code>String</code> - Translation context
- `msgid`: <code>String</code> - String to be translated

**Example**  
```js
gt.dpgettext('domainname', 'sports', 'Back')
```
<a name="Gettext+npgettext"></a>

### gettext.npgettext(msgctxt, msgid, msgidPlural, count) ⇒ <code>String</code>
Translates a plural string from a specific context using the default textdomain

**Returns**: <code>String</code> - Translation or the original string if no translation was found  
**Params**

- `msgctxt`: <code>String</code> - Translation context
- `msgid`: <code>String</code> - String to be translated
- `msgidPlural`: <code>String</code> - If no translation was found, return this on count!=1
- `count`: <code>Number</code> - Number count for the plural

**Example**  
```js
gt.npgettext('sports', 'Back', '%d backs', numberOfBacks)
```
<a name="Gettext+dnpgettext"></a>

### gettext.dnpgettext(domain, msgctxt, msgid, msgidPlural, count) ⇒ <code>String</code>
Translates a plural string from a specifi context using a specific textdomain

**Returns**: <code>String</code> - Translation or the original string if no translation was found  
**Params**

- `domain`: <code>String</code> - A gettext domain name
- `msgctxt`: <code>String</code> - Translation context
- `msgid`: <code>String</code> - String to be translated
- `msgidPlural`: <code>String</code> - If no translation was found, return this on count!=1
- `count`: <code>Number</code> - Number count for the plural

**Example**  
```js
gt.dnpgettext('domainname', 'sports', 'Back', '%d backs', numberOfBacks)
```
<a name="Gettext+getComment"></a>

### gettext.getComment(domain, msgctxt, msgid) ⇒ <code>Object</code>
Retrieves comments object for a translation. The comments object
has the shape `{ translator, extracted, reference, flag, previous }`.

**Returns**: <code>Object</code> - Comments object or false if not found  
**Params**

- `domain`: <code>String</code> - A gettext domain name
- `msgctxt`: <code>String</code> - Translation context
- `msgid`: <code>String</code> - String to be translated

**Example**  
```js
const comment = gt.getComment('domainname', 'sports', 'Backs')
```
<a name="Gettext+addTextdomain"></a>

### ~~gettext.addTextdomain()~~
***Deprecated***

This function will be removed in the final 2.0.0 release.

<a name="Gettext+textdomain"></a>

### ~~gettext.textdomain()~~
***Deprecated***

This function will be removed in the final 2.0.0 release.

<a name="Gettext.getLanguageCode"></a>

### Gettext.getLanguageCode(locale) ⇒ <code>String</code>
Returns the language code part of a locale

**Returns**: <code>String</code> - A language code  
**Params**

- `locale`: <code>String</code> - A case-insensitive locale string

**Example**  
```js
Gettext.getLanguageCode('sv-SE')
    // -> "sv"
```

## License

MIT


## See also

* [gettext-parser](https://github.com/andris9/gettext-parser) - Parsing and compiling gettext translations between .po/.mo files and JSON
* [react-gettext-parser](https://github.com/lagetse/react-gettext-parser) - Extracting gettext translatable strings from JS(X) code
* [narp](https://github.com/lagetse/narp) - Workflow CLI tool that syncs translations between your app and Transifex
