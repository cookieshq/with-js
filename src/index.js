export const SELECTOR = '[class*="js-with-js--"]';

export default function withJS(target = SELECTOR, parent = document) {
  if (typeof target == 'string') {
    return [...parent.querySelectorAll(target)].forEach(el => {
      run(getUpdatesFromClasses(el), el);
    });
  }
  return run(getUpdatesFromClasses(target), target);
}

// A hash of the available operations
export const AVAILABLE_OPERATIONS = {
  remove(element) {
    element.parentElement.removeChild(element);
  },
  addAttribute(element, attributeName, attributeValue) {
    element.setAttribute(attributeName, attributeValue);
  },
  removeAttribute(element, attributeName) {
    element.removeAttribute(attributeName);
  },
  addClass(element, ...classes) {
    classes.forEach(className => {
      element.classList.add(className);
    });
  },
  removeClass(element, ...classes) {
    classes.forEach(className => {
      element.classList.remove(className);
    });
  }
};

/**
 * Runs the given `updates` on the provided `element`.
 * A list of `availableOperations` can be provided as
 * @param {HTMLElement} element The element to update
 * @param {Array} updates The list of updates to perform, in the `[operationName, ...arguments]`
 * @param {Object} options.availableOperations The available operations
 */
export function run(
  updates,
  element,
  { availableOperations = AVAILABLE_OPERATIONS } = {}
) {
  updates.forEach(([operationName, ...args]) => {
    if (availableOperations[operationName]) {
      availableOperations[operationName](element, ...args);
    }
  });
}

/**
 * Gets updates listed in the classes of given `element`
 * @param {HTMLElement} element
 * @returns {Array<Array>} An array of operations to perform
 */
export function getUpdatesFromClasses(elementOrClasses) {
  if (typeof elementOrClasses == 'string') {
    return getUpdatesFromClasses(elementOrClasses.split(' '));
  }

  if (elementOrClasses instanceof window.HTMLElement) {
    return getUpdatesFromClasses([...elementOrClasses.classList]);
  }

  return elementOrClasses
    .filter(c => /^js-with-js--.+/.test(c))
    .map(c => {
      const operationDescription = c.replace(/^js-with-js--/, '');
      const [operationName, argumentsDescription] = operationDescription.split(
        '__'
      );
      if (argumentsDescription) {
        const args = argumentsDescription.split('--');
        return [operationName, ...args];
      } else {
        return [operationName];
      }
    });
}
