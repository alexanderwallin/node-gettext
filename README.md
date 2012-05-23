# node-gettext

**node-gettext** is a Node.JS module to use .MO files.

## Features

  * Load binary *MO* files
  * Supports contexts and plurals
  * Add your own translations to the list
  * Compile current translation table into a *MO* or a *PO* file!

[![Build Status](https://secure.travis-ci.org/andris9/node-gettext.png)](http://travis-ci.org/andris9/node-gettext)

## Support node-gettext development

[![Donate to author](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=DB26KWR2BQX5W)

## Installation

    npm install node-gettext

## Usage

### Create a new Gettext object

    var Gettext = require("node-gettext");

    var gt = new Gettext();
    
### Add a language - addTextdomain(domain, file)

Language data needs to be file contents in the Buffer format

*addTextdomain(domain[, file_contents])*

    var file_contents = fs.readFileSync("et.mo");
    gt.addTextdomain("et", file_contents);

### Check or change default language

*textdomain(domain)*

    gt.textdomain("et");

The function also returns the current texdomain value

    var curlang = gt.textdomain();

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

## String helpers

In order to make things really easy, it is possible to attach the gettext functions directly to string
prototypes with `gettext.registerStringHelpers()`

Example:

    // setup gettext
    var gettext = new Gettext();
    gettext.registerStringHelpers();
    gettext.addTextdomain("et", fs.readFileSync("et.mo"));

    // translate any string
    var translated = "translate this string".gettext();
    // or
    var plural = "translate %s string".ngettext("translate %s strings", 10);

    // you can even change the default textdomain
    "".textdomain("en");

The parameters for the gettext functions are the same as with regular gettext objects, except that the `msgid` parameter is not needed.

### Add a translation

*setTranslation(domain, context, msgid, translation)*

    gt.setTranslation("et", "", "Hello", "Tere");

### Remove a translation

*deleteTranslation(domain, context, msgid, translation)*

    gt.setTranslation("et", "", "Hello", "Tere");

### Compile

Compile current translation table to a MO file

*compileMO([domain])*

    fs.writeFile("out.mo", gt.compileMO("et")); 

Compile current translation table to a PO file

*compilePO([domain])*

    fs.writeFile("out.po", gt.compilePO("et"));

## License

MIT