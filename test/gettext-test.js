'use strict';

var chai = require('chai');
var Gettext = require('../lib/gettext');
var fs = require('fs');
var sinon = require('sinon');

var expect = chai.expect;
chai.config.includeStack = true;

describe('Gettext', function() {
    var gt;
    var jsonFile;

    beforeEach(function() {
        gt = new Gettext({ debug: false });
        jsonFile = JSON.parse(fs.readFileSync(__dirname + '/fixtures/latin13.json'));
    });

    describe('#constructor', function() {
        var gtc;

        beforeEach(function() {
            gtc = null;
        });

        describe('#sourceLocale option', function() {
            it('should accept any string as a locale', function() {
                gtc = new Gettext({ sourceLocale: 'en-US' });
                expect(gtc.sourceLocale).to.equal('en-US');
                gtc = new Gettext({ sourceLocale: '01234' });
                expect(gtc.sourceLocale).to.equal('01234');
            });

            it('should default to en empty string', function() {
                expect((new Gettext()).sourceLocale).to.equal('');
            });

            it('should reject non-string values', function() {
                gtc = new Gettext({ sourceLocale: null });
                expect(gtc.sourceLocale).to.equal('');
                gtc = new Gettext({ sourceLocale: 123 });
                expect(gtc.sourceLocale).to.equal('');
                gtc = new Gettext({ sourceLocale: false });
                expect(gtc.sourceLocale).to.equal('');
                gtc = new Gettext({ sourceLocale: {} });
                expect(gtc.sourceLocale).to.equal('');
                gtc = new Gettext({ sourceLocale: function() {} });
                expect(gtc.sourceLocale).to.equal('');
            });
        });
    });

    describe('#getLanguageCode', function() {
        it('should normalize locale string', function() {
            expect(Gettext.getLanguageCode('ab-cd_ef.utf-8')).to.equal('ab');
            expect(Gettext.getLanguageCode('ab-cd_ef')).to.equal('ab');
        });
    });

    describe('#addTranslations', function() {
        it('should store added translations', function() {
            gt.addTranslations('et-EE', 'messages', jsonFile);

            expect(gt.catalogs['et-EE']).to.exist;
            expect(gt.catalogs['et-EE'].messages).to.exist;
            expect(gt.catalogs['et-EE'].messages.charset).to.equal('iso-8859-13');
        });

        it('should store added translations on a custom domain', function() {
            gt.addTranslations('et-EE', 'mydomain', jsonFile);

            expect(gt.catalogs['et-EE'].mydomain).to.exist;
            expect(gt.catalogs['et-EE'].mydomain.charset).to.equal('iso-8859-13');
        });
    });

    describe('#setLocale', function() {
        it('should have the empty string as default locale', function() {
            expect(gt.locale).to.equal('');
        });

        it('should accept whatever string is passed as locale', function() {
            gt.setLocale('de-AT');
            expect(gt.locale).to.equal('de-AT');
            gt.setLocale('01234');
            expect(gt.locale).to.equal('01234');
            gt.setLocale('');
            expect(gt.locale).to.equal('');
        });

        it('should reject non-string locales', function() {
            gt.setLocale(null);
            expect(gt.locale).to.equal('');
            gt.setLocale(123);
            expect(gt.locale).to.equal('');
            gt.setLocale(false);
            expect(gt.locale).to.equal('');
            gt.setLocale(function() {});
            expect(gt.locale).to.equal('');
            gt.setLocale(NaN);
            expect(gt.locale).to.equal('');
            gt.setLocale();
            expect(gt.locale).to.equal('');
        });
    });

    describe('#setTextDomain', function() {
        it('should default to "messages"', function() {
            expect(gt.domain).to.equal('messages');
        });

        it('should accept and store any string as domain name', function() {
            gt.setTextDomain('mydomain');
            expect(gt.domain).to.equal('mydomain');
            gt.setTextDomain('01234');
            expect(gt.domain).to.equal('01234');
            gt.setTextDomain('');
            expect(gt.domain).to.equal('');
        });

        it('should reject non-string domains', function() {
            gt.setTextDomain(null);
            expect(gt.domain).to.equal('messages');
            gt.setTextDomain(123);
            expect(gt.domain).to.equal('messages');
            gt.setTextDomain(false);
            expect(gt.domain).to.equal('messages');
            gt.setTextDomain(function() {});
            expect(gt.domain).to.equal('messages');
            gt.setTextDomain(NaN);
            expect(gt.domain).to.equal('messages');
            gt.setTextDomain();
            expect(gt.domain).to.equal('messages');
        });
    });

    describe('Resolve translations', function() {
        beforeEach(function() {
            gt.addTranslations('et-EE', 'messages', jsonFile);
            gt.setLocale('et-EE');
        });

        describe('#dnpgettext', function() {
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
                expect(gt.dnpgettext('cccc', '', 'o2-1', 'o2-2', 1)).to.equal('o2-1');
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

    describe('Unresolvable transaltions', function() {
        beforeEach(function() {
            gt.addTranslations('et-EE', 'messages', jsonFile);
        });

        it('should pass msgid when no translation is found', function() {
            expect(gt.gettext('unknown phrase')).to.equal('unknown phrase');
            expect(gt.dnpgettext('unknown domain', null, 'hello')).to.equal('hello');
            expect(gt.dnpgettext('messages', 'unknown context', 'hello')).to.equal('hello');

            // 'o2-1' is translated, but no locale has been set yet
            expect(gt.dnpgettext('messages', '', 'o2-1')).to.equal('o2-1');
        });

        it('should pass unresolved singular message when count is 1', function() {
            expect(gt.dnpgettext('messages', '', '0 matches', 'multiple matches', 1)).to.equal('0 matches');
        });

        it('should pass unresolved plural message when count > 1', function() {
            expect(gt.dnpgettext('messages', '', '0 matches', 'multiple matches', 100)).to.equal('multiple matches');
        });
    });

    describe('Events', function() {
        var errorListener;

        beforeEach(function() {
            errorListener = sinon.spy();
            gt.on('error', errorListener);
        });

        it('should notify a registered listener of error events', function() {
            gt.emit('error', 'Something went wrong');
            expect(errorListener.callCount).to.equal(1);
        });

        it('should deregister a previously registered event listener', function() {
            gt.off('error', errorListener);
            gt.emit('error', 'Something went wrong');
            expect(errorListener.callCount).to.equal(0);
        });

        it('should emit an error event when a locale that has no translations is set', function() {
            gt.setLocale('et-EE');
            expect(errorListener.callCount).to.equal(1);
        });

        it('should emit an error event when no locale has been set', function() {
            gt.addTranslations('et-EE', 'messages', jsonFile);
            gt.gettext('o2-1');
            expect(errorListener.callCount).to.equal(1);
            gt.setLocale('et-EE');
            gt.gettext('o2-1');
            expect(errorListener.callCount).to.equal(1);
        });

        it('should emit an error event when a translation is missing', function() {
            gt.addTranslations('et-EE', 'messages', jsonFile);
            gt.setLocale('et-EE');
            gt.gettext('This message is not translated');
            expect(errorListener.callCount).to.equal(1);
        });

        it('should not emit any error events when a translation is found', function() {
            gt.addTranslations('et-EE', 'messages', jsonFile);
            gt.setLocale('et-EE');
            gt.gettext('o2-1');
            expect(errorListener.callCount).to.equal(0);
        });

        it('should not emit any error events when the current locale is the default locale', function() {
            var gtd = new Gettext({ sourceLocale: 'en-US' });
            var errorListenersourceLocale = sinon.spy();
            gtd.on('error', errorListenersourceLocale);
            gtd.setLocale('en-US');
            gtd.gettext('This message is not translated');
            expect(errorListenersourceLocale.callCount).to.equal(0);
        });
    });

    describe('Aliases', function() {
        it('should forward textdomain(domain) to setTextDomain(domain)', function() {
            sinon.stub(gt, 'setTextDomain');
            gt.textdomain('messages');
            expect(gt.setTextDomain.calledWith('messages'));
            gt.setTextDomain.restore();
        });

        it('should forward setlocale(locale) to setLocale(locale)', function() {
            sinon.stub(gt, 'setLocale');
            gt.setLocale('et-EE');
            expect(gt.setLocale.calledWith('et-EE'));
            gt.setLocale.restore();
        });
    });
});
