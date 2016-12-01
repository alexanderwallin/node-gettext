'use strict';

var EventEmitter = require('eventemitter3');
var assign = require('lodash.assign');

module.exports = withGettextEvents;

/**
 * Returns a `Gettext` constructor function that extends
 * the EventEmitter3 API and emits events when warnings
 * are triggered.
 *
 * @param  {Function} Gettext  A Gettext constructor
 * @return {Function} An enhanced Gettext constructor
 */
function withGettextEvents(Gettext) {

    /**
     * @constructor
     */
    function GettextWithEvents() {
        Gettext.call(this);
        EventEmitter.call(this);
    }

    // Extend the Gettext and EventEmitter prototypes
    assign(GettextWithEvents.prototype, Gettext.prototype);
    assign(GettextWithEvents.prototype, EventEmitter.prototype);
    GettextWithEvents.prototype.constructor = GettextWithEvents;

    // Copy any static properties from Gettext
    var staticPropertyNames = Object.keys(Gettext);
    for (var i = 0; i < staticPropertyNames.length; i++) {
        GettextWithEvents[staticPropertyNames[i]] = Gettext[staticPropertyNames[i]];
    }

    /**
     * Emits an 'error' event containing a warning message before
     * passing it along to the core warn() method.
     *
     * @param  {String} message  A warning message
     */
    GettextWithEvents.prototype.warn = function(message) {
        var error = new Error(message);
        error.name = 'GettextError';
        this.emit('error', error);

        Gettext.prototype.warn.call(this, message);
    };

    return GettextWithEvents;
}
