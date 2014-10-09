import { Keyboard, Keystroke } from './index';

if (typeof module !== 'undefined' && module.exports) {
  exports.Keyboard = Keyboard;
  exports.Keystroke = Keystroke;
} else if (typeof define !== 'undefined' && define.amd) {
  define(() => ({ Keyboard: Keyboard, Keystroke: Keystroke }));
} else if (typeof window !== 'undefined') {
  window.keysim = { Keyboard: Keyboard, Keystroke: Keystroke };
} else {
  this.keysim = { Keyboard: Keyboard, Keystroke: Keystroke };
}
