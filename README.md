# keysim.js

Simulate typing into DOM elements. This can be used anywhere you need to
simulate user keystrokes, but is particularly useful in testing environments.

[![build status](https://travis-ci.org/eventualbuddha/keysim.js.svg)](https://travis-ci.org/eventualbuddha/keysim.js)

## Installation

```sh
# Install via npm to use with a web or node (e.g. with jsdom) project.
$ npm install [--save-dev] keysim
# Install by copying the dist file.
$ git clone https://github.com/eventualbuddha/keysim.js.git
$ cp keysim.js/dist/keysim.js path/to/vendor/keysim.js
```

## Usage

There are two high-level methods for simulating keystrokes on a DOM element, one
for typing input into an element and one for typing non-input "action"
keystrokes. *Note that none of the methods provided by keysim will trigger the
browser's default behavior, such as inserting text or moving the cursor. It only
allows you to test your event handling code by sending the correct DOM events.*

### Entering Text

Get a standard keyboard and use it to fire events onto a DOM element:

```js
var input = document.getElementById('name');
var keyboard = Keysim.Keyboard.US_ENGLISH;
keyboard.dispatchEventsForInput('hello!', input);
```

This will fire events `keydown`, `keypress`, `keyup`, and `textInput` events
for each typed character in the input string. In addition, some characters
may require modifier keys in order to type. The `keydown` and `keyup` events
will be fired for these modifier keys (e.g. the SHIFT key) as appropriate.
<sup>1</sup>

### Triggering Special Actions

It is also sometimes useful to simulate special keys, or actions that do not
cause input. For example, here's how to simulate backward deleting a word and
selecting all text in the input:

```js
var input = document.getElementById('name');
var keyboard = Keysim.Keyboard.US_ENGLISH;
keyboard.dispatchEventsForAction('alt+backspace', input);
keyboard.dispatchEventsForAction((osx ? 'meta' : 'ctrl') + '+a', input);
```

### Raw Keystroke Dispatch

If you need to dispatch events for an exact sequence of keystrokes you may use
`Keyboard#dispatchEventsForKeystroke`, which is used by both
`Keyboard#dispatchEventsForInput` and `Keyboard#dispatchEventsForAction`.


```js
var input = document.getElementById('name');
var keyboard = Keysim.Keyboard.US_ENGLISH;
var ctrl_shift_enter = new Keysim.Keystroke(
  Keysim.Keystroke.CTRL | Keysim.Keystroke.SHIFT,
  13
);
keyboard.dispatchEventsForKeystroke(ctrl_shift_enter, input);
```

---

<sup>1</sup> Here is the complete set of events fired
(as reported by [this page](http://unixpapa.com/js/testkey.html)):

```
keydown  keyCode=72  (H)   which=72  (H)   charCode=0        
keypress keyCode=104 (h)   which=104 (h)   charCode=104 (h)  
textInput data=h
keyup    keyCode=72  (H)   which=72  (H)   charCode=0        
keydown  keyCode=69  (E)   which=69  (E)   charCode=0        
keypress keyCode=101 (e)   which=101 (e)   charCode=101 (e)  
textInput data=e
keyup    keyCode=69  (E)   which=69  (E)   charCode=0        
keydown  keyCode=76  (L)   which=76  (L)   charCode=0        
keypress keyCode=108 (l)   which=108 (l)   charCode=108 (l)  
textInput data=l
keyup    keyCode=76  (L)   which=76  (L)   charCode=0        
keydown  keyCode=76  (L)   which=76  (L)   charCode=0        
keypress keyCode=108 (l)   which=108 (l)   charCode=108 (l)  
textInput data=l
keyup    keyCode=76  (L)   which=76  (L)   charCode=0        
keydown  keyCode=79  (O)   which=79  (O)   charCode=0        
keypress keyCode=111 (o)   which=111 (o)   charCode=111 (o)  
textInput data=o
keyup    keyCode=79  (O)   which=79  (O)   charCode=0        
keydown  keyCode=16        which=16        charCode=0        
keydown  keyCode=49  (1)   which=49  (1)   charCode=0        
keypress keyCode=33  (!)   which=33  (!)   charCode=33  (!)  
textInput data=!
keyup    keyCode=49  (1)   which=49  (1)   charCode=0        
keyup    keyCode=16        which=16        charCode=0        
keydown  keyCode=91  ([)   which=91  ([)   charCode=0        
```

## Building

Ensure that the keysim dependencies are installed (`npm install`). Then run
`npm run build` to re-create `dist/keysim.js`.

## Testing

To run the tests in Chrome, run `npm run test:browser`. To run the tests in node,
run `npm run test:node`. Running `npm test` will run both.

## Contributing

Fork the project, create a branch, and fix your bug or add your feature on that
branch. Be sure to add tests for your bug fix or feature.
