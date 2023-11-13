class ScreenSizeDetector {
  constructor(options = {}) {
    this.options = options
    this.width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    this.height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    this.msg = false
    this.init()
  }

  init() {
    this.UserOptionsValidators()

    window.addEventListener('resize', () => this.resizeHandler())

    this.createFinalOptions()

    this.computeIsAndCallbacks()
  }

  UserOptionsValidators() {
    if (this.options.onHeightChange && typeof this.options.onHeightChange !== 'function') {
      throw this.typeErrorMessageBuilder(
        '"onHeightChange"',
        'function',
        this.options.onHeightChange,
      )
    }

    if (this.options.onWidthChange && typeof this.options.onWidthChange !== 'function') {
      throw this.typeErrorMessageBuilder(
        '"onWidthChange"',
        'function',
        this.options.onWidthChange,
      )
    }

    if (this.options.onBothChange && typeof this.options.onBothChange !== 'function') {
      throw this.typeErrorMessageBuilder(
        '"onBothChange"',
        'function',
        this.options.onBothChange,
      )
    }

    if (this.options.widthDefinitions && !this.constructor.isEmptyObject(this.options.widthDefinitions)) {
      this.validateWidthDefinition(this.options.widthDefinitions)
    }
  }

  createFinalOptions() {
    const defaultOptions = {
      onHeightChange: () => {},
      onWidthChange: () => {},
      onBothChange: () => {},
      widthDefinitions: {
        smartwatch: {
          min: 0,
          max: 319,
          inclusion: '[]',
        },
        mobile: {
          min: 320,
          max: 480,
          inclusion: '[]',
        },
        tablet: {
          min: 481,
          max: 768,
          inclusion: '[]',
          onEnter: () => {},
          whileInside: () => {},
          onLeave: () => {},
        },
        laptop: {
          min: 769,
          max: 1024,
          inclusion: '[]',
        },
        desktop: {
          min: 1025,
          max: 1200,
          inclusion: '[]',
        },
        largedesktop: {
          min: 1201,
          max: Infinity,
          inclusion: '[]',
        },
      },
    }

    // Create final options with defaultOptions as the base, merged/overwritten by user supplied 'options'
    if (this.options.widthDefinitions) {
      if (!this.constructor.isEmptyObject(this.options.widthDefinitions)) {
        defaultOptions.widthDefinitions = {
          ...defaultOptions.widthDefinitions,
          ...this.options.widthDefinitions,
        }
        delete this.options.widthDefinitions
      } else {
        defaultOptions.widthDefinitions = {}
      }
    }

    const finalOptions = { ...defaultOptions, ...this.options }

    // Set variables to class instance
    Object.entries(finalOptions).forEach(([key, value]) => {
      this[key] = value
    })

    const isObj = {}

    Object.keys(this.widthDefinitions).forEach((key) => {
      isObj[key] = false
    })

    this.is = isObj
  }

  addWidthDefinitions(widthDefinitionObject, onDone = () => {}) {
    this.validateWidthDefinition(widthDefinitionObject, false)

    Object.entries(widthDefinitionObject).forEach(([widthCategoryName, screenWidthObject]) => {
      this.widthDefinitions[widthCategoryName] = screenWidthObject
    })

    this.computeIsAndCallbacks()

    onDone()
  }

  setMainCallback(when, callback, onDone = () => {}) {
    const acceptableEvents = {
      widthchange: 'onWidthChange',
      heightchange: 'onHeightChange',
      bothchange: 'onBothChange',
    }

    if (!Object.keys(acceptableEvents).includes(when)) {
      this.msg = `Error: The second parameter (when) has to be a string with a value of either "widthchange", "heightchange" or "bothchange". "${when}" was supplied`
      throw this.msg
    }

    const eventName = acceptableEvents[when]

    const callbackType = typeof callback
    if (callbackType !== 'function') {
      throw this.typeErrorMessageBuilder(
        `"${eventName}" for options`,
        'function',
        callbackType,
      )
    }

    this[eventName] = () => callback()

    this.computeIsAndCallbacks()

    onDone()
  }

  removeMainCallback(when, onDone = () => {}) {
    const acceptableEvents = {
      widthchange: 'onWidthChange',
      heightchange: 'onHeightChange',
      bothchange: 'onBothChange',
    }

    if (!Object.keys(acceptableEvents).includes(when)) {
      this.msg = `Error: The first parameter (when) has to be a string with a value of either "widthchange", "heightchange" or "bothchange". "${when}" was supplied`
      throw this.msg
    }

    const eventName = acceptableEvents[when]

    this[eventName] = () => {}

    onDone()
  }

  validateWidthDefinition(obj, atInit = true) {
    const where = atInit ? 'widthDefinition' : 'the main object'
    if (typeof obj !== 'object') {
      throw this.typeErrorMessageBuilder(
        atInit ? where : 'The main object',
        'object',
        obj,
      )
    }

    // Required keys for a "widthDefinition" with array of acceptable "typeof"s
    const requiredKeys = {
      min: ['number'],
      max: ['number'],
      inclusion: ['string'],
    }

    Object.entries(obj).forEach(([widthCategoryName, screenWidthObject]) => {
      if (typeof screenWidthObject !== 'object') {
        throw this.typeErrorMessageBuilder(
          `"${widthCategoryName}" inside ${where}`,
          'object',
          screenWidthObject,
        )
      }

      let validObj = true

      const screenWidthObjectKeys = Object.keys(screenWidthObject)

      Object.keys(requiredKeys).forEach((acceptableKey) => {
        if (!screenWidthObjectKeys.includes(acceptableKey)) {
          validObj = false
        }
      })

      if (!validObj) {
        this.msg = `Invalid ${where} for "${widthCategoryName}" due to missing required object key(s). "${widthCategoryName}" has to be an object containing "min" (Number), "max" (Number) and "inclusion" (String)`
        throw this.msg
      }

      Object.entries(screenWidthObject).forEach(([key, value]) => {
        const acceptableTypes = requiredKeys[key]

        // Current key requires validation
        if (acceptableTypes && !acceptableTypes.includes(typeof value)) {
          throw this.typeErrorMessageBuilder(
            `"${key}" for "${widthCategoryName}" inside ${where}`,
            acceptableTypes.join(', or '),
            value,
          )
        }

        if (screenWidthObject.min > screenWidthObject.max) {
          this.msg = `Error: The value of "min" has to be equals to or less than the value of "max" for "${widthCategoryName}" inside ${where}`
          throw this.msg
        } else if (screenWidthObject.min < screenWidthObject.max) {
          this.msg = `Error: The value of "max" has to be equals to or greater than the value of "min" for "${widthCategoryName}" inside ${where}`
          throw this.msg
        }

        if (key === 'inclusion') {
          if (!this.constructor.isValidInclusion(value)) {
            this.msg = `Error: Invalid inclusion provided for screen size "${widthCategoryName}". The only valid value is a string with the value "[]", "()", "[)" or "()"`
            throw this.msg
          }
        }

        // Optional whileInside, onEnter and onLeave functions. If supplied, they have to be a function
        const optionalCallbackFunctions = ['whileInside', 'onEnter', 'onLeave']

        optionalCallbackFunctions.forEach((callbackName) => {
          if (key === callbackName) {
            if (typeof value !== 'function') {
              throw this.typeErrorMessageBuilder(
                `"${key}" for "${widthCategoryName}" inside ${where}`,
                'function if defined',
                value,
              )
            }
          }
        })
      })
    })
  }

  removeWidthDefinition(widthCategoryName, onDone = () => {}) {
    if (!this.widthDefinitions[widthCategoryName]) {
      this.msg = `"${widthCategoryName}" is not found in "widthDefinitions" for removal`
      throw this.msg
    }

    delete this.widthDefinitions[widthCategoryName]

    onDone()
  }

  setWidthCategoryCallback(
    widthCategoryName,
    when,
    callback,
    onDone = () => {},
  ) {
    if (!this.widthDefinitions[widthCategoryName]) {
      this.msg = `Error: "${widthCategoryName}" is not found in "widthDefinitions". You need to define it first by using the "defineWidth" method`
      throw this.msg
    }

    const acceptableEvents = {
      enter: 'onEnter',
      inside: 'whileInside',
      leave: 'onLeave',
    }

    if (!Object.keys(acceptableEvents).includes(when)) {
      this.msg = `Error: The second parameter (when) has to be a string with a value of either "enter", "inside" or "leave". "${when}" was supplied`
      throw this.msg
    }

    const eventName = acceptableEvents[when]

    const callbackType = typeof callback
    if (callbackType !== 'function') {
      throw this.typeErrorMessageBuilder(
        `"${eventName}" for "${widthCategoryName}" inside "widthDefinitions"`,
        'function',
        callbackType,
      )
    }

    this.widthDefinitions[widthCategoryName][eventName] = () => callback()

    this.computeIsAndCallbacks()

    onDone()
  }

  removeWidthCategoryCallback(widthCategoryName, when, onDone = () => {}) {
    if (!this.widthDefinitions[widthCategoryName]) {
      this.msg = `"${widthCategoryName}" is not found in "widthDefinitions" for callback removal`
      throw this.msg
    }

    const acceptableEvents = {
      enter: 'onEnter',
      inside: 'whileInside',
      leave: 'onLeave',
    }

    if (!Object.keys(acceptableEvents).includes(when)) {
      this.msg = `Error: The second parameter (when) has to be a string with a value of either "enter", "inside" or "leave". "${when}" was supplied`
      throw this.msg
    }

    const eventName = acceptableEvents[when]

    delete this.widthDefinitions[widthCategoryName][eventName]

    onDone()
  }

  typeErrorMessageBuilder(property, type, valueProvided) {
    const typeOfValueProvided = typeof valueProvided
    return `Error: ${property} has to be ${this.constructor.aOrAn(
      type,
    )} ${type} but ${this.constructor.aOrAn(
      typeOfValueProvided,
    )} ${typeOfValueProvided} was provided`
  }

  isWidthIncluded(screenSizeName, minWidth, maxWidth, inclusion) {
    if (!this.constructor.isValidInclusion(inclusion)) {
      this.msg = `Error: Invalid inclusion provided for screen size "${screenSizeName}". The only valid combinations are "[]", "()", "[)" and "()"`
      throw this.msg
    }

    const includeStart = inclusion[0] === '['
    const includeEnd = inclusion[1] === ']'

    const startPass = includeStart
      ? this.width >= minWidth
      : this.width > minWidth
    const endPass = includeEnd ? this.width <= maxWidth : this.width < maxWidth

    return startPass && endPass
  }

  computeIsAndCallbacks() {
    Object.entries(this.widthDefinitions).forEach(([name, property]) => {
      const oldIs = this.is[name]

      const isWidthIncluded = this.isWidthIncluded(name, property.min, property.max, property.inclusion)
      this.is[name] = isWidthIncluded

      if (isWidthIncluded && this.widthDefinitions[name].whileInside) {
        this.widthDefinitions[name].whileInside(this)
      }

      if (oldIs === false && isWidthIncluded && this.widthDefinitions[name].onEnter
      ) {
        this.widthDefinitions[name].onEnter(this)
      }

      if (oldIs === true && !isWidthIncluded && this.widthDefinitions[name].onLeave) {
        this.widthDefinitions[name].onLeave(this)
      }
    })
  }

  resizeHandler() {
    const oldWidth = this.width
    const oldHeight = this.height

    this.width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    this.height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

    this.computeIsAndCallbacks()

    if (oldWidth !== this.width && oldHeight === this.height) {
      this.onWidthChange(this)
    } else if (oldWidth === this.width && oldHeight !== this.height) {
      this.onHeightChange(this)
    } else if (
      oldWidth
      && oldHeight
      && this.width
      && this.height
      && oldWidth !== this.width
      && oldHeight !== this.height
    ) {
      this.onBothChange(this)
    }
  }

  static isEmptyObject(obj) {
    obj.forEach((prop) => {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        return false
      }
      return true
    })
  }

  static isValidInclusion(inclusion) {
    const validInclusionRegex = /^[[(]{1}[\])]{1}/
    return validInclusionRegex.test(inclusion)
  }

  static aOrAn(noun) {
    return ['a', 'e', 'i', 'o', 'u'].includes(noun.charAt(0)) ? 'an' : 'a'
  }
}

export default ScreenSizeDetector
