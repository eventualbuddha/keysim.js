(function() {
    "use strict";

    var index$$$__Object$defineProperty = Object.defineProperty;
    var index$$CTRL  = 1 << 0;
    var index$$META  = 1 << 1;
    var index$$ALT   = 1 << 2;
    var index$$SHIFT = 1 << 3;

    var index$$Keystroke = function() {
      "use strict";

      function Keystroke(modifiers, keyCode) {
        this.modifiers = modifiers;
        this.ctrlKey = !!(modifiers & index$$CTRL);
        this.metaKey = !!(modifiers & index$$META);
        this.altKey = !!(modifiers & index$$ALT);
        this.shiftKey = !!(modifiers & index$$SHIFT);
        this.keyCode = keyCode;
      }

      index$$$__Object$defineProperty(Keystroke, "CTRL", {
        get: function() {
          return index$$CTRL;
        },

        enumerable: true,
        configurable: true
      });

      index$$$__Object$defineProperty(Keystroke, "META", {
        get: function() {
          return index$$META;
        },

        enumerable: true,
        configurable: true
      });

      index$$$__Object$defineProperty(Keystroke, "ALT", {
        get: function() {
          return index$$ALT;
        },

        enumerable: true,
        configurable: true
      });

      index$$$__Object$defineProperty(Keystroke, "SHIFT", {
        get: function() {
          return index$$SHIFT;
        },

        enumerable: true,
        configurable: true
      });

      return Keystroke;
    }();

    var index$$Keyboard = function() {
      "use strict";

      function Keyboard(charCodeKeyCodeMap, actionKeyCodeMap) {
        this._charCodeKeyCodeMap = charCodeKeyCodeMap;
        this._actionKeyCodeMap = actionKeyCodeMap;
      }

      index$$$__Object$defineProperty(Keyboard.prototype, "charCodeForKeystroke", {
        value: function(keystroke) {
          var map = this._charCodeKeyCodeMap;
          for (var charCode in map) {
            if (Object.prototype.hasOwnProperty.call(map, charCode)) {
              var keystrokeForCharCode = map[charCode];
              if (keystroke.keyCode === keystrokeForCharCode.keyCode &&
                keystroke.modifiers === keystrokeForCharCode.modifiers) {
                return parseInt(charCode, 10);
              }
            }
          }
          return null;
        },

        enumerable: false,
        writable: true
      });

      index$$$__Object$defineProperty(Keyboard.prototype, "createEventFromKeystroke", {
        value: function(type, keystroke, target) {
          var document = target.ownerDocument;
          var window = document.defaultView;
          var Event = window.Event;

          var event;

          try {
            event = new Event(type);
          } catch(e) {
            event = document.createEvent('UIEvents');
          }

          event.initEvent(type, true, true);

          switch (type) {
            case 'textInput':
              event.data = String.fromCharCode(this.charCodeForKeystroke(keystroke));
              break;

            case 'keydown': case 'keypress': case 'keyup':
              event.shiftKey = keystroke.shiftKey;
              event.altKey = keystroke.altKey;
              event.metaKey = keystroke.metaKey;
              event.ctrlKey = keystroke.ctrlKey;
              event.keyCode = type === 'keypress' ? this.charCodeForKeystroke(keystroke) : keystroke.keyCode;
              event.charCode = type === 'keypress' ? event.keyCode : 0;
              event.which = event.keyCode;
              break;
          }

          return event;
        },

        enumerable: false,
        writable: true
      });

      index$$$__Object$defineProperty(Keyboard.prototype, "dispatchEventsForAction", {
        value: function(action, target) {
          var keystroke = this.keystrokeForAction(action);
          this.dispatchEventsForKeystroke(keystroke, target);
        },

        enumerable: false,
        writable: true
      });

      index$$$__Object$defineProperty(Keyboard.prototype, "dispatchEventsForInput", {
        value: function(input, target) {
          var currentModifierState = 0;
          for (var i = 0, length = input.length; i < length; i++) {
            var keystroke = this.keystrokeForCharCode(input.charCodeAt(i));
            this.dispatchModifierStateTransition(target, currentModifierState, keystroke.modifiers);
            this.dispatchEventsForKeystroke(keystroke, target, false);
            currentModifierState = keystroke.modifiers;
          }
          this.dispatchModifierStateTransition(target, currentModifierState, 0);
        },

        enumerable: false,
        writable: true
      });

      index$$$__Object$defineProperty(Keyboard.prototype, "dispatchEventsForKeystroke", {
        value: function(keystroke, target) {
          var transitionModifiers = (arguments[2] !== void 0 ? arguments[2] : true);

          if (transitionModifiers) {
            this.dispatchModifierStateTransition(target, 0, keystroke.modifiers);
          }

          var keydownEvent = this.createEventFromKeystroke('keydown', keystroke, target);

          if (target.dispatchEvent(keydownEvent) && this.targetCanReceiveTextInput(target)) {
            var keypressEvent = this.createEventFromKeystroke('keypress', keystroke, target);
            if (keypressEvent.charCode && target.dispatchEvent(keypressEvent)) {
              var textinputEvent = this.createEventFromKeystroke('textInput', keystroke, target);
              target.dispatchEvent(textinputEvent);
            }
          }

          var keyupEvent = this.createEventFromKeystroke('keyup', keystroke, target);
          target.dispatchEvent(keyupEvent);

          if (transitionModifiers) {
            this.dispatchModifierStateTransition(target, keystroke.modifiers, 0);
          }
        },

        enumerable: false,
        writable: true
      });

      index$$$__Object$defineProperty(Keyboard.prototype, "dispatchModifierStateTransition", {
        value: function(target, fromModifierState, toModifierState) {
          var currentModifierState = fromModifierState;
          var didHaveMeta = (fromModifierState & index$$META) === index$$META;
          var willHaveMeta = (toModifierState & index$$META) === index$$META;
          var didHaveCtrl = (fromModifierState & index$$CTRL) === index$$CTRL;
          var willHaveCtrl = (toModifierState & index$$CTRL) === index$$CTRL;
          var didHaveShift = (fromModifierState & index$$SHIFT) === index$$SHIFT;
          var willHaveShift = (toModifierState & index$$SHIFT) === index$$SHIFT;
          var didHaveAlt = (fromModifierState & index$$ALT) === index$$ALT;
          var willHaveAlt = (toModifierState & index$$ALT) === index$$ALT;

          if (didHaveMeta === true && willHaveMeta === false) {
            // Release the meta key.
            currentModifierState &= ~index$$META;
            target.dispatchEvent(
              this.createEventFromKeystroke(
                'keyup',
                new index$$Keystroke(currentModifierState, this._actionKeyCodeMap.META),
                target
              )
            );
          }

          if (didHaveCtrl === true && willHaveCtrl === false) {
            // Release the ctrl key.
            currentModifierState &= ~index$$CTRL;
            target.dispatchEvent(
              this.createEventFromKeystroke(
                'keyup',
                new index$$Keystroke(currentModifierState, this._actionKeyCodeMap.CTRL),
                target
              )
            );
          }

          if (didHaveShift === true && willHaveShift === false) {
            // Release the shift key.
            currentModifierState &= ~index$$SHIFT;
            target.dispatchEvent(
              this.createEventFromKeystroke(
                'keyup',
                new index$$Keystroke(currentModifierState, this._actionKeyCodeMap.SHIFT),
                target
              )
            );
          }

          if (didHaveAlt === true && willHaveAlt === false) {
            // Release the alt key.
            currentModifierState &= ~index$$ALT;
            target.dispatchEvent(
              this.createEventFromKeystroke(
                'keyup',
                new index$$Keystroke(currentModifierState, this._actionKeyCodeMap.ALT),
                target
              )
            );
          }


          if (didHaveMeta === false && willHaveMeta === true) {
            // Press the meta key.
            currentModifierState |= index$$META;
            target.dispatchEvent(
              this.createEventFromKeystroke(
                'keydown',
                new index$$Keystroke(currentModifierState, this._actionKeyCodeMap.META),
                target
              )
            );
          }

          if (didHaveCtrl === false && willHaveCtrl === true) {
            // Press the ctrl key.
            currentModifierState |= index$$CTRL;
            target.dispatchEvent(
              this.createEventFromKeystroke(
                'keydown',
                new index$$Keystroke(currentModifierState, this._actionKeyCodeMap.CTRL),
                target
              )
            );
          }

          if (didHaveShift === false && willHaveShift === true) {
            // Press the shift key.
            currentModifierState |= index$$SHIFT;
            target.dispatchEvent(
              this.createEventFromKeystroke(
                'keydown',
                new index$$Keystroke(currentModifierState, this._actionKeyCodeMap.SHIFT),
                target
              )
            );
          }

          if (didHaveAlt === false && willHaveAlt === true) {
            // Press the alt key.
            currentModifierState |= index$$ALT;
            target.dispatchEvent(
              this.createEventFromKeystroke(
                'keydown',
                new index$$Keystroke(currentModifierState, this._actionKeyCodeMap.ALT),
                target
              )
            );
          }

          if (currentModifierState !== toModifierState) {
            throw new Error(
              'internal error, expected modifier state: ' + toModifierState +
              ', got: ' + currentModifierState
            );
          }
        },

        enumerable: false,
        writable: true
      });

      index$$$__Object$defineProperty(Keyboard.prototype, "keystrokeForAction", {
        value: function(action) {
          var keyCode = null;
          var modifiers = 0;

          var parts = action.split('+');
          var lastPart = parts.pop();

          parts.forEach(function(part) {
            switch (part.toUpperCase()) {
              case 'CTRL':  modifiers |= index$$CTRL;  break;
              case 'META':  modifiers |= index$$META;  break;
              case 'ALT':   modifiers |= index$$ALT;   break;
              case 'SHIFT': modifiers |= index$$SHIFT; break;
              default:
                throw new Error('in "' + action + '", invalid modifier: ' + part);
                break;
            }
          });

          if (lastPart.toUpperCase() in this._actionKeyCodeMap) {
            keyCode = this._actionKeyCodeMap[lastPart.toUpperCase()];
          } else if (lastPart.length === 1) {
            var lastPartKeystroke = this.keystrokeForCharCode(lastPart.charCodeAt(0));
            modifiers |= lastPartKeystroke.modifiers;
            keyCode = lastPartKeystroke.keyCode;
          } else {
            throw new Error('in "' + action + '", invalid action: ' + lastPart);
          }

          return new index$$Keystroke(modifiers, keyCode);
        },

        enumerable: false,
        writable: true
      });

      index$$$__Object$defineProperty(Keyboard.prototype, "keystrokeForCharCode", {
        value: function(charCode) {
          return this._charCodeKeyCodeMap[charCode] || null;
        },

        enumerable: false,
        writable: true
      });

      index$$$__Object$defineProperty(Keyboard.prototype, "targetCanReceiveTextInput", {
        value: function(target) {
          if (!target) { return false; }

          switch (target.nodeName && target.nodeName.toLowerCase()) {
            case 'input':
              var type = target.type;
              return !(type === 'hidden' || type === 'radio' || type === 'checkbox');

            case 'textarea':
              return true;

            default:
              return false;
          }
        },

        enumerable: false,
        writable: true
      });

      index$$$__Object$defineProperty(Keyboard, "US_ENGLISH", {
        get: function() {
          return new Keyboard(
            index$$US_ENGLISH_CHARCODE_KEYCODE_MAP,
            index$$US_ENGLISH_ACTION_KEYCODE_MAP
          );
        },

        enumerable: true,
        configurable: true
      });

      return Keyboard;
    }();

    var index$$US_ENGLISH_CHARCODE_KEYCODE_MAP = {
      32:  new index$$Keystroke(0,     32),  // <space>
      33:  new index$$Keystroke(index$$SHIFT, 49),  // !
      34:  new index$$Keystroke(index$$SHIFT, 222), // "
      35:  new index$$Keystroke(index$$SHIFT, 51),  // #
      36:  new index$$Keystroke(index$$SHIFT, 52),  // $
      37:  new index$$Keystroke(index$$SHIFT, 53),  // %
      38:  new index$$Keystroke(index$$SHIFT, 55),  // &
      39:  new index$$Keystroke(0,     222), // '
      40:  new index$$Keystroke(index$$SHIFT, 57),  // (
      41:  new index$$Keystroke(index$$SHIFT, 48),  // )
      42:  new index$$Keystroke(index$$SHIFT, 56),  // *
      43:  new index$$Keystroke(index$$SHIFT, 187), // +
      44:  new index$$Keystroke(0,     188), // ,
      45:  new index$$Keystroke(0,     189), // -
      46:  new index$$Keystroke(0,     190), // .
      47:  new index$$Keystroke(0,     191), // /
      48:  new index$$Keystroke(0,     48),  // 0
      49:  new index$$Keystroke(0,     49),  // 1
      50:  new index$$Keystroke(0,     50),  // 2
      51:  new index$$Keystroke(0,     51),  // 3
      52:  new index$$Keystroke(0,     52),  // 4
      53:  new index$$Keystroke(0,     53),  // 5
      54:  new index$$Keystroke(0,     54),  // 6
      55:  new index$$Keystroke(0,     55),  // 7
      56:  new index$$Keystroke(0,     56),  // 8
      57:  new index$$Keystroke(0,     57),  // 9
      58:  new index$$Keystroke(index$$SHIFT, 186), // :
      59:  new index$$Keystroke(0,     186), // ;
      60:  new index$$Keystroke(index$$SHIFT, 188), // <
      61:  new index$$Keystroke(0,     187), // =
      62:  new index$$Keystroke(index$$SHIFT, 190), // >
      63:  new index$$Keystroke(index$$SHIFT, 191), // ?
      64:  new index$$Keystroke(index$$SHIFT, 50),  // @
      65:  new index$$Keystroke(index$$SHIFT, 65),  // A
      66:  new index$$Keystroke(index$$SHIFT, 66),  // B
      67:  new index$$Keystroke(index$$SHIFT, 67),  // C
      68:  new index$$Keystroke(index$$SHIFT, 68),  // D
      69:  new index$$Keystroke(index$$SHIFT, 69),  // E
      70:  new index$$Keystroke(index$$SHIFT, 70),  // F
      71:  new index$$Keystroke(index$$SHIFT, 71),  // G
      72:  new index$$Keystroke(index$$SHIFT, 72),  // H
      73:  new index$$Keystroke(index$$SHIFT, 73),  // I
      74:  new index$$Keystroke(index$$SHIFT, 74),  // J
      75:  new index$$Keystroke(index$$SHIFT, 75),  // K
      76:  new index$$Keystroke(index$$SHIFT, 76),  // L
      77:  new index$$Keystroke(index$$SHIFT, 77),  // M
      78:  new index$$Keystroke(index$$SHIFT, 78),  // N
      79:  new index$$Keystroke(index$$SHIFT, 79),  // O
      80:  new index$$Keystroke(index$$SHIFT, 80),  // P
      81:  new index$$Keystroke(index$$SHIFT, 81),  // Q
      82:  new index$$Keystroke(index$$SHIFT, 82),  // R
      83:  new index$$Keystroke(index$$SHIFT, 83),  // S
      84:  new index$$Keystroke(index$$SHIFT, 84),  // T
      85:  new index$$Keystroke(index$$SHIFT, 85),  // U
      86:  new index$$Keystroke(index$$SHIFT, 86),  // V
      87:  new index$$Keystroke(index$$SHIFT, 87),  // W
      88:  new index$$Keystroke(index$$SHIFT, 88),  // X
      89:  new index$$Keystroke(index$$SHIFT, 89),  // Y
      90:  new index$$Keystroke(index$$SHIFT, 90),  // Z
      91:  new index$$Keystroke(0,     219), // [
      92:  new index$$Keystroke(0,     220), // \
      93:  new index$$Keystroke(0,     221), // ]
      96:  new index$$Keystroke(0,     192), // `
      97:  new index$$Keystroke(0,     65),  // a
      98:  new index$$Keystroke(0,     66),  // b
      99:  new index$$Keystroke(0,     67),  // c
      100: new index$$Keystroke(0,     68),  // d
      101: new index$$Keystroke(0,     69),  // e
      102: new index$$Keystroke(0,     70),  // f
      103: new index$$Keystroke(0,     71),  // g
      104: new index$$Keystroke(0,     72),  // h
      105: new index$$Keystroke(0,     73),  // i
      106: new index$$Keystroke(0,     74),  // j
      107: new index$$Keystroke(0,     75),  // k
      108: new index$$Keystroke(0,     76),  // l
      109: new index$$Keystroke(0,     77),  // m
      110: new index$$Keystroke(0,     78),  // n
      111: new index$$Keystroke(0,     79),  // o
      112: new index$$Keystroke(0,     80),  // p
      113: new index$$Keystroke(0,     81),  // q
      114: new index$$Keystroke(0,     82),  // r
      115: new index$$Keystroke(0,     83),  // s
      116: new index$$Keystroke(0,     84),  // t
      117: new index$$Keystroke(0,     85),  // u
      118: new index$$Keystroke(0,     86),  // v
      119: new index$$Keystroke(0,     87),  // w
      120: new index$$Keystroke(0,     88),  // x
      121: new index$$Keystroke(0,     89),  // y
      122: new index$$Keystroke(0,     90),  // z
      123: new index$$Keystroke(index$$SHIFT, 219), // {
      124: new index$$Keystroke(index$$SHIFT, 220), // |
      125: new index$$Keystroke(index$$SHIFT, 221), // }
      126: new index$$Keystroke(index$$SHIFT, 192)  // ~
    };

    var index$$US_ENGLISH_ACTION_KEYCODE_MAP = {
      BACKSPACE: 8,
      TAB:       9,
      ENTER:    13,
      SHIFT:    16,
      CTRL:     17,
      ALT:      18,
      PAUSE:    19,
      CAPSLOCK: 20,
      ESCAPE:   27,
      PAGEUP:   33,
      PAGEDOWN: 34,
      END:      35,
      HOME:     36,
      LEFT:     37,
      UP:       38,
      RIGHT:    39,
      DOWN:     40,
      INSERT:   45,
      DELETE:   46,
      META:     91,
      F1:      112,
      F2:      113,
      F3:      114,
      F4:      115,
      F5:      116,
      F6:      117,
      F7:      118,
      F8:      119,
      F9:      120,
      F10:     121,
      F11:     122,
      F12:     123
    };

    if (typeof module !== 'undefined' && module.exports) {
      exports.Keyboard = index$$Keyboard;
      exports.Keystroke = index$$Keystroke;
    } else if (typeof define !== 'undefined' && define.amd) {
      define(function() {
        return { Keyboard: index$$Keyboard, Keystroke: index$$Keystroke };
      });
    } else if (typeof window !== 'undefined') {
      window.keysim = { Keyboard: index$$Keyboard, Keystroke: index$$Keystroke };
    } else {
      this.keysim = { Keyboard: index$$Keyboard, Keystroke: index$$Keystroke };
    }
}).call(this);

//# sourceMappingURL=keysim.js.map