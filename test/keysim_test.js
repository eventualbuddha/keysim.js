if (!Function.prototype.bind) {
  // Work around phantomjs not having Function#bind.
  Function.prototype.bind = require('function-bind');
}

var assert = require('assert');
var Keyboard = require('../dist/keysim').Keyboard;
var Keystroke = require('../dist/keysim').Keystroke;

var isInNode = require('detect-node');

// jsdom is required when running in node. Browsers have real DOM.
var jsdom = isInNode ? require('jsdom') : null;

function captureEvents(element, body) {
  var events = [];
  var handler = function(e) {
    if (e.target === element) {
      events.push(e);
    }
  };
  ['keydown', 'keypress', 'keyup', 'textInput'].forEach(function(type) {
    element.addEventListener(type, handler);
  });
  body();
  return events;
}

function captureEventSummaries(element, body) {
  return captureEvents(element, body).map(function(e) {
    return [e.type, e.charCode, e.keyCode];
  });
}

function getDocument() {
  if (isInNode) {
      return jsdom.jsdom();
  }
  return window.document;
}

describe('Keyboard', function() {
  var a = new Keystroke(0, 97);
  var A = new Keystroke(Keystroke.SHIFT, 97);

  describe('#charCodeForKeystroke', function() {
    it('uses the mapping given to the constructor to find a matching charCode', function() {
      var keyboard = new Keyboard({ 97: a }, {});
      assert.strictEqual(keyboard.charCodeForKeystroke(a), 97);
    });

    it('returns null when no charCode can be found for the given keystroke', function() {
      var keyboard = new Keyboard({}, {});
      assert.strictEqual(keyboard.charCodeForKeystroke(a), null);
    });

    it('can distinguish between characters with the same keyCode but different modifiers', function() {
      var keyboard = new Keyboard({ 97: a, 65: A }, {});
      assert.strictEqual(keyboard.charCodeForKeystroke(a), 97);
      assert.strictEqual(keyboard.charCodeForKeystroke(A), 65);
    });
  });

  describe('#createEventFromKeystroke', function() {
    var element;

    beforeEach(function() {
      doc = getDocument();
      element = doc.body;
    });

    ['keydown', 'keyup'].forEach(function(type) {
      context('when creating a "' + type + '" event', function() {
        it('returns an event with "' + type + '" type', function() {
          var keyboard = new Keyboard({}, {});
          var event = keyboard.createEventFromKeystroke(type, a, element);
          assert.strictEqual(event.type, type);
        });

        it('returns an event with the correct keyCode', function() {
          var keyboard = new Keyboard({}, {});
          var event = keyboard.createEventFromKeystroke(type, A, element);
          assert.strictEqual(event.keyCode, A.keyCode);
        });

        it('returns an event with the correct modifier flags', function() {
          var keyboard = new Keyboard({}, {});
          var event = keyboard.createEventFromKeystroke(type, A, element);
          assert.strictEqual(event.shiftKey, true);
          assert.strictEqual(event.altKey, false);
          assert.strictEqual(event.ctrlKey, false);
          assert.strictEqual(event.metaKey, false);
        });

        it('returns an event with charCode of 0', function() {
          var keyboard = new Keyboard({}, {});
          var event = keyboard.createEventFromKeystroke(type, A, element);
          assert.strictEqual(event.charCode, 0);
        });

        it('returns an event with `which` equaling `keyCode`', function() {
          var keyboard = new Keyboard({}, {});
          var event = keyboard.createEventFromKeystroke(type, A, element);
          assert.strictEqual(event.which, event.keyCode);
        });
      });
    });

    context('when creating a "keypress" event', function() {
      it('returns an event with "keypress" type', function() {
        var keyboard = new Keyboard({}, {});
        var event = keyboard.createEventFromKeystroke('keypress', a, element);
        assert.strictEqual(event.type, 'keypress');
      });

      it('returns an event with the right charCode value', function() {
        var keyboard = new Keyboard({ 97: a }, {});
        var event = keyboard.createEventFromKeystroke('keypress', a, element);
        assert.strictEqual(event.charCode, 97);
      });

      it('returns an event with the same keyCode as charCode and which', function() {
        var keyboard = new Keyboard({ 65: A }, {});
        var event = keyboard.createEventFromKeystroke('keypress', A, element);
        assert.strictEqual(event.keyCode, 65);
        assert.strictEqual(event.charCode, 65);
        assert.strictEqual(event.which, 65);
      });

      it('creates an event with the expected shiftKey modifier flag', function() {
        var keyboard = new Keyboard({ 65: A, 97: a }, {});
        assert.ok(keyboard.createEventFromKeystroke('keypress', A, element).shiftKey);
        assert.ok(!keyboard.createEventFromKeystroke('keypress', a, element).shiftKey);
      });
    });

    ['keydown', 'keyup'].forEach(function(type) {
      context('when creating a "' + type + '" event', function() {
        it('returns an event with "' + type + '" type', function() {
          var keyboard = new Keyboard({}, {});
          var event = keyboard.createEventFromKeystroke(type, a, element);
          assert.strictEqual(event.type, type);
        });

        it('returns an event with charCode 0', function() {
          var keyboard = new Keyboard({ 65: A }, {});
          var event = keyboard.createEventFromKeystroke(type, A, element);
          assert.strictEqual(event.charCode, 0);
        });

        it('returns an event with keyCode and which matching the physical key pressed', function() {
          var keyboard = new Keyboard({ 65: A }, {});
          var event = keyboard.createEventFromKeystroke(type, A, element);
          assert.strictEqual(event.keyCode, 97);
          assert.strictEqual(event.which, 97);
        });

        it('creates an event with the expected shiftKey modifier flag', function() {
          var keyboard = new Keyboard({ 65: A, 97: a }, {});
          assert.ok(keyboard.createEventFromKeystroke(type, A, element).shiftKey);
          assert.ok(!keyboard.createEventFromKeystroke(type, a, element).shiftKey);
        });
      });
    });
  });

  describe('#dispatchEventsForKeystroke', function() {
    var doc;
    var element;

    beforeEach(function() {
      doc = getDocument();
      element = doc.body;
    });

    context('when there are no modifier keys involved in the keystroke', function() {
      context('when the keystroke will input a character', function() {
        var input;

        beforeEach(function() {
          input = doc.createElement('input');
        });

        it('dispatches keydown, keypress, textInput, and keyup', function() {
          // Simulate typing 'a'.
          assert.deepEqual(captureEventSummaries(input, function() {
            var keyboard = new Keyboard({ 97: a }, {});
            keyboard.dispatchEventsForKeystroke(a, input);
          }), [
            ['keydown', 0, 97],
            ['keypress', 97, 97],
            ['textInput', undefined, undefined],
            ['keyup', 0, 97]
          ]);
        });
      });

      context('when the keystroke will not input a character', function() {
        var input;

        beforeEach(function() {
          input = doc.createElement('input');
        });

        it('dispatches keydown and keyup', function() {
          // Simulate pressing the SHIFT key itself.
          assert.deepEqual(captureEventSummaries(input, function() {
            var keyboard = new Keyboard({}, { SHIFT: 16 });
            keyboard.dispatchEventsForKeystroke(new Keystroke(0, 16), input);
          }), [
            ['keydown', 0, 16],
            ['keyup', 0, 16]
          ]);
        });
      });

      context('when the element is not capable of text entry', function() {
        it('dispatches keydown and keyup', function() {
          // Simulate typing 'a'.
          assert.deepEqual(captureEventSummaries(element, function() {
            var keyboard = new Keyboard({ 97: a }, {});
            keyboard.dispatchEventsForKeystroke(a, element);
          }), [
            ['keydown', 0, 97],
            ['keyup', 0, 97]
          ]);
        });
      });
    });

    context('when there are modifier keys involved in the keystroke', function() {
      var input;

      beforeEach(function() {
        input = doc.createElement('input');
      });

      it('adds the modifiers correctly', function() {
        assert.deepEqual(captureEvents(input, function() {
          var keyboard = Keyboard.US_ENGLISH;
          var keystroke = keyboard.keystrokeForAction('ctrl+alt+shift+a');
          keyboard.dispatchEventsForKeystroke(keystroke, input);
        }).map(function(e) {
          var parts = [e.type];
          if (e.ctrlKey) { parts.push('ctrl'); }
          if (e.altKey) { parts.push('alt'); }
          if (e.shiftKey) { parts.push('shift'); }
          if (e.metaKey) { parts.push('meta'); }
          return parts.join(',');
        }), [
          'keydown,ctrl',
          'keydown,ctrl,shift',
          'keydown,ctrl,alt,shift',
          'keydown,ctrl,alt,shift',  // keydown a
          'keyup,ctrl,alt,shift',    // keyup a
          'keyup,alt,shift',
          'keyup,alt',
          'keyup'
        ]);
      });

      context('when the keystroke will input a character', function() {
        it('dispatches keydown, keypress, textInput, and keyup', function() {
          // Simulate typing 'A'.
          assert.deepEqual(captureEventSummaries(input, function() {
            var keyboard = new Keyboard({ 65: A }, { SHIFT: 16 });
            keyboard.dispatchEventsForKeystroke(A, input);
          }), [
            // shift key
            ['keydown', 0, 16],

            // 'A' key
            ['keydown', 0, 97],
            ['keypress', 65, 65],
            ['textInput', undefined, undefined],
            ['keyup', 0, 97],

            // shift key
            ['keyup', 0, 16]
          ]);
        });
      });
    });
  });

  describe('#dispatchEventsForInput', function() {
    var doc;
    var input;

    beforeEach(function() {
      doc = getDocument();
      input = doc.createElement('input');
    });

    it('dispatches events for each character', function() {
      assert.deepEqual(captureEventSummaries(input, function() {
        var keyboard = Keyboard.US_ENGLISH;
        keyboard.dispatchEventsForInput('abc', input);
      }), [
        // a
        ['keydown', 0, 65],
        ['keypress', 97, 97],
        ['textInput', undefined, undefined],
        ['keyup', 0, 65],

        // b
        ['keydown', 0, 66],
        ['keypress', 98, 98],
        ['textInput', undefined, undefined],
        ['keyup', 0, 66],

        // c
        ['keydown', 0, 67],
        ['keypress', 99, 99],
        ['textInput', undefined, undefined],
        ['keyup', 0, 67]
      ]);
    });

    it('coalesces modifier key events when succeeding keypresses use those modifiers', function() {
      assert.deepEqual(captureEventSummaries(input, function() {
        var keyboard = Keyboard.US_ENGLISH;
        keyboard.dispatchEventsForInput('ABc', input);
      }), [
        // shift
        ['keydown', 0, 16],

        // A
        ['keydown', 0, 65],
        ['keypress', 65, 65],
        ['textInput', undefined, undefined],
        ['keyup', 0, 65],

        // B
        ['keydown', 0, 66],
        ['keypress', 66, 66],
        ['textInput', undefined, undefined],
        ['keyup', 0, 66],

        // shift
        ['keyup', 0, 16],

        // c
        ['keydown', 0, 67],
        ['keypress', 99, 99],
        ['textInput', undefined, undefined],
        ['keyup', 0, 67]
      ]);
    });
  });

  describe('#dispatchEventsForAction', function() {
    var doc;
    var input;

    beforeEach(function() {
      doc = getDocument();
      input = doc.createElement('input');
    });

    it('dispatches events for each key', function() {
      assert.deepEqual(captureEventSummaries(input, function() {
        var keyboard = Keyboard.US_ENGLISH;
        keyboard.dispatchEventsForAction('ctrl+a', input);
      }), [
        // ctrl down
        ['keydown', 0, 17],

        // a
        ['keydown', 0, 65],
        ['keyup', 0, 65],

        // ctrl up
        ['keyup', 0, 17]
      ]);
    });

    it('accepts named "action" keys', function() {
      assert.deepEqual(captureEventSummaries(input, function() {
        var keyboard = Keyboard.US_ENGLISH;
        keyboard.dispatchEventsForAction('alt+backspace', input);
      }), [
        // alt down
        ['keydown', 0, 18],

        // backspace
        ['keydown', 0, 8],
        ['keyup', 0, 8],

        // alt up
        ['keyup', 0, 18]
      ]);
    });

    it('throws when given an invalid modifier', function() {
      try {
        var keyboard = Keyboard.US_ENGLISH;
        keyboard.dispatchEventsForAction('ctrl+foobar+a', input);
        assert.ok(false, 'expected an exception!');
      } catch (ex) {
        assert.strictEqual(ex.message, 'in "ctrl+foobar+a", invalid modifier: foobar');
      }
    });

    it('throws when given an invalid action/character', function() {
      try {
        var keyboard = Keyboard.US_ENGLISH;
        keyboard.dispatchEventsForAction('ctrl+abc', input);
        assert.ok(false, 'expected an exception!');
      } catch (ex) {
        assert.strictEqual(ex.message, 'in "ctrl+abc", invalid action: abc');
      }
    });
  });
});
