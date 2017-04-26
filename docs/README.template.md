
<p align="center">
 <img src="https://raw.githubusercontent.com/alexanderwallin/node-gettext/master/docs/node-gettext-logo.png" width="160" height="160" />
</p>

<h1 align="center">
 node-gettext
</h1>

[![Build Status](https://travis-ci.org/alexanderwallin/node-gettext.svg?branch=master)](http://travis-ci.org/alexanderwallin/node-gettext)
[![npm version](https://badge.fury.io/js/node-gettext.svg)](https://badge.fury.io/js/node-gettext)

**`node-gettext`** is a JavaScript implementation of (a large subset of) [gettext](https://www.gnu.org/software/gettext/gettext.html), a localization framework originally written in C.

If you just want to parse or compile mo/po files, for use with this library or elsewhere, check out [gettext-parser](https://github.com/smhg/gettext-parser).

**NOTE:** This is the README for v2 of node-gettext, which introduces several braking changes. You can find the [README for v1 here](https://github.com/alexanderwallin/node-gettext/blob/master/docs/v1/README.md).

* [Features](#features)
  * [Differences from GNU gettext](#differences-from-gnu-gettext)
* [Installation](#installation)
* [Usage](#usage)
  * [Error events](#error-events)
  * [Recipes](#recipes)
* [API](#api)
* [Migrating from v1 to v2](#migrating-from-v1-to-v2)
* [License](#license)
* [See also](#see-also)


## Features

* Supports domains, contexts and plurals
* Supports .json, .mo and .po files with the help of [gettext-parser](https://github.com/smhg/gettext-parser)
* Ships with plural forms for 136 languages
* Change locale or domain on the fly
* Useful error messages enabled by a `debug` option
* Emits events for internal errors, such as missing translations


### Differences from GNU gettext

There are two main differences between `node-gettext` and GNU's gettext:

1. **There are no categories.** GNU gettext features [categories such as `LC_MESSAGES`, `LC_NUMERIC` and `LC_MONETARY`](https://www.gnu.org/software/gettext/manual/gettext.html#Locale-Environment-Variables), but since there already is a plethora of great JavaScript libraries to deal with numbers, currencies, dates etc, `node-gettext` is simply targeted towards strings/phrases. You could say it just assumes the `LC_MESSAGES` category at all times.
2. **You have to read translation files from the file system yourself.** GNU gettext is a C library that reads files from the file system. This is done using `bindtextdomain(domain, localesDirPath)` and `setlocale(category, locale)`, where these four parameters combined are used to read the appropriate translations file.

  However, since `node-gettext` needs to work both on the server in web browsers (which usually is referred to as it being *universal* or *isomorphic* JavaScript), it is up to the developer to read translation files from disk or somehow provide it with translations as pure JavaScript objects using [`addTranslations(locale, domain, translations)`](#gettextsetlocalelocale).

  `bindtextdomain` will be provided as an optional feature in a future release.


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

### Recipes

#### Load and add translations from .mo or .po files

`node-gettext` expects all translations to be in the format specified by [`gettext-parser`](https://github.com/smhg/gettext-parser). Therefor, you should use that to parse .mo or .po files.

Here is an example where we read a bunch of translation files from disk and add them to our `Gettext` instance:

```js
import fs from 'fs'
import path from 'path'
import Gettext from 'node-gettext'
import { po } from 'gettext-parser'

// In this example, our translations are found at
// path/to/locales/LOCALE/DOMAIN.po
const translationsDir = 'path/to/locales'
const locales = ['en', 'fi-FI', 'sv-SE']
const domain = 'messages'

const gt = new Gettext()

locales.forEach((locale) => {
    const fileName = `${domain}.po`
    const translationsFilePath = path.join(translationsDir, locale, filename)
    const translationsContent = fs.readSync(translationsFilePath)

    const parsedTranslations = po.parse(translationsContent)
    gt.addTranslations(locale, domain, parsedTranslations)
})
```


## API

{{>main}}


## Migrating from v1 to v2

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


## License

MIT


## See also

* [gettext-parser](https://github.com/smhg/gettext-parser) - Parsing and compiling gettext translations between .po/.mo files and JSON
* [react-gettext-parser](https://github.com/lagetse/react-gettext-parser) - Extracting gettext translatable strings from JS(X) code
* [narp](https://github.com/lagetse/narp) - Workflow CLI tool that syncs translations between your app and Transifex
