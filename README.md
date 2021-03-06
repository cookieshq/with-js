With JS
=======

![File size badge](https://badgen.net/badgesize/normal/https/unpkg.com/@cookieshq/with-js/dist/with-js.iife.min.js)

A declarative way to add or remove attributes and classes on HTML elements when JavaScript is loaded. Extensible to allow running other kind of updates.

Why
---

Some attributes, classes and styles are only relevant once JavaScript has loaded:
 - ARIA properties or roles setting expectations for assistive technologies that are only fullfiled by JavaScript
 - Some fallback HTML that needs hiding once JavaScript is there, because an enhanced widget takes over the feature
 - Or inversely some HTML that needs revealing to provide a better experience, but only when JavaScript is present.

Because there's no guarantee JavaScript will load, they should not be present in the HTML that's downloaded by browsers. This library provides a declarative way (through either data attributes or classes) to quickly amend the initial markup once JavaScript has loaded, ensuring a clean experience when it doesn't.

Usage
---

The library will look for elements marked by specific classes in your HTML. Out of the box, withJS allows you to run the following operations by adding classes to your HTML elements:

- Removing the element from the DOM: `js-with-js--remove`
- Adding an attribute: `js-with-js--add-attribute__role--tab` will add the `role="tab"` to the element. More generally, you can use `js-with-js--add-attribute__<attribute-name>--<attribute-value>`.
- Removing an attribute: `js-with-js--remove-attribute__hidden` will remove the `hidden` attribute from the element. More generally, you can use `js-with-js--remove-attribute__<attribute-name>`
- Adding a class: `js-with-js--add-class__sr-only` will add the `sr-only` class to the element. More generally, you can use `js-with-js--add-class__<class-name>`
- Removing a class `js-with-js--remove-class__margin-top-0` will remove the `margin-top-0` class. More generally, you can use `js-with-js--remove-class__<class-name>`

You might have noticed the `js-with-js--<operation-name>__<argument1>--<argument2>` in all these classes. You can extend the library to provide your own operations to suit your needs (see bellow).

### Installation

1. Install the package with your favourite package manager

    ```sh
    npm install @cookieshq/with-js
    ```

   or

    ```sh
    yarn add @cookieshq/with-js
    ```

2. Import the library and call `withJS()` in your project:

   - using ES6 imports

      ```js
      import { withJS } from '@cookieshq/with-js/src/index'
      withJS();
      ```

      > Note: The `package.json` file does have a `module` field pointing to `src/index.js` which should allow to just import `@cookieshq/with-js`. However, specifying the whole path in the import was the most reliable way to get it working across the major bundlers (Webpack, Rollup and Parcel).

   - using Common JS imports

      ```js
      const withJS = require('@cookieshq/with-js')
      withJS();
      ```

   - with a `<script>` tag in your HTML

      ```html
      <script src="https://unpkg.com/@cookieshq/with-js/dist/with-js.iife.min.js" defer></script>
      <script async>
        document.addEventListener('DOMContentLoaded', function() {
          withJS();
        });
      </script>
      ```

> You have to explicitly call `withJS()` for the updates to get applied.
> This lets you be in control of when and with which options it runs.

### JS API

Without any arguments, `withJS()` will hunt for all elements with a class that contains `js-with-js--` in the `document`. You can also:

- pick a specific element to update with `withJS(element)`
- select other elements in the DOM with a CSS selector `withJS(selector)`
- restrict where `withJS` looks for the elements to update with `withJS({parent: element})`
- which can also be combined with using your own selector `withJS(selector, {parent:element})`, or less verbosely `withJS(selector, parentElement)`

Extending the library
---

Internally the library `run()`s the `updates()` it extracts from each target element(s). You can override both behaviors by providing your own functions in a final hash parameter:

```js
withJs({run: customRunFunction, updates: customUpdatesFunction});
withJs({parent: element, run: customRunFunction, updates: customUpdatesFunction});
withJs(element,{run: customRunFunction, updates: customUpdatesFunction});
withJs(selector,{run: customRunFunction, updates: customUpdatesFunction});
withJs(selector, parent,{run: customRunFunction, updates: customUpdatesFunction});
```

### Adding extra operations

You can add extra options by providing your own `run` function
that passes custom list of operation to the default implementation.

```js
import { withJS, applyUpdates,AVAILABLE_OPERATIONS } from '@cookieshq/with-js';

withJS({
  run: function(operations, el) {
    return applyUpdates(operations, el, {
      availableOperations: {
        ...AVAILABLE_OPERATIONS,
        // This would now allow things like `js-with-js--set-style__display--none`
        'set-style': function(element,property, value) {
          element.style[property] = value;
        }
      }
    })
  }
})
```

### Customizing the class pattern

Maybe you find the `js-with-js--` prefix a bit verbose,
or prefer different separators.  You can provide a custom `updates`
function that provides different options to the default implementation.

```js
import { withJS, getUpdatesFromClasses } from '@cookieshq/with-js';

withJS({
  updates: function(el) {
    // This would let you have class names like: `js--add-attribute:role,tabpanel`
    // As we're not looking to use the class for styling, the "special" characters
    // in the class won't be much of a bother.
    return getUpdatesFromClasses({
      marker: 'js--',
      operationToArgumentsSeparator: ':',
      argumentToArgumentSeparator: ','
    })
  },
  target: '[class*="js--"]'
})
```

Tooling
---

- The project is build with [Rollup](https://rollupjs.org), with [Babel](https://babeljs.io/) for compiling to ES5.
- Tests are run with [Ava](https://github.com/avajs/ava)
- Linting with [ESLint](https://eslint.org/) is set up on the project and should be triggered on commit thanks to [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged)
- The project uses [np](https://github.com/sindresorhus/np) to manage NPM releases

### NPM Scripts

The build commands are managed through npm scripts, mostly pass through to one of the modules above:

- `clean` to clean the `dist` directory
- `lint` for linting the JS files
- `test` for running the tests
- `build` for building the browser and CommonJS files. It'll trigger the `postbuild` script to minify the browser build
- `release` triggers a release to NPM. It'll automatically run `prepack` when creating the package to build the latest version of the library