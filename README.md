# cast.js

The cast.js library was written to provide convenient methods for validating and converting object properties for model based frameworks like [backbone.js](http://backbonejs.org). The core provides several features to make converting, validating, and error handling easier:

- __Convert object properties__ in place (by passing an object and property name)
- __Validate object properties__ without converting (by passing a value only)
- __Handle various data states__ at any point (blank, valid, invalid, out of range)

## Syntax

The syntax was designed to be human readable. See [the Module API](https://github.com/jessehouchins/castjs/Module-API) for complete documentation of built in modules.

``` javascript

  cast(obj, 'propName').as.a.dataType() // converts value in place
  cast(value).is.a.dataType().valid // returns true if value is valid for that data type

  // Note: is/as/a/an are optional.

```

Here are some real-world examples:

``` javascript

  cast(attrs, 'start_date').date().beginningOfDay()
  cast(attrs, 'email').email()
  if (cast(age).integer().atLeast(13).valid) {
    // do something
  }

```

## State Handlers

The `if` method allows you run callback functions based on the current state (blank, valid, out of range, or invalid). Usually this is done at the end of a method chain, but it can be done any time after the initial data type is cast.

``` javascript

  cast(attrs, 'foo').as.an.integer().atLeast(1).noMoreThan(bar).if({
    blank: function() { showError('foo', 'foo is required') },
    valid: function() { console.log('foo is valid') },
    outOfRange: function() { showError('foo', 'foo must be at least 1 and no more than ' + bar + '.') },
    invalid: function() { showError('foo', 'foo is not a whole number.') }
  })

```

__Note:__ States are evaulated in the order shown here. If a given state is true and a handler was provided, only the handler for that state will be called. If a state is true, but no handler was provided, the next state will be evaluated.

## Creating Custom Modules

### Registering your Module

You can add you own custom modules using the `cast.register` method. All modules must provide an `initialize` method at the very least. `cast.register` can be called in two ways:

``` javascript

  cast.register('myModule', function(arg1, arg2){ ... }) // For simple modules with no chained methods
  cast.register({ // For multiple modules or modules with chaining
    myModule: {
      initialize: function(arg1, arg2){ ... }, // initialize is called by cast(value).myModule()
      methodOne: function(arg1, arg2){ ... },
      methodTwo: function(arg1, arg2){ ... }
    }
  })

```

__Note:__ an unregister method is also provided for testing purposes: `cast.unregister('moduleOne', 'ModuleTwo', ...)`

### Aliases

You can add aliases for you modules or module methods by including the alias/method mapping in your module definition:

``` javascript

  cast.register({
    moduleName: {
      initialize: function(){ ... },
      methodName: function(){ ... },
      methodAlias: 'methodName'
    },
    moduleAlias: 'moduleName'
  })

```

### Setting the State

All of the methods in you module will change the state of the cast in some way or another. There are three built in helpers: `set`, `fail`, and `rangeError`. Here is an example of how they could be used:

``` javascript

  cast.register('positiveInteger', function(x) {
    x = parseInt(x, 10)
    if (isNaN(x)) return this.fail()
    if (x <= 0) return this.rangeError()
    this.set(x)
  })

```

### Built-in Helpers

Custom modules have access to a handfull of useful helpers for parsing data. You can use these from within you module methods by calling `this.helperName(x)`.

- `makeType(x)` converts `x` to a the same data type as the module by running it's initialize function and returning the value.
- `makeString(x)` converts `x` to a string if it can, or falls back to an empty string.
- `makeNumber(x,d)` parses `x` as a number, optionally to `d` decimal places or returns `NaN`.
- `realTypeof(x)` returns the actual type of `x`. Includes support for arrays and date objects.
- `trimString(x)` removes the leading and trailing whitespace from single line strings. Multi-line strings are not changed.
- `isBlank(x)` returns true if `x` is `null`, `undefined` or an empty string.
- `isValid(x)` returns false if `x` is `null`, `undefined`, `NaN` or `InvalidDate`.
