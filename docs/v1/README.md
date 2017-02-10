# node-gettext

[![Build Status](https://secure.travis-ci.org/alexanderwallin/node-gettext.png)](http://travis-ci.org/alexanderwallin/node-gettext)
[![npm version](https://badge.fury.io/js/node-gettext.svg)](https://badge.fury.io/js/node-gettext)

**node-gettext** is a Node.JS module to use .MO and .PO files.

**NB!** If you just want to parse or compile mo/po files, check out [gettext-parser](https://github.com/andris9/gettext-parser).

## Features

  * Load binary *MO* or source *PO* files
  * Supports contexts and plurals

## Installation

```sh
npm install node-gettext
```

## Usage

### Create a new Gettext object

```js
var Gettext = require("node-gettext");

var gt = new Gettext();
```

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

## Advanced handling

If you need the translation object for a domain, for example `et_EE`, you can access it from `gt.domains.et_EE`.

If you want modify it and compile it to *mo* or *po*, checkout [gettext-parser](https://github.com/andris9/gettext-parser) module.

## License

MIT
