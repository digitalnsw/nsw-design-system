/* eslint-disable */
class ScreenSizeDetector {
  constructor(options = {}) {
    const o = options;

    // User options validators
    if (o.onHeightChange && typeof o.onHeightChange !== "function")
      throw this._typeErrorMessageBuilder(
        '"onHeightChange"',
        "function",
        o.onHeightChange
      );
    if (o.onWidthChange && typeof o.onWidthChange !== "function")
      throw this._typeErrorMessageBuilder(
        '"onWidthChange"',
        "function",
        o.onWidthChange
      );
    if (o.onBothChange && typeof o.onBothChange !== "function")
      throw this._typeErrorMessageBuilder(
        '"onBothChange"',
        "function",
        o.onBothChange
      );

    if (o.widthDefinitions && !this._isEmptyObject(o.widthDefinitions)) {
      this._validateWidthDefinition(o.widthDefinitions);
    }

    window.addEventListener("resize", () => this._resizeHandler());

    const defaultOptions = {
      onHeightChange: () => {},
      onWidthChange: () => {},
      onBothChange: () => {},
      widthDefinitions: {
        smartwatch: {
          min: 0,
          max: 319,
          inclusion: "[]",
        },
        mobile: {
          min: 320,
          max: 480,
          inclusion: "[]",
        },
        tablet: {
          min: 481,
          max: 768,
          inclusion: "[]",
          onEnter: () => {},
          whileInside: () => {},
          onLeave: () => {},
        },
        laptop: {
          min: 769,
          max: 1024,
          inclusion: "[]",
        },
        desktop: {
          min: 1025,
          max: 1200,
          inclusion: "[]",
        },
        largedesktop: {
          min: 1201,
          max: Infinity,
          inclusion: "[]",
        },
      },
    };

    // Create final options with defaultOptions as the base, merged/overwritten by user supplied 'options'
    if (o.widthDefinitions) {
      if (!this._isEmptyObject(o.widthDefinitions)) {
        defaultOptions.widthDefinitions = {
          ...defaultOptions.widthDefinitions,
          ...o.widthDefinitions,
        };
        delete o.widthDefinitions;
      } else {
        defaultOptions.widthDefinitions = {};
      }
    }
    const finalOptions = { ...defaultOptions, ...o };

    // Set variables to class instance
    for (let [key, value] of Object.entries(finalOptions)) {
      this[key] = value;
    }

    this.width = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    this.height = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );

    const isObj = {};
    Object.keys(this.widthDefinitions).forEach((key) => (isObj[key] = false));
    this.is = isObj;

    this._computeIsAndCallbacks();
  }

  _aOrAn(noun) {
    return ["a", "e", "i", "o", "u"].includes(noun.charAt(0)) ? "an" : "a";
  }

  addWidthDefinitions(widthDefinitionObject, onDone = () => {}) {
    this._validateWidthDefinition(widthDefinitionObject, false);

    for (let [widthCategoryName, screenWidthObject] of Object.entries(
      widthDefinitionObject
    )) {
      this.widthDefinitions[widthCategoryName] = screenWidthObject;
    }

    this._computeIsAndCallbacks();

    onDone();
  }

  setMainCallback(when, callback, onDone = () => {}) {
    const acceptableEvents = {
      widthchange: "onWidthChange",
      heightchange: "onHeightChange",
      bothchange: "onBothChange",
    };

    if (!Object.keys(acceptableEvents).includes(when))
      throw `Error: The second parameter (when) has to be a string with a value of either "widthchange", "heightchange" or "bothchange". "${when}" was supplied`;

    const eventName = acceptableEvents[when];

    const callbackType = typeof callback;
    if (callbackType !== "function") {
      throw this._typeErrorMessageBuilder(
        `"${eventName}" for options`,
        "function",
        callbackType
      );
    }

    this[eventName] = () => callback();

    this._computeIsAndCallbacks();

    onDone();
  }

  removeMainCallback(when, onDone = () => {}) {
    const acceptableEvents = {
      widthchange: "onWidthChange",
      heightchange: "onHeightChange",
      bothchange: "onBothChange",
    };

    if (!Object.keys(acceptableEvents).includes(when))
      throw `Error: The first parameter (when) has to be a string with a value of either "widthchange", "heightchange" or "bothchange". "${when}" was supplied`;

    const eventName = acceptableEvents[when];

    this[eventName] = () => {};

    onDone();
  }

  _validateWidthDefinition(obj, atInit = true) {
    const where = atInit ? "widthDefinition" : "the main object";
    if (typeof obj !== "object")
      throw this._typeErrorMessageBuilder(
        atInit ? where : "The main object",
        "object",
        obj
      );

    // Required keys for a "widthDefinition" with array of acceptable "typeof"s
    const requiredKeys = {
      min: ["number"],
      max: ["number"],
      inclusion: ["string"],
    };

    for (let [widthCategoryName, screenWidthObject] of Object.entries(obj)) {
      if (typeof screenWidthObject !== "object")
        throw this._typeErrorMessageBuilder(
          `"${widthCategoryName}" inside ${where}`,
          "object",
          screenWidthObject
        );

      let validObj = true;

      let screenWidthObjectKeys = Object.keys(screenWidthObject);
      for (let acceptableKey of Object.keys(requiredKeys)) {
        if (!screenWidthObjectKeys.includes(acceptableKey)) {
          validObj = false;
        }
      }

      if (!validObj) {
        throw `Invalid ${where} for "${widthCategoryName}" due to missing required object key(s). "${widthCategoryName}" has to be an object containing "min" (Number), "max" (Number) and "inclusion" (String)`;
      }

      for (let [key, value] of Object.entries(screenWidthObject)) {
        const acceptableTypes = requiredKeys[key];

        // Current key requires validation
        if (acceptableTypes && !acceptableTypes.includes(typeof value)) {
          throw this._typeErrorMessageBuilder(
            `"${key}" for "${widthCategoryName}" inside ${where}`,
            acceptableTypes.join(", or "),
            value
          );
        }

        if (screenWidthObject.min > screenWidthObject.max) {
          throw `Error: The value of "min" has to be equals to or less than the value of "max" for "${widthCategoryName}" inside ${where}`;
        } else if (screenWidthObject.min > screenWidthObject.max) {
          throw `Error: The value of "max" has to be equals to or greater than the value of "min" for "${widthCategoryName}" inside ${where}`;
        }

        if (key === "inclusion") {
          if (!this._isValidInclusion(value)) {
            throw `Error: Invalid inclusion provided for screen size "${widthCategoryName}". The only valid value is a string with the value "[]", "()", "[)" or "()"`;
          }
        }

        // Optional whileInside, onEnter and onLeave functions. If supplied, they have to be a function
        const optionalCallbackFunctions = ["whileInside", "onEnter", "onLeave"];

        for (let callbackName of optionalCallbackFunctions) {
          if (key === callbackName) {
            if (typeof value !== "function") {
              throw this._typeErrorMessageBuilder(
                `"${key}" for "${widthCategoryName}" inside ${where}`,
                `function if defined`,
                value
              );
            }
          }
        }
      }
    }
  }

  removeWidthDefinition(widthCategoryName, onDone = () => {}) {
    if (!this.widthDefinitions[widthCategoryName]) {
      throw `"${widthCategoryName}" is not found in "widthDefinitions" for removal`;
    }

    delete this.widthDefinitions[widthCategoryName];

    onDone();
  }

  setWidthCategoryCallback(
    widthCategoryName,
    when,
    callback,
    onDone = () => {}
  ) {
    if (!this.widthDefinitions[widthCategoryName]) {
      throw `Error: "${widthCategoryName}" is not found in "widthDefinitions". You need to define it first by using the "defineWidth" method`;
    }

    const acceptableEvents = {
      enter: "onEnter",
      inside: "whileInside",
      leave: "onLeave",
    };

    if (!Object.keys(acceptableEvents).includes(when))
      throw `Error: The second parameter (when) has to be a string with a value of either "enter", "inside" or "leave". "${when}" was supplied`;

    const eventName = acceptableEvents[when];

    const callbackType = typeof callback;
    if (callbackType !== "function") {
      throw this._typeErrorMessageBuilder(
        `"${eventName}" for "${widthCategoryName}" inside "widthDefinitions"`,
        "function",
        callbackType
      );
    }

    this.widthDefinitions[widthCategoryName][eventName] = () => callback();

    this._computeIsAndCallbacks();

    onDone();
  }

  removeWidthCategoryCallback(widthCategoryName, when, onDone = () => {}) {
    if (!this.widthDefinitions[widthCategoryName]) {
      throw `"${widthCategoryName}" is not found in "widthDefinitions" for callback removal`;
    }

    const acceptableEvents = {
      enter: "onEnter",
      inside: "whileInside",
      leave: "onLeave",
    };

    if (!Object.keys(acceptableEvents).includes(when))
      throw `Error: The second parameter (when) has to be a string with a value of either "enter", "inside" or "leave". "${when}" was supplied`;

    const eventName = acceptableEvents[when];

    delete this.widthDefinitions[widthCategoryName][eventName];

    onDone();
  }

  _typeErrorMessageBuilder(property, type, valueProvided) {
    const typeOfValueProvided = typeof valueProvided;
    return `Error: ${property} has to be ${this._aOrAn(
      type
    )} ${type} but ${this._aOrAn(
      typeOfValueProvided
    )} ${typeOfValueProvided} was provided`;
  }

  _isValidInclusion(inclusion) {
    const validInclusionRegex = /^[\[\(]{1}[\]\)]{1}/;
    return validInclusionRegex.test(inclusion);
  }

  _isWidthIncluded(screenSizeName, minWidth, maxWidth, inclusion) {
    if (!this._isValidInclusion(inclusion)) {
      throw `Error: Invalid inclusion provided for screen size "${screenSizeName}". The only valid combinations are "[]", "()", "[)" and "()"`;
    }

    const includeStart = inclusion[0] == "[" ? true : false;
    const includeEnd = inclusion[1] == "]" ? true : false;

    let startPass = includeStart
      ? this.width >= minWidth
      : this.width > minWidth;
    let endPass = includeEnd ? this.width <= maxWidth : this.width < maxWidth;

    return startPass && endPass;
  }

  _isEmptyObject(obj) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }
    return true;
  }

  _computeIsAndCallbacks() {
    for (let [name, property] of Object.entries(this.widthDefinitions)) {
      let oldIs = this.is[name];

      const _isWidthIncluded = this._isWidthIncluded(
        name,
        property.min,
        property.max,
        property.inclusion
      );
      this.is[name] = _isWidthIncluded;

      if (_isWidthIncluded && this.widthDefinitions[name].whileInside) {
        this.widthDefinitions[name].whileInside(this);
      }

      if (
        oldIs === false &&
        _isWidthIncluded &&
        this.widthDefinitions[name].onEnter
      ) {
        this.widthDefinitions[name].onEnter(this);
      }

      if (
        oldIs === true &&
        !_isWidthIncluded &&
        this.widthDefinitions[name].onLeave
      ) {
        this.widthDefinitions[name].onLeave(this);
      }
    }
  }

  _resizeHandler() {
    const oldWidth = this.width;
    const oldHeight = this.height;

    this.width = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    this.height = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );

    this._computeIsAndCallbacks();

    if (oldWidth !== this.width && oldHeight === this.height) {
      this.onWidthChange(this);
    } else if (oldWidth === this.width && oldHeight !== this.height) {
      this.onHeightChange(this);
    } else if (
      oldWidth &&
      oldHeight &&
      this.width &&
      this.height &&
      oldWidth !== this.width &&
      oldHeight !== this.height
    ) {
      this.onBothChange(this);
    }
  }
}

export default ScreenSizeDetector
