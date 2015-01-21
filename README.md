# node-gettext

**node-gettext** is a Node.JS module to use .MO and .PO files.

**NB!** If you just want to parse or compile mo/po files, check out [gettext-parser](https://github.com/andris9/gettext-parser).

## Features

  * Load binary *MO* or source *PO* files
  * Supports contexts and plurals

[![Build Status](https://secure.travis-ci.org/andris9/node-gettext.png)](http://travis-ci.org/andris9/node-gettext)

## Support node-gettext development

[![Donate to author](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=DB26KWR2BQX5W)

## Installation

    npm install node-gettext

## Usage

### Create a new Gettext object

    var Gettext = require("node-gettext");

    var gt = new Gettext();

### Add a language

*addTextdomain(domain, file)*

Language data needs to be in the Buffer format - it can be either contents of a *MO* or *PO* file.

*addTextdomain(domain[, fileContents])*

Load from a *MO* file

    var fileContents = fs.readFileSync("et.mo");
    gt.addTextdomain("et", fileContents);

or load from a *PO* file

    var fileContents = fs.readFileSync("et.po");
    gt.addTextdomain("et", fileContents);

If you do not include the file contents, then a blank language template object
is created which can be edited with *setTranslation*, *deleteTranslation* methods etc.

Plural rules are automatically detected from the language code

    gt.addTextdomain("et");
    gt.setTranslation("et", false, "hello!", "tere!");

### Check or change default language

*textdomain(domain)*

    gt.textdomain("et");

The function also returns the current texdomain value

    var curlang = gt.textdomain();

## Translation methods

### Load a string from default language file

*gettext(msgid)*

    var greeting = gt.gettext("Hello!");

### Load a string from a specific language file

*dgettext(domain, msgid)*

    var greeting = gt.dgettext("et", "Hello!");

### Load a plural string from default language file

*ngettext(msgid, msgid_plural, count)*

    gt.ngettext("%d Comment", "%d Comments", 10);

### Load a plural string from a specific language file

*dngettext(domain, msgid, msgid_plural, count)*

    gt.dngettext("et", "%d Comment", "%d Comments", 10)

### Load a string of a specific context

*pgettext(msgctxt, msgid)*

    gt.pgettext("menu items", "File");

### Load a string of a specific context from specific language file

*dpgettext(domain, msgctxt, msgid)*

    gt.dpgettext("et", "menu items", "File");

### Load a plural string of a specific context

*npgettext(msgctxt, msgid, msgid_plural, count)*

    gt.npgettext("menu items", "%d Recent File", "%d Recent Files", 3);

### Load a plural string of a specific context from specific language file

*dnpgettext(domain, msgctxt, msgid, msgid_plural, count)*

    gt.dnpgettext("et", "menu items", "%d Recent File", "%d Recent Files", 3);

### Get comments for a translation (if loaded from PO)

*getComment(domain, msgctxt, msgid)*

    gt.getComment("et", "menu items", "%d Recent File");

Returns an object in the form of `{translator: "", extracted: "", reference: "", flag: "", previous: ""}`

## Advanced handling

If you need the translation object for a domain, for example `et_EE`, you can access it from `gt.domains.et_EE`.

If you want modify it and compile it to *mo* or *po*, checkout [gettext-parser](https://github.com/andris9/gettext-parser) module.

## License

MIT
