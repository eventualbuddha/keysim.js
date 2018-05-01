let assert = require('assert');
let Keyboard = require('../dist/keysim').Keyboard;
let Keystroke = require('../dist/keysim').Keystroke;
let KeyEvents = require('../dist/keysim').KeyEvents;

let isInNode = require('detect-node');

// jsdom is required when running in node. Browsers have real DOM.
let jsdom = isInNode ? require('jsdom') : null;
let addEventHandler = require('add-event-handler');

function captureEvents(element, body) {
  let events = [];
  let handler = e => {
    if (e.target === element) {
      events.push(e);
    }
  };
  ['keydown', 'keypress', 'keyup', 'textInput', 'input'].forEach(type => {
    addEventHandler(element, type, handler);
  });
  body();
  return events;
}

function captureEventSummaries(element, body) {
  return captureEvents(element, body).map(e => [e.type, e.charCode, e.keyCode]);
}

function getDocument() {
  if (isInNode) {
    return new jsdom.JSDOM().window.document;
  }
  return window.document;
}

describe('Keyboard', function() {
  let a = new Keystroke(0, 97);
  let A = new Keystroke(Keystroke.SHIFT, 97);

  describe('#charCodeForKeystroke', function() {
    it('uses the mapping given to the constructor to find a matching charCode', function() {
      let keyboard = new Keyboard({ 97: a }, {});
      assert.strictEqual(keyboard.charCodeForKeystroke(a), 97);
    });

    it('returns null when no charCode can be found for the given keystroke', function() {
      let keyboard = new Keyboard({}, {});
      assert.strictEqual(keyboard.charCodeForKeystroke(a), null);
    });

    it('can distinguish between characters with the same keyCode but different modifiers', function() {
      let keyboard = new Keyboard({ 97: a, 65: A }, {});
      assert.strictEqual(keyboard.charCodeForKeystroke(a), 97);
      assert.strictEqual(keyboard.charCodeForKeystroke(A), 65);
    });
  });

  describe('#createEventFromKeystroke', function() {
    let document;
    let element;

    beforeEach(function() {
      document = getDocument();
      element = document.body;
    });

    ['keydown', 'keyup'].forEach(function(type) {
      context('when creating a "' + type + '" event', function() {
        it('returns an event with "' + type + '" type', function() {
          let keyboard = new Keyboard({}, {});
          let event = keyboard.createEventFromKeystroke(type, a, element);
          assert.strictEqual(event.type, type);
        });

        it('returns an event with the correct keyCode', function() {
          let keyboard = new Keyboard({}, {});
          let event = keyboard.createEventFromKeystroke(type, A, element);
          assert.strictEqual(event.keyCode, A.keyCode);
        });

        it('returns an event with the correct modifier flags', function() {
          let keyboard = new Keyboard({}, {});
          let event = keyboard.createEventFromKeystroke(type, A, element);
          assert.strictEqual(event.shiftKey, true);
          assert.strictEqual(event.altKey, false);
          assert.strictEqual(event.ctrlKey, false);
          assert.strictEqual(event.metaKey, false);
        });

        it('returns an event with charCode of 0', function() {
          let keyboard = new Keyboard({}, {});
          let event = keyboard.createEventFromKeystroke(type, A, element);
          assert.strictEqual(event.charCode, 0);
        });

        it('returns an event with `which` equaling `keyCode`', function() {
          let keyboard = new Keyboard({}, {});
          let event = keyboard.createEventFromKeystroke(type, A, element);
          assert.strictEqual(event.which, event.keyCode);
        });
      });
    });

    context('when creating a "keypress" event', function() {
      it('returns an event with "keypress" type', function() {
        let keyboard = new Keyboard({}, {});
        let event = keyboard.createEventFromKeystroke('keypress', a, element);
        assert.strictEqual(event.type, 'keypress');
      });

      it('returns an event with the right charCode value', function() {
        let keyboard = new Keyboard({ 97: a }, {});
        let event = keyboard.createEventFromKeystroke('keypress', a, element);
        assert.strictEqual(event.charCode, 97);
      });

      it('returns an event with the same keyCode as charCode and which', function() {
        let keyboard = new Keyboard({ 65: A }, {});
        let event = keyboard.createEventFromKeystroke('keypress', A, element);
        assert.strictEqual(event.keyCode, 65);
        assert.strictEqual(event.charCode, 65);
        assert.strictEqual(event.which, 65);
      });

      it('creates an event with the expected shiftKey modifier flag', function() {
        let keyboard = new Keyboard({ 65: A, 97: a }, {});
        assert.ok(
          keyboard.createEventFromKeystroke('keypress', A, element).shiftKey
        );
        assert.ok(
          !keyboard.createEventFromKeystroke('keypress', a, element).shiftKey
        );
      });
    });

    ['keydown', 'keyup'].forEach(function(type) {
      context('when creating a "' + type + '" event', function() {
        it('returns an event with "' + type + '" type', function() {
          let keyboard = new Keyboard({}, {});
          let event = keyboard.createEventFromKeystroke(type, a, element);
          assert.strictEqual(event.type, type);
        });

        it('returns an event with charCode 0', function() {
          let keyboard = new Keyboard({ 65: A }, {});
          let event = keyboard.createEventFromKeystroke(type, A, element);
          assert.strictEqual(event.charCode, 0);
        });

        it('returns an event with keyCode and which matching the physical key pressed', function() {
          let keyboard = new Keyboard({ 65: A }, {});
          let event = keyboard.createEventFromKeystroke(type, A, element);
          assert.strictEqual(event.keyCode, 97);
          assert.strictEqual(event.which, 97);
        });

        it('creates an event with the expected shiftKey modifier flag', function() {
          let keyboard = new Keyboard({ 65: A, 97: a }, {});
          assert.ok(
            keyboard.createEventFromKeystroke(type, A, element).shiftKey
          );
          assert.ok(
            !keyboard.createEventFromKeystroke(type, a, element).shiftKey
          );
        });
      });
    });
  });

  describe('#dispatchEventsForKeystroke', function() {
    let document;
    let element;

    beforeEach(function() {
      document = getDocument();
      element = document.body;
    });

    context(
      'when there are no modifier keys involved in the keystroke',
      function() {
        context('when the keystroke will input a character', function() {
          let input;

          beforeEach(function() {
            input = document.createElement('input');
          });

          it('dispatches keydown, keypress, textInput, input, and keyup', function() {
            // Simulate typing 'a'.
            assert.deepEqual(
              captureEventSummaries(input, function() {
                let keyboard = new Keyboard({ 97: a }, {});
                keyboard.dispatchEventsForKeystroke(a, input);
              }),
              [
                ['keydown', 0, 97],
                ['keypress', 97, 97],
                ['textInput', undefined, undefined],
                ['input', undefined, undefined],
                ['keyup', 0, 97]
              ]
            );
          });

          it('dispatches only keydown and keyup when passed explicitly', function() {
            // Simulate typing 'a'.
            assert.deepEqual(
              captureEventSummaries(input, function() {
                let keyboard = new Keyboard({ 97: a }, {});
                keyboard.dispatchEventsForKeystroke(
                  a,
                  input,
                  true,
                  KeyEvents.DOWN | KeyEvents.UP
                );
              }),
              [['keydown', 0, 97], ['keyup', 0, 97]]
            );
          });
        });

        context('when the keystroke will not input a character', function() {
          let input;

          beforeEach(function() {
            input = document.createElement('input');
          });

          it('dispatches keydown and keyup', function() {
            // Simulate pressing the SHIFT key itself.
            assert.deepEqual(
              captureEventSummaries(input, function() {
                let keyboard = new Keyboard({}, { SHIFT: 16 });
                keyboard.dispatchEventsForKeystroke(
                  new Keystroke(0, 16),
                  input
                );
              }),
              [['keydown', 0, 16], ['keyup', 0, 16]]
            );
          });
        });

        context('when the element is not capable of text entry', function() {
          it('dispatches keydown and keyup', function() {
            // Simulate typing 'a'.
            assert.deepEqual(
              captureEventSummaries(element, function() {
                let keyboard = new Keyboard({ 97: a }, {});
                keyboard.dispatchEventsForKeystroke(a, element);
              }),
              [['keydown', 0, 97], ['keyup', 0, 97]]
            );
          });
        });
      }
    );

    context(
      'when there are modifier keys involved in the keystroke',
      function() {
        let input;

        beforeEach(function() {
          input = document.createElement('input');
        });

        it('adds the modifiers correctly', function() {
          assert.deepEqual(
            captureEvents(input, () => {
              let keyboard = Keyboard.US_ENGLISH;
              let keystroke = keyboard.keystrokeForAction('ctrl+alt+shift+a');
              keyboard.dispatchEventsForKeystroke(keystroke, input);
            }).map(e => {
              let parts = [e.type];
              if (e.ctrlKey) {
                parts.push('ctrl');
              }
              if (e.altKey) {
                parts.push('alt');
              }
              if (e.shiftKey) {
                parts.push('shift');
              }
              if (e.metaKey) {
                parts.push('meta');
              }
              return parts.join(',');
            }),
            [
              'keydown,ctrl',
              'keydown,ctrl,shift',
              'keydown,ctrl,alt,shift',
              'keydown,ctrl,alt,shift', // keydown a
              'keyup,ctrl,alt,shift', // keyup a
              'keyup,alt,shift',
              'keyup,alt',
              'keyup'
            ]
          );
        });

        context('when the keystroke will input a character', function() {
          it('dispatches keydown, keypress, textInput, input, and keyup', function() {
            // Simulate typing 'A'.
            assert.deepEqual(
              captureEventSummaries(input, () => {
                let keyboard = new Keyboard({ 65: A }, { SHIFT: 16 });
                keyboard.dispatchEventsForKeystroke(A, input);
              }),
              [
                // shift key
                ['keydown', 0, 16],

                // 'A' key
                ['keydown', 0, 97],
                ['keypress', 65, 65],
                ['textInput', undefined, undefined],
                ['input', undefined, undefined],
                ['keyup', 0, 97],

                // shift key
                ['keyup', 0, 16]
              ]
            );
          });
        });
      }
    );
  });

  describe('#dispatchEventsForInput', function() {
    let document;
    let input;

    beforeEach(function() {
      document = getDocument();
      input = document.createElement('input');
    });

    it('dispatches events for each character', function() {
      assert.deepEqual(
        captureEventSummaries(input, () => {
          let keyboard = Keyboard.US_ENGLISH;
          keyboard.dispatchEventsForInput('abc', input);
        }),
        [
          // a
          ['keydown', 0, 65],
          ['keypress', 97, 97],
          ['textInput', undefined, undefined],
          ['input', undefined, undefined],
          ['keyup', 0, 65],

          // b
          ['keydown', 0, 66],
          ['keypress', 98, 98],
          ['textInput', undefined, undefined],
          ['input', undefined, undefined],
          ['keyup', 0, 66],

          // c
          ['keydown', 0, 67],
          ['keypress', 99, 99],
          ['textInput', undefined, undefined],
          ['input', undefined, undefined],
          ['keyup', 0, 67]
        ]
      );
    });

    it('coalesces modifier key events when succeeding keypresses use those modifiers', function() {
      assert.deepEqual(
        captureEventSummaries(input, () => {
          let keyboard = Keyboard.US_ENGLISH;
          keyboard.dispatchEventsForInput('ABc', input);
        }),
        [
          // shift
          ['keydown', 0, 16],

          // A
          ['keydown', 0, 65],
          ['keypress', 65, 65],
          ['textInput', undefined, undefined],
          ['input', undefined, undefined],
          ['keyup', 0, 65],

          // B
          ['keydown', 0, 66],
          ['keypress', 66, 66],
          ['textInput', undefined, undefined],
          ['input', undefined, undefined],
          ['keyup', 0, 66],

          // shift
          ['keyup', 0, 16],

          // c
          ['keydown', 0, 67],
          ['keypress', 99, 99],
          ['textInput', undefined, undefined],
          ['input', undefined, undefined],
          ['keyup', 0, 67]
        ]
      );
    });
  });

  describe('#dispatchEventsForAction', function() {
    let document;
    let input;

    beforeEach(function() {
      document = getDocument();
      input = document.createElement('input');
    });

    it('dispatches events for each key', function() {
      assert.deepEqual(
        captureEventSummaries(input, () => {
          let keyboard = Keyboard.US_ENGLISH;
          keyboard.dispatchEventsForAction('ctrl+a', input);
        }),
        [
          // ctrl down
          ['keydown', 0, 17],

          // a
          ['keydown', 0, 65],
          ['keyup', 0, 65],

          // ctrl up
          ['keyup', 0, 17]
        ]
      );
    });

    it('accepts named "action" keys', function() {
      assert.deepEqual(
        captureEventSummaries(input, () => {
          let keyboard = Keyboard.US_ENGLISH;
          keyboard.dispatchEventsForAction('alt+backspace', input);
        }),
        [
          // alt down
          ['keydown', 0, 18],

          // backspace
          ['keydown', 0, 8],
          ['keyup', 0, 8],

          // alt up
          ['keyup', 0, 18]
        ]
      );
    });

    it('throws when given an invalid modifier', function() {
      try {
        let keyboard = Keyboard.US_ENGLISH;
        keyboard.dispatchEventsForAction('ctrl+foobar+a', input);
        assert.fail('expected an exception!');
      } catch (ex) {
        assert.strictEqual(
          ex.message,
          'in "ctrl+foobar+a", invalid modifier: foobar'
        );
      }
    });

    it('throws when given an invalid action/character', function() {
      try {
        let keyboard = Keyboard.US_ENGLISH;
        keyboard.dispatchEventsForAction('ctrl+abc', input);
        assert.fail('expected an exception!');
      } catch (ex) {
        assert.strictEqual(ex.message, 'in "ctrl+abc", invalid action: abc');
      }
    });
  });
});
