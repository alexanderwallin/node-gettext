'use strict';

var chai = require('chai');
var Gettext = require('../lib/gettext');
var fs = require('fs');

var expect = chai.expect;
chai.config.includeStack = true;

describe('Gettext', function() {

    describe('#addTextdomain', function() {

        it('Should add from a mo file', function() {
            var gt = new Gettext();
            gt.setlocale('et-EE');
            var moFile = fs.readFileSync(__dirname + '/fixtures/latin13.mo');

            gt.addTextdomain('messages', moFile);

            expect(gt.domains.messages).to.exist;
            expect(gt.domains.messages.charset).to.equal('iso-8859-13');
        });

        it('Should add from a po file', function() {
            var gt = new Gettext();
            gt.setlocale('et-EE');
            var poFile = fs.readFileSync(__dirname + '/fixtures/latin13.po');

            gt.addTextdomain('messages', poFile);

            expect(gt.domains.messages).to.exist;
            expect(gt.domains.messages.charset).to.equal('iso-8859-13');
        });

        it('Should add from a json file', function() {
            var gt = new Gettext();
            gt.setlocale('et-EE');
            var jsonFile = JSON.parse(fs.readFileSync(__dirname + '/fixtures/latin13.json'));

            gt.addTextdomain('messages', jsonFile);

            expect(gt.domains.messages).to.exist;
            expect(gt.domains.messages.charset).to.equal('iso-8859-13');
        });

    });

    describe('#textdomain', function() {
        it('should set default domain', function() {
            var gt = new Gettext();
            var moFile = fs.readFileSync(__dirname + '/fixtures/latin13.mo');

            expect(gt.textdomain()).to.be.false;
            gt.addTextdomain('messages', moFile);
            expect(gt.textdomain()).to.equal('messages');
            gt.addTextdomain('messages', moFile);
            expect(gt.textdomain()).to.equal('messages');
        });

        it('should change default domain', function() {
            var gt = new Gettext();
            var moFile = fs.readFileSync(__dirname + '/fixtures/latin13.mo');

            expect(gt.textdomain()).to.be.false;
            gt.addTextdomain('messages', moFile);
            expect(gt.textdomain()).to.equal('messages');
            gt.addTextdomain('domain2', moFile);
            expect(gt.textdomain()).to.equal('messages');
            gt.textdomain('domain2');
            expect(gt.textdomain()).to.equal('domain2');
        });
    });

    describe('#setlocale and #getlocale', function() {
        it('should set locale', function() {
            var gt = new Gettext();
            expect(gt.getlocale()).to.equal('en_US');
            gt.setlocale('de_DE');
            expect(gt.getlocale()).to.equal('de_DE');
            gt.setlocale('de-DE');
            expect(gt.getlocale()).to.equal('de-DE');
        });
    });

    describe('#loadTextdomainDirectory', function() {
        it('should load /fixtures/de_DE.mo', function() {
            var gt = new Gettext();
            var fileDirectory = __dirname + '/fixtures/locale_test1/';
            gt.setOptions({ domain: 'message', locale: 'de_DE', localeDir: fileDirectory });
            gt.loadTextdomainDirectory();
            expect(gt.getlocale()).to.equal('de_DE');
            expect(gt.gettext('GNU')).to.equal('YES');
            expect(gt.gettext('NONGNU')).to.equal('NONGNU');
            expect(gt.gettext('GETTEXT')).to.equal('GETTEXT');
        });

        it('should load /fixtures/de_DE.mo', function() {
            var gt = new Gettext();
            var fileDirectory = __dirname + '/fixtures/locale_test1/';
            gt.setOptions({ domain: 'message', locale: 'de_DE', localeDir: fileDirectory, localeDirTyp: 'GNU' });
            gt.loadTextdomainDirectory();
            expect(gt.getlocale()).to.equal('de_DE');
            expect(gt.gettext('GNU')).to.equal('YES');
            expect(gt.gettext('NONGNU')).to.equal('NONGNU');
            expect(gt.gettext('GETTEXT')).to.equal('GETTEXT');
        });

        it('should load /fixtures/de_DE/message.mo', function() {
            var gt = new Gettext();
            var fileDirectory = __dirname + '/fixtures/locale_test2/';
            gt.setOptions({ domain: 'message', locale: 'de_DE', localeDir: fileDirectory, localeDirTyp: 'NONGNU' });
            gt.loadTextdomainDirectory();
            expect(gt.getlocale()).to.equal('de_DE');
            expect(gt.gettext('GNU')).to.equal('GNU');
            expect(gt.gettext('NONGNU')).to.equal('YES');
            expect(gt.gettext('GETTEXT')).to.equal('GETTEXT');
        });

        it('should load /fixtures/de/LC_MESSAGES/message.mo', function() {
            var gt = new Gettext();
            var fileDirectory = __dirname + '/fixtures/locale_test3/';
            gt.setOptions({ domain: 'message', locale: 'de_DE', localeDir: fileDirectory, localeDirTyp: 'GETTEXT' });
            gt.loadTextdomainDirectory();
            expect(gt.getlocale()).to.equal('de_DE');
            expect(gt.gettext('GNU')).to.equal('GNU');
            expect(gt.gettext('NONGNU')).to.equal('NONGNU');
            expect(gt.gettext('GETTEXT')).to.equal('YES');
            expect(gt.gettext('LANG')).to.equal('de_DE');
        });

        it('should load /fixtures/de/LC_MESSAGES/message.mo', function() {
            var gt = new Gettext();
            var fileDirectory = __dirname + '/fixtures/locale_test3/';
            gt.setOptions({ domain: 'message', locale: 'de_DE', localeDir: fileDirectory, localeDirTyp: 'GETTEXT' });
            gt.loadTextdomainDirectory();
            expect(gt.getlocale()).to.equal('de_DE');
            expect(gt.gettext('GNU')).to.equal('GNU');
            expect(gt.gettext('NONGNU')).to.equal('NONGNU');
            expect(gt.gettext('GETTEXT')).to.equal('YES');
            expect(gt.gettext('LANG')).to.equal('de_DE');
        });

        it('should load /fixtures/en/LC_MESSAGES/message.mo', function() {
            var gt = new Gettext();
            var fileDirectory = __dirname + '/fixtures/locale_test3/';
            gt.setOptions({ domain: 'message', localeDir: fileDirectory, localeDirTyp: 'GETTEXT' });
            expect(gt.getlocale()).to.equal('en_US');
            gt.setlocale('de_DE');
            expect(gt.getlocale()).to.equal('de_DE');
            expect(gt.gettext('GNU')).to.equal('GNU');
            expect(gt.gettext('NONGNU')).to.equal('NONGNU');
            expect(gt.gettext('GETTEXT')).to.equal('YES');
            expect(gt.gettext('LANG')).to.equal('de_DE');
        });

        it('should load /fixtures/de_DE/LC_MESSAGES/message.mo', function() {
            var gt = new Gettext();
            var fileDirectory = __dirname + '/fixtures/locale_test4/';
            gt.setOptions({ domain: 'message', locale: 'de_DE', localeDir: fileDirectory, localeDirTyp: 'GETTEXT' });
            gt.loadTextdomainDirectory();
            expect(gt.getlocale()).to.equal('de_DE');
            expect(gt.gettext('GNU')).to.equal('GNU');
            expect(gt.gettext('NONGNU')).to.equal('NONGNU');
            expect(gt.gettext('GETTEXT')).to.equal('YES');
            expect(gt.gettext('LANG')).to.equal('de_DE');
        });

        it('should load /fixtures/en_US/LC_MESSAGES/message.mo and load locale de_DE after switch', function() {
            var gt = new Gettext();
            var fileDirectory = __dirname + '/fixtures/locale_test4/';
            gt.setOptions({ domain: 'message', localeDir: fileDirectory, localeDirTyp: 'GETTEXT' });
            expect(gt.getlocale()).to.equal('en_US');
            gt.setlocale('de_DE');
            expect(gt.getlocale()).to.equal('de_DE');
            expect(gt.gettext('GNU')).to.equal('GNU');
            expect(gt.gettext('NONGNU')).to.equal('NONGNU');
            expect(gt.gettext('GETTEXT')).to.equal('YES');
            expect(gt.gettext('LANG')).to.equal('de_DE');
        });

        it('should load /fixtures/de_DE/LC_MESSAGES/message.mo and switch to domain all', function() {
            var gt = new Gettext();
            var fileDirectory = __dirname + '/fixtures/locale_test5/';
            gt.setOptions({ domain: 'message', locale: 'de_DE', localeDir: fileDirectory, localeDirTyp: 'GETTEXT' });
            gt.loadTextdomainDirectory();
            gt.textdomain('all');
            expect(gt.getlocale()).to.equal('de_DE');
            expect(gt.gettext('GNU')).to.equal('GNU');
            expect(gt.gettext('DOMAIN')).to.equal('ALL');
            expect(gt.gettext('NONGNU')).to.equal('NONGNU');
            expect(gt.gettext('GETTEXT')).to.equal('YES');
            expect(gt.gettext('LANG')).to.equal('de_DE');
        });

        it('should load /fixtures/en_US/LC_MESSAGES/message.mo and load locale de_DE and domain all.mo after switch', function() {
            var gt = new Gettext();
            var fileDirectory = __dirname + '/fixtures/locale_test5/';
            gt.setOptions({ domain: 'message', localeDir: fileDirectory, localeDirTyp: 'GETTEXT' });
            expect(gt.getlocale()).to.equal('en_US');
            gt.setlocale('de_DE');
            gt.textdomain('all');
            expect(gt.getlocale()).to.equal('de_DE');
            expect(gt.gettext('GNU')).to.equal('GNU');
            expect(gt.gettext('DOMAIN')).to.equal('ALL');
            expect(gt.gettext('NONGNU')).to.equal('NONGNU');
            expect(gt.gettext('GETTEXT')).to.equal('YES');
            expect(gt.gettext('LANG')).to.equal('de_DE');
        });
    });


    describe('Resolve translations #1', function() {
        var gt;

        beforeEach(function() {
            var fileDirectory = __dirname + '/fixtures/locale_test5/';
            gt = new Gettext({ domain: 'message', localeDir: fileDirectory, localeDirTyp: 'GETTEXT' });
        });

        describe('#dgettext', function() {
            it('should return singular from all domain', function() {
                expect(gt.textdomain()).to.equal('message');
                expect(gt.dgettext('all', 'DOMAIN')).to.equal('ALL');
                expect(gt.textdomain()).to.equal('message');
            });
        });


        describe('#dnpgettext', function() {
            it('should return default singular', function() {
                expect(gt.dnpgettext('message', '', '0 matches', 'multiple matches', 1)).to.equal('0 matches');
            });

            it('should return default plural', function() {
                expect(gt.dnpgettext('message', '', '0 matches', 'multiple matches', 100)).to.equal('multiple matches');
            });

            it('should return singular match from default context', function() {
                expect(gt.dnpgettext('message', '', 'o2-1', 'o2-2', 1)).to.equal('t2-1');
            });

            it('should return plural match from default context', function() {
                expect(gt.dnpgettext('message', '', 'o2-1', 'o2-2', 2)).to.equal('t2-2');
            });

            it('should return singular match from selected context', function() {
                expect(gt.dnpgettext('message', 'c2', 'co2-1', 'co2-2', 1)).to.equal('ct2-1');
            });

            it('should return plural match from selected context', function() {
                expect(gt.dnpgettext('message', 'c2', 'co2-1', 'co2-2', 2)).to.equal('ct2-2');
            });

            it('should return singular match for non existing domain', function() {
                expect(gt.dnpgettext('nonexisting', '', 'o2-1', 'o2-2', 1)).to.equal('o2-1');
            });
        });

        describe('#dpgettext', function() {
            it('should return singular from selected context', function() {
                expect(gt.dpgettext('all', 'all', 'all')).to.equal('YESALL');
            });
        });
    });

    describe('Resolve translations #2', function() {
        var gt;

        beforeEach(function() {
            gt = new Gettext();
            gt.setlocale('et-EE');
            var poFile = fs.readFileSync(__dirname + '/fixtures/latin13.po');
            gt.addTextdomain('messages', poFile);
        });

        describe('#dnpgettext', function() {
            it('should return default singular', function() {
                expect(gt.dnpgettext('messages', '', '0 matches', 'multiple matches', 1)).to.equal('0 matches');
            });

            it('should return default plural', function() {
                expect(gt.dnpgettext('messages', '', '0 matches', 'multiple matches', 100)).to.equal('multiple matches');
            });

            it('should return singular match from default context', function() {
                expect(gt.dnpgettext('messages', '', 'o2-1', 'o2-2', 1)).to.equal('t2-1');
            });

            it('should return plural match from default context', function() {
                expect(gt.dnpgettext('messages', '', 'o2-1', 'o2-2', 2)).to.equal('t2-2');
            });

            it('should return singular match from selected context', function() {
                expect(gt.dnpgettext('messages', 'c2', 'co2-1', 'co2-2', 1)).to.equal('ct2-1');
            });

            it('should return plural match from selected context', function() {
                expect(gt.dnpgettext('messages', 'c2', 'co2-1', 'co2-2', 2)).to.equal('ct2-2');
            });

            it('should return singular match for non existing domain', function() {
                expect(gt.dnpgettext('nonexisting', '', 'o2-1', 'o2-2', 1)).to.equal('o2-1');
            });
        });

        describe('#gettext', function() {
            it('should return singular from default context', function() {
                expect(gt.gettext('o2-1')).to.equal('t2-1');
            });
        });

        describe('#dgettext', function() {
            it('should return singular from default context', function() {
                expect(gt.dgettext('messages', 'o2-1')).to.equal('t2-1');
            });
        });

        describe('#ngettext', function() {
            it('should return plural from default context', function() {
                expect(gt.ngettext('o2-1', 'o2-2', 2)).to.equal('t2-2');
            });
        });

        describe('#dngettext', function() {
            it('should return plural from default context', function() {
                expect(gt.dngettext('messages', 'o2-1', 'o2-2', 2)).to.equal('t2-2');
            });
        });

        describe('#pgettext', function() {
            it('should return singular from selected context', function() {
                expect(gt.pgettext('c2', 'co2-1')).to.equal('ct2-1');
            });
        });

        describe('#dpgettext', function() {
            it('should return singular from selected context', function() {
                expect(gt.dpgettext('messages', 'c2', 'co2-1')).to.equal('ct2-1');
            });
        });

        describe('#npgettext', function() {
            it('should return plural from selected context', function() {
                expect(gt.npgettext('c2', 'co2-1', 'co2-2', 2)).to.equal('ct2-2');
            });
        });

        describe('#getComment', function() {
            it('should return comments object', function() {
                expect(gt.getComment('messages', '', 'test')).to.deep.equal({
                    translator: 'Normal comment line 1\nNormal comment line 2',
                    extracted: 'Editors note line 1\nEditors note line 2',
                    reference: '/absolute/path:13\n/absolute/path:14',
                    flag: 'line 1\nline 2',
                    previous: 'line 3\nline 4'
                });
            });
        });
    });
});
