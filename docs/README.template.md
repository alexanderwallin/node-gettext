
<p align="center">
 <img src="docs/node-gettext-logo.png" width="160" height="160" />
</p>

<h1 align="center">
 node-gettext
</h1>

[![Build Status](https://travis-ci.org/alexanderwallin/node-gettext.svg?branch=master)](http://travis-ci.org/alexanderwallin/node-gettext)
[![npm version](https://badge.fury.io/js/node-gettext.svg)](https://badge.fury.io/js/node-gettext)

**`node-gettext`** is a JavaScript implementation of [gettext](https://www.gnu.org/software/gettext/gettext.html), a localization framework.

If you just want to parse or compile mo/po files, check out [gettext-parser](https://github.com/smhg/gettext-parser).

**NOTE:** This is the README for v2 of node-gettext, which introduces many braking changes and is currently in alpha. You can find the [README for v1 here](https://github.com/alexanderwallin/node-gettext/blob/master/docs/v1/README.md).

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [Migrating from v1 to v2](#migrating-from-v1-to-v2)
* [API](#api)
* [License](#license)
* [See also](#see-also)


## Features

* Supports domains, contexts and plurals
* Supports .json, .mo and .po files with the help of [gettext-parser](https://github.com/smhg/gettext-parser)
* Ships with plural forms for 136 languages
* Change locale or domain on the fly
* Useful error messages enabled by a `debug` option
* Emits events for internal errors, such as missing translations


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

### Error events

```js
// Add translations etc...

gt.on('error', error => console.log('oh nose', error))
gt.gettext('An unrecognized message')
// -> 'oh nose', 'An unrecognized message'
```


## Migrating from v1 to v2

Version 1 of `node-gettext` confused domains with locales, which version 2 has corrected. `node-gettext` also no longer parses files or file paths for you, but accepts only ready-parsed JSON translation objects.

Here is a full list of all breaking changes:

* `textdomain(domain)` is now `setLocale(locale)`
* `dgettext`, `dngettext`, `dpgettext` and `dnpgettext` does not treat the leading `domain` argument as a locale, but as a domain. To get a translation from a certain locale you need to call `setLocale(locale)` beforehand.
* A new `setTextDomain(domain)` has been introduced
* `addTextdomain(domain, file)` is now `addTranslations(locale, domain, translations)`
* `addTranslations(locale, domain, translations)` **only accepts a JSON object with the [shape described in the `gettext-parser` README](https://github.com/smhg/gettext-parser#data-structure-of-parsed-mopo-files)**. To load translations from .mo or .po files, use [gettext-parser](https://github.com/smhg/gettext-parser), and it will provide you with valid JSON objects.
* `_currentDomain` is now `domain`
* `domains` is now `catalogs`
* The instance method `__normalizeDomain(domain)` has been replaced by a static method `Gettext.getLanguageCode(locale)`


## API

{{>main}}


## License

MIT


## See also

* [gettext-parser](https://github.com/smhg/gettext-parser) - Parsing and compiling gettext translations between .po/.mo files and JSON
* [react-gettext-parser](https://github.com/lagetse/react-gettext-parser) - Extracting gettext translatable strings from JS(X) code
* [narp](https://github.com/lagetse/narp) - Workflow CLI tool that syncs translations between your app and Transifex
