
<p align="center">
 <img src="http://alexanderwallin.com/download/node-gettext-logo.png" width="160" height="160" />
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

### Gettext(options)

* `options`
  * `debug` - Prints warning messages to the console if set to `true`. Defaults to `false`.

### Add a language

*addTextdomain(domain, file)*

Language data needs to be in the Buffer format - it can be either contents of a *MO* or *PO* file.

*addTextdomain(domain[, fileContents])*

Load from a *MO* file

```js
var fileContents = fs.readFileSync("et.mo");
gt.addTextdomain("et", fileContents);
```

or load from a *PO* file

```js
var fileContents = fs.readFileSync("et.po");
gt.addTextdomain("et", fileContents);
```

Plural rules are automatically detected from the language code

```js
gt.addTextdomain("et");
gt.setTranslation("et", false, "hello!", "tere!");
```

### Check or change default language

*textdomain(domain)*

```js
gt.textdomain("et");
```

The function also returns the current texdomain value

```js
var curlang = gt.textdomain();
```

## Translation methods

### Load a string from default language file

*gettext(msgid)*

```js
var greeting = gt.gettext("Hello!");
```

### Load a string from a specific language file

*dgettext(domain, msgid)*

```js
var greeting = gt.dgettext("et", "Hello!");
```

### Load a plural string from default language file

*ngettext(msgid, msgid_plural, count)*

```js
gt.ngettext("%d Comment", "%d Comments", 10);
```

### Load a plural string from a specific language file

*dngettext(domain, msgid, msgid_plural, count)*

```js
gt.dngettext("et", "%d Comment", "%d Comments", 10);
```

### Load a string of a specific context

*pgettext(msgctxt, msgid)*

```js
gt.pgettext("menu items", "File");
```

### Load a string of a specific context from specific language file

*dpgettext(domain, msgctxt, msgid)*

```js
gt.dpgettext("et", "menu items", "File");
```

### Load a plural string of a specific context

*npgettext(msgctxt, msgid, msgid_plural, count)*

```js
gt.npgettext("menu items", "%d Recent File", "%d Recent Files", 3);
```

### Load a plural string of a specific context from specific language file

*dnpgettext(domain, msgctxt, msgid, msgid_plural, count)*

```js
gt.dnpgettext("et", "menu items", "%d Recent File", "%d Recent Files", 3);
```

### Get comments for a translation (if loaded from PO)

*getComment(domain, msgctxt, msgid)*

```js
gt.getComment("et", "menu items", "%d Recent File");
```

Returns an object in the form of `{translator: "", extracted: "", reference: "", flag: "", previous: ""}`


## License

MIT


## See also

* [gettext-parser](https://github.com/andris9/gettext-parser) - Parsing and compiling gettext translations between .po/.mo files and JSON
* [react-gettext-parser](https://github.com/lagetse/react-gettext-parser) - Extracting gettext translatable strings from JS(X) code
* [narp](https://github.com/lagetse/narp) - Workflow CLI tool that syncs translations between your app and Transifex
