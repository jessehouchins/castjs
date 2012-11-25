/*!
  * cast - validation and conversion library
  * https://github.com/jessehouchins/castjs
  * copyright Jesse Houchins
  * MIT License
  */

!function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()
}('cast', function () {


  // ### EXPOSED CONSTRUCTOR

  var cast = function(obj, prop){ return new Factory(obj, prop) }
  cast.VERSION = '0.0.3'

  // ### REGISTER CONVERTER

  cast.register = function(obj) {
    for (var type in obj) {
      (function(Cast, obj, type){
        var methods = obj[type]
        var initialize = (methods instanceof Function) ? methods : methods.initialize

        // build new cast module for type
        Cast[type] = function(){
          Cast.apply(this, arguments)
          var args = [this.value].concat(Array.prototype.slice.call(arguments,2))
          initialize.apply(this, args)
        }

        // setup new module prototype
        if (obj === constructor) {
          Cast[type].prototype = Cast.prototype
        } else {
          delete methods.initialize
          Cast[type].prototype = {}
          for (var method in methods) {
            (function(prototype, method, methods){
              prototype[method] = function(){
                if (this.invalid !== true && this.blank !== true) {
                  var args = [this.value].concat(Array.prototype.slice.call(arguments,0))
                  methods[method].apply(this, args)
                }
                return this
              }
            })(Cast[type].prototype, method, methods)
          }
          for (var proto in Cast.prototype) {
            Cast[type].prototype[proto] = Cast.prototype[proto]
          }
        }

        // create factory function for new module
        Factory.prototype[type] = function(opts){
          return new Cast[type](this.obj, this.prop, opts)
        }

      })(Cast, obj, type)
    }
  }


  // ### CAST FACTORY - passes cast arguments to module constructor

  function Factory(obj, prop){
    this.obj = obj
    this.prop = prop
  }

  Factory.prototype = {}


  // ### CAST MODULE - the base module gets extended through `cast.register`

  function Cast(obj, prop){
    var x = obj
    if (typeof prop === 'string') {
      x = obj[prop]
      this.obj = obj
      this.prop = prop
    }
    this.original = trimString(x)
    this.blank = isBlank(this.original)
    this.set(clone(x))
  }

  Cast.prototype = {
    set: function(x){
      // set value
      this.value = x
      if (this.prop) this.obj[this.prop] = x
      // track valid state
      if (this.valid !== false) {
        this.valid = this.blank || isValid(x)
        this.invalid = !this.valid
      }
      return this
    },
    // handle errors
    when: function(handlers){
      if (handlers.blank && this.blank) {
        handlers.blank()
      } else if (handlers.valid && this.valid) {
        handlers.valid(this.value)
      } else if (handlers.invalid && this.invalid) {
        handlers.invalid(this.original)
      }
    }
  }

/*////  CAST MODULES  ///////////////////////*/

  cast.register({

    date: {
      initialize: function(x){
        this.set(isNaN(Date.parse(x)) ? null : new Date(x))
      },
      beginningOfDay:function(x){
        this.set(realTypeof(x) === 'date' ? (x.setSeconds(0) && x.setMinutes(0) && x.setHours(0) && x) : null)
      },
      endOfDay:function(x){
        this.set(realTypeof(x) === 'date' ? (x.setSeconds(59) && x.setMinutes(59) && x.setHours(23) && x) : null)
      },
      format: function(x, str){
        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December']
        var UTC = str.replace(/\s*UTC$/,'')
        UTC = (str != UTC) ? (str = UTC) && 'UTC' : ''
        var day = x['get'+UTC+'Day']()
        var month = x['get'+UTC+'Month']()
        var date = x['get'+UTC+'Date']()
        var year = x['get'+UTC+'FullYear']()
        var hour = x['get'+UTC+'Hours']()
        var min = x['get'+UTC+'Minutes']()
        var sec = x['get'+UTC+'Seconds']()
        var str = str.split(/(day|DAY|dy|DY|D|month|MONTH|mon|MON|mm|m|yyyy|yy|dd|d|HH|H|MM|M|SS|S)/)

        tokens = {
          day: days[day],
          DAY: days[day].toUpperCase(),
          dy: days[day].substring(0,3),
          DY: days[day].substring(0,3).toUpperCase(),
          D: days[day].substring(0,1),
          month: months[month],
          MONTH: months[month].toUpperCase(),
          mon: months[month].substring(0,3),
          MON: months[month].substring(0,3).toUpperCase(),
          mm: month > 9 ? month+1 : "0"+(month+1),
          m: month+1,
          yyyy: year,
          yy: year.toString().substring(2),
          dd: date > 9 ? date : "0"+date,
          d: date,
          HH: hour > 9 ? hour : "0"+hour,
          H: hour,
          MM: min > 9 ? min : "0"+min,
          M: min,
          SS: sec > 9 ? sec : "0"+sec,
          S: sec
        }

        for ( var i=0; i<str.length; i++) {
          var token = str[i]
          if (tokens[token]) str[i] = tokens[token]
        }

        this.set(str.join(''))
      }
    },

    text: {
      initialize: function(x){
        this.set(makeString(x).replace(/^\s+|\s+$/g, ''))
      }
    },

    email: {
      initialize: function(x){
        x = makeString(x).replace(/^\s+|\s+$/g, '')
        this.set(!x.match(/.+@.+\..+/) ? null : x)
      }
    },

    integer: {
      initialize: function(x){
        this.set(makeString(x).match(/[^\D|\S]/g) ? null : Math.round(parseFloat(x, 10)))
      }
    }

  })

/////////////////////////////////////////////////////////////////////////


  // ### PRIVATE METHODS

  function clone(x){
    if (x instanceof Array) return [].concat(x)
    if (x instanceof Date) return new Date(x)
    if (x instanceof Object) JSON.parse(JSON.stringify(x))
    return x
  }

  function makeString(x){
    return isBlank(x) ? '' : x.toString && x.toString() || ''
  }

  function realTypeof(x){
    return typeof x === 'object' ? Object.prototype.toString.call(x).replace(/^\[object |\]$/g,'').toLowerCase() : typeof x 
  }

  function trimString(x){
    return (typeof x === 'string') ? x.replace(/^\s+|\s+$/g, '') : x
  }

  function isBlank(x){
    return x === undefined || x === null || x === ''
  }

  function isValid(x){
    return !(x === undefined || x === null || (x !== x) || (x.getTime && isNaN(x.getTime())))
  }

  return cast

})






// test attrs

var attrs = {
  date: 'Jan 4 2013',
  number: "4",
  name: "  Foobar    ",
  email: "  foo@bar.net   "
}

console.log('Original Attrs:', JSON.parse(JSON.stringify(attrs)))

cast(attrs, 'date').date().endOfDay().format('yyyy-mm-dd HH:MM:SS').when({
  blank: function(){ console.log('Date is required.') },
  invalid: function(x){ console.log('"'+x+'" is not a valid date.') },
  valid: function(x){ console.log('Date ('+x+') is valid.') }
})

cast(attrs, 'number').integer().when({
  blank: function(){ console.log('Number is required.') },
  invalid: function(x){ console.log('"'+x+'" is not a whole number.') },
  valid: function(x){ console.log('Number ('+x+') is valid.') }
})

cast(attrs, 'name').text().when({
  blank: function(){ console.log('Name is required.') },
  invalid: function(x){ console.log('"'+x+'" is not a valid name.') },
  valid: function(x){ console.log('Name ('+x+') is valid.') }
})

cast(attrs, 'email').email().when({
  blank: function(){ console.log('Email Address is required.') },
  invalid: function(x){ console.log('"'+x+'" is not a valid email address.') },
  valid: function(x){ console.log('Email ('+x+') is valid.') }
})

console.log('Cast Attrs:', attrs)
