var testCase = require('nodeunit').testCase,
    Gettext = require("../lib/gettext"),
    POParser = require("../lib/poparser"),
    fs = require("fs");
    
exports["UTF-8"] = {
    setUp: function (callback) {
        fs.readFile(__dirname+"/utf8.mo", (function(err, body){
            if(err){
                throw err;
            }
            this.g = new Gettext();
            this.g.addTextdomain("et", body);
            callback();
        }).bind(this));
    },
    "Simple string, default domain": function(test){
        test.equal(this.g.gettext("o1"), "t1");
        test.done();
    },
    "Simple string, nonexisting domain": function(test){
        this.g.textdomain("en");
        test.equal(this.g.gettext("o1"), "o1");
        test.done();
    },
    "Simple string, existing domain": function(test){
        this.g.textdomain("et");
        test.equal(this.g.gettext("o1"), "t1");
        test.done();
    },
    "Simple string with special chars": function(test){
        test.equal(this.g.gettext("o3-õäöü"), "t3-žš");
        test.done();
    },
    "dgettext": function(test){
        test.equal(this.g.dgettext("et", "o1"), "t1");
        test.equal(this.g.dgettext("en", "o1"), "o1");
        test.done();
    },
    "ngettext": function(test){
        test.equal(this.g.ngettext("o2-1", "a", 0), "t2-2");
        test.equal(this.g.ngettext("o2-1", "b", 1), "t2-1");
        test.equal(this.g.ngettext("o2-1", "c", 2), "t2-2");
        test.equal(this.g.ngettext("o2-1", "d", 3), "t2-2");
        test.done();
    },
    "dngettext": function(test){
        test.equal(this.g.dngettext("et", "o2-1", "a", 0), "t2-2");
        test.equal(this.g.dngettext("et", "o2-1", "b", 1), "t2-1");
        test.equal(this.g.dngettext("et", "o2-1", "c", 2), "t2-2");
        test.equal(this.g.dngettext("et", "o2-1", "c", 3), "t2-2");
        
        test.equal(this.g.dngettext("en", "o2-1", "a", 0), "a");
        test.equal(this.g.dngettext("en", "o2-1", "a", 1), "o2-1");
        test.equal(this.g.dngettext("en", "o2-1", "a", 2), "a");
        test.equal(this.g.dngettext("en", "o2-1", "a", 3), "a");
        
        test.done();
    },
    "pgettext": function(test){
        test.equal(this.g.pgettext("c1", "co1"), "ct1");
        
        test.equal(this.g.pgettext("c2", "co1"), "co1");
        test.done();
    },
    "dpgettext": function(test){
        test.equal(this.g.dpgettext("et", "c1", "co1"), "ct1");
        test.equal(this.g.dpgettext("et", "c2", "co1"), "co1");
        
        test.equal(this.g.dpgettext("en", "c1", "co1"), "co1");
        test.equal(this.g.dpgettext("en", "c2", "co1"), "co1");
        test.done();
    },
    "npgettext": function(test){
        test.equal(this.g.npgettext("c2", "co2-1", "a", 0), "ct2-2");
        test.equal(this.g.npgettext("c2", "co2-1", "a", 1), "ct2-1");
        test.equal(this.g.npgettext("c2", "co2-1", "a", 2), "ct2-2");
        test.equal(this.g.npgettext("c2", "co2-1", "a", 3), "ct2-2");
        test.done();
    },
    "dnpgettext": function(test){
        test.equal(this.g.dnpgettext("et", "c2", "co2-1", "a", 0), "ct2-2");
        test.equal(this.g.dnpgettext("et", "c2", "co2-1", "a", 1), "ct2-1");
        test.equal(this.g.dnpgettext("et", "c2", "co2-1", "a", 2), "ct2-2");
        test.equal(this.g.dnpgettext("et", "c2", "co2-1", "a", 3), "ct2-2");
        
        test.equal(this.g.dnpgettext("en", "c2", "co2-1", "a", 0), "a");
        test.equal(this.g.dnpgettext("en", "c2", "co2-1", "a", 1), "co2-1");
        test.equal(this.g.dnpgettext("en", "c2", "co2-1", "a", 2), "a");
        test.equal(this.g.dnpgettext("en", "c2", "co2-1", "a", 3), "a");
        test.done();
    }
};

exports["LATIN-13"] = {
    setUp: function (callback) {
        fs.readFile(__dirname+"/latin13.mo", (function(err, body){
            if(err){
                throw err;
            }
            this.g = new Gettext();
            this.g.addTextdomain("et", body);
            callback();
        }).bind(this));
    },
    "Simple string, default domain": function(test){
        test.equal(this.g.gettext("o1"), "t1");
        test.done();
    },
    "Simple string, nonexisting domain": function(test){
        this.g.textdomain("en");
        test.equal(this.g.gettext("o1"), "o1");
        test.done();
    },
    "Simple string, existing domain": function(test){
        this.g.textdomain("et");
        test.equal(this.g.gettext("o1"), "t1");
        test.done();
    },
    "Simple string with special chars": function(test){
        test.equal(this.g.gettext("o3-õäöü"), "t3-žš");
        test.done();
    },
    "dgettext": function(test){
        test.equal(this.g.dgettext("et", "o1"), "t1");
        test.equal(this.g.dgettext("en", "o1"), "o1");
        test.done();
    },
    "ngettext": function(test){
        test.equal(this.g.ngettext("o2-1", "a", 0), "t2-2");
        test.equal(this.g.ngettext("o2-1", "b", 1), "t2-1");
        test.equal(this.g.ngettext("o2-1", "c", 2), "t2-2");
        test.equal(this.g.ngettext("o2-1", "d", 3), "t2-2");
        test.done();
    },
    "dngettext": function(test){
        test.equal(this.g.dngettext("et", "o2-1", "a", 0), "t2-2");
        test.equal(this.g.dngettext("et", "o2-1", "b", 1), "t2-1");
        test.equal(this.g.dngettext("et", "o2-1", "c", 2), "t2-2");
        test.equal(this.g.dngettext("et", "o2-1", "c", 3), "t2-2");
        
        test.equal(this.g.dngettext("en", "o2-1", "a", 0), "a");
        test.equal(this.g.dngettext("en", "o2-1", "a", 1), "o2-1");
        test.equal(this.g.dngettext("en", "o2-1", "a", 2), "a");
        test.equal(this.g.dngettext("en", "o2-1", "a", 3), "a");
        
        test.done();
    },
    "pgettext": function(test){
        test.equal(this.g.pgettext("c1", "co1"), "ct1");
        
        test.equal(this.g.pgettext("c2", "co1"), "co1");
        test.done();
    },
    "dpgettext": function(test){
        test.equal(this.g.dpgettext("et", "c1", "co1"), "ct1");
        test.equal(this.g.dpgettext("et", "c2", "co1"), "co1");
        
        test.equal(this.g.dpgettext("en", "c1", "co1"), "co1");
        test.equal(this.g.dpgettext("en", "c2", "co1"), "co1");
        test.done();
    },
    "npgettext": function(test){
        test.equal(this.g.npgettext("c2", "co2-1", "a", 0), "ct2-2");
        test.equal(this.g.npgettext("c2", "co2-1", "a", 1), "ct2-1");
        test.equal(this.g.npgettext("c2", "co2-1", "a", 2), "ct2-2");
        test.equal(this.g.npgettext("c2", "co2-1", "a", 3), "ct2-2");
        test.done();
    },
    "dnpgettext": function(test){
        test.equal(this.g.dnpgettext("et", "c2", "co2-1", "a", 0), "ct2-2");
        test.equal(this.g.dnpgettext("et", "c2", "co2-1", "a", 1), "ct2-1");
        test.equal(this.g.dnpgettext("et", "c2", "co2-1", "a", 2), "ct2-2");
        test.equal(this.g.dnpgettext("et", "c2", "co2-1", "a", 3), "ct2-2");
        
        test.equal(this.g.dnpgettext("en", "c2", "co2-1", "a", 0), "a");
        test.equal(this.g.dnpgettext("en", "c2", "co2-1", "a", 1), "co2-1");
        test.equal(this.g.dnpgettext("en", "c2", "co2-1", "a", 2), "a");
        test.equal(this.g.dnpgettext("en", "c2", "co2-1", "a", 3), "a");
        test.done();
    }
};

exports["LATIN-13 PO"] = {
        setUp: function (callback) {
            fs.readFile(__dirname+"/latin13.po", (function(err, body){
                if(err){
                    throw err;
                }
                this.g = new Gettext();
                this.g.addTextdomain("et", body);
                callback();
            }).bind(this));
        },
        "Simple string, default domain": function(test){
            test.equal(this.g.gettext("o1"), "t1");
            test.done();
        },
        "Simple string, nonexisting domain": function(test){
            this.g.textdomain("en");
            test.equal(this.g.gettext("o1"), "o1");
            test.done();
        },
        "Simple string, existing domain": function(test){
            this.g.textdomain("et");
            test.equal(this.g.gettext("o1"), "t1");
            test.done();
        },
        "Simple string with special chars": function(test){
            test.equal(this.g.gettext("o3-õäöü"), "t3-žš");
            test.done();
        },
        "dgettext": function(test){
            test.equal(this.g.dgettext("et", "o1"), "t1");
            test.equal(this.g.dgettext("en", "o1"), "o1");
            test.done();
        },
        "ngettext": function(test){
            test.equal(this.g.ngettext("o2-1", "a", 0), "t2-2");
            test.equal(this.g.ngettext("o2-1", "b", 1), "t2-1");
            test.equal(this.g.ngettext("o2-1", "c", 2), "t2-2");
            test.equal(this.g.ngettext("o2-1", "d", 3), "t2-2");
            test.done();
        },
        "dngettext": function(test){
            test.equal(this.g.dngettext("et", "o2-1", "a", 0), "t2-2");
            test.equal(this.g.dngettext("et", "o2-1", "b", 1), "t2-1");
            test.equal(this.g.dngettext("et", "o2-1", "c", 2), "t2-2");
            test.equal(this.g.dngettext("et", "o2-1", "c", 3), "t2-2");
            
            test.equal(this.g.dngettext("en", "o2-1", "a", 0), "a");
            test.equal(this.g.dngettext("en", "o2-1", "a", 1), "o2-1");
            test.equal(this.g.dngettext("en", "o2-1", "a", 2), "a");
            test.equal(this.g.dngettext("en", "o2-1", "a", 3), "a");
            
            test.done();
        },
        "pgettext": function(test){
            test.equal(this.g.pgettext("c1", "co1"), "ct1");
            
            test.equal(this.g.pgettext("c2", "co1"), "co1");
            test.done();
        },
        "dpgettext": function(test){
            test.equal(this.g.dpgettext("et", "c1", "co1"), "ct1");
            test.equal(this.g.dpgettext("et", "c2", "co1"), "co1");
            
            test.equal(this.g.dpgettext("en", "c1", "co1"), "co1");
            test.equal(this.g.dpgettext("en", "c2", "co1"), "co1");
            test.done();
        },
        "npgettext": function(test){
            test.equal(this.g.npgettext("c2", "co2-1", "a", 0), "ct2-2");
            test.equal(this.g.npgettext("c2", "co2-1", "a", 1), "ct2-1");
            test.equal(this.g.npgettext("c2", "co2-1", "a", 2), "ct2-2");
            test.equal(this.g.npgettext("c2", "co2-1", "a", 3), "ct2-2");
            test.done();
        },
        "dnpgettext": function(test){
            test.equal(this.g.dnpgettext("et", "c2", "co2-1", "a", 0), "ct2-2");
            test.equal(this.g.dnpgettext("et", "c2", "co2-1", "a", 1), "ct2-1");
            test.equal(this.g.dnpgettext("et", "c2", "co2-1", "a", 2), "ct2-2");
            test.equal(this.g.dnpgettext("et", "c2", "co2-1", "a", 3), "ct2-2");
            
            test.equal(this.g.dnpgettext("en", "c2", "co2-1", "a", 0), "a");
            test.equal(this.g.dnpgettext("en", "c2", "co2-1", "a", 1), "co2-1");
            test.equal(this.g.dnpgettext("en", "c2", "co2-1", "a", 2), "a");
            test.equal(this.g.dnpgettext("en", "c2", "co2-1", "a", 3), "a");
            test.done();
        }
    };

exports["Helpers"] = {
    setUp: function (callback) {
        fs.readFile(__dirname+"/utf8.mo", (function(err, body){
            if(err){
                throw err;
            }
            this.g = new Gettext();
            this.g.addTextdomain("et", body);
            this.g.registerStringHelpers();
            callback();
        }).bind(this));
    },
    "textdomain": function(test){
        "".textdomain("en");
        test.equal(this.g._textdomain, "en");
        "".textdomain("et");
        test.equal(this.g._textdomain, "et");
        test.done();
    },
    "gettext": function(test){
        test.equal("o1".gettext(), "t1");
        test.done();
    },
    "dgettext": function(test){
        test.equal("o1".dgettext("et"), "t1");
        test.equal("o1".dgettext("en"), "o1");
        test.done();
    },
    "ngettext": function(test){
        test.equal("o2-1".ngettext("a", 0), "t2-2");
        test.equal("o2-1".ngettext("b", 1), "t2-1");
        test.equal("o2-1".ngettext("c", 2), "t2-2");
        test.equal("o2-1".ngettext("d", 3), "t2-2");
        test.done();
    },
    "dngettext": function(test){
        test.equal("o2-1".dngettext("et", "a", 0), "t2-2");
        test.equal("o2-1".dngettext("et", "b", 1), "t2-1");
        test.equal("o2-1".dngettext("et", "c", 2), "t2-2");
        test.equal("o2-1".dngettext("et", "d", 3), "t2-2");
        
        test.equal("o2-1".dngettext("en", "a", 0), "a");
        test.equal("o2-1".dngettext("en", "b", 1), "o2-1");
        test.equal("o2-1".dngettext("en", "c", 2), "c");
        test.equal("o2-1".dngettext("en", "d", 3), "d");
        test.done();
    },
    "pgettext": function(test){
        test.equal("co1".pgettext("c1"), "ct1");
        
        test.equal("co1".pgettext("c2"), "co1");
        test.done();
    },
    "dpgettext": function(test){
        test.equal("co1".dpgettext("et", "c1"), "ct1");
        test.equal("co1".dpgettext("et", "c2"), "co1");
        
        test.equal("co1".dpgettext("en", "c1"), "co1");
        test.equal("co1".dpgettext("en", "c2"), "co1");
        test.done();
    },
    "npgettext": function(test){
        test.equal("co2-1".npgettext("c2", "a", 0), "ct2-2");
        test.equal("co2-1".npgettext("c2", "a", 1), "ct2-1");
        test.equal("co2-1".npgettext("c2", "a", 2), "ct2-2");
        test.equal("co2-1".npgettext("c2", "a", 3), "ct2-2");
        test.done();
    },
    "dnpgettext": function(test){
        test.equal("co2-1".dnpgettext("et", "c2", "a", 0), "ct2-2");
        test.equal("co2-1".dnpgettext("et", "c2", "a", 1), "ct2-1");
        test.equal("co2-1".dnpgettext("et", "c2", "a", 2), "ct2-2");
        test.equal("co2-1".dnpgettext("et", "c2", "a", 3), "ct2-2");
        
        test.equal("co2-1".dnpgettext("en", "c2", "a", 0), "a");
        test.equal("co2-1".dnpgettext("en", "c2", "a", 1), "co2-1");
        test.equal("co2-1".dnpgettext("en", "c2", "a", 2), "a");
        test.equal("co2-1".dnpgettext("en", "c2", "a", 3), "a");
        test.done();
    }
}

exports["Other"] = {
    setUp: function (callback) {
        fs.readFile(__dirname+"/utf8.mo", (function(err, body){
            if(err){
                throw err;
            }
            this.g = new Gettext();
            this.g.addTextdomain("et", body);
            callback();
        }).bind(this));
    },
    
    addTranslation: function(test){
        this.g.setTranslation("et", "", "x1", "z1");
        test.equal(this.g.gettext("x1"), "z1");
        test.done();
    },
    
    deleteTranslation: function(test){
        test.equal(this.g.gettext("o1"), "t1");
        this.g.deleteTranslation("et", "", "o1");
        test.equal(this.g.gettext("o1"), "o1");
        test.done();
    },
    
    emptyFile: function(test){
        this.g.addTextdomain("fi");
        this.g.setTranslation("fi", "", "door", "ovi");
        test.equal(this.g.dgettext("fi", "door"), "ovi");
        test.done();
    },
    
    "compile MO": function(test){
        var g2 = new Gettext();
        g2.addTextdomain("et", this.g.compileMO());
        test.equal(this.g.gettext("o1"), g2.gettext("o1"));
        test.done();
    },
    
    "compile PO": function(test){
        var g2 = new Gettext();
        g2.addTextdomain("et", this.g.compilePO());
        test.equal(this.g.gettext("o1"), g2.gettext("o1"));
        test.done();
    },
    
    "auto plurals": function(test){
        this.g.addTextdomain("ga");
        test.equal(this.g._domains["ga"]._pluralCount, 5);
        this.g.addTextdomain("ga_zz");
        test.equal(this.g._domains["ga_zz"]._pluralCount, 5);
        test.done();
    },
    
    "list context": function(test){
        test.deepEqual(this.g.listContextNames(), ['', 'c1', 'c2']);
        test.done();
    },
    
    "list keys": function(test){
        test.deepEqual(this.g.listKeys(), ['o1', 'o2-1', 'o3-õäöü' ]);
        test.deepEqual(this.g.listKeys('', 'c1'), ['co1' ]);
        test.done();
    }
}

exports["BUG-POParser#_detectCharset-PO"] = {
    "parse PO": function(test){
        fs.readFile(__dirname+"/utf8_bug_poparser.po", function(err, body){
            if(err){
                throw err;
            }
            test.doesNotThrow(function(){
                test.p = new POParser(body);
            });
            test.done();
        });
    },
    "detect utf-8 charset": function(test){
        fs.readFile(__dirname+"/utf8_bug_poparser.po", function(err, body){
            if(err){
                throw err;
            }
            test.p = new POParser(body);
            test.equal(test.p._charset, 'utf-8');
            test.done();
        });
    }
}

exports["COMMENTS"] = {
    setUp: function (callback) {
        fs.readFile(__dirname+"/comments.po", (function(err, body){
            if(err){
                throw err;
            }
            this.g = new Gettext();
            this.g.addTextdomain("et", body);
            callback();
        }).bind(this));
    },
    "Normal comments": function(test){
        test.deepEqual(this.g.getComment("et", "", "test"),
            {
                comment: 'Normal comment line 1\nNormal comment line 2',
                note: 'Editors note line 1\nEditors note line 2',
                code: '/absolute/path:13\n/absolute/path:14' 
            });
        test.done();
    },
    "Set comment": function(test){
        this.g.setComment("et", "", "test", "tere");
        test.deepEqual(this.g.getComment("et", "", "test"),
            {
                comment: 'tere',
                note: 'Editors note line 1\nEditors note line 2',
                code: '/absolute/path:13\n/absolute/path:14' 
            });
        test.done();
    },
    "Set comment object": function(test){
        this.g.setComment("et", "", "test", {comment: "tere"});
        test.deepEqual(this.g.getComment("et", "", "test"),
            {
                comment: 'tere',
                note: 'Editors note line 1\nEditors note line 2',
                code: '/absolute/path:13\n/absolute/path:14' 
            });
        test.done();
    },
    "Set comment object for notes": function(test){
        this.g.setComment("et", "", "test", {note: "tere"});
        test.deepEqual(this.g.getComment("et", "", "test"),
            {
                comment: 'Normal comment line 1\nNormal comment line 2',
                note: 'tere',
                code: '/absolute/path:13\n/absolute/path:14' 
            });
        test.done();
    },
    "Set comment object for code": function(test){
        this.g.setComment("et", "", "test", {code: "/abs:1"});
        test.deepEqual(this.g.getComment("et", "", "test"),
            {
                comment: 'Normal comment line 1\nNormal comment line 2',
                note: 'Editors note line 1\nEditors note line 2',
                code: '/abs:1' 
            });
        test.done();
    },
    "Compile PO with comments": function(test){
        this.g.addTextdomain("en", this.g.compilePO());
        test.deepEqual(this.g.getComment("en", "", "test"),
            {
                comment: 'Normal comment line 1\nNormal comment line 2',
                note: 'Editors note line 1\nEditors note line 2',
                code: '/absolute/path:13\n/absolute/path:14' 
            });
        test.done();
    }
}