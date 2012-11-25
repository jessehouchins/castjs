/*
  [UTC methods] = UTC
  Thursday THURSDAY Thu THU T = day DAY dy DY d
  January JANUARY Jan JAN 01 1 = month MONTH mon MON mm m
  07 7 = DD D
  2013 13 = YYYY YY
  09 9 = HH H
  04 4 = MM M
  03 3 = SS S
*/





// cast.date('11/29/2012').value == [object Date]
// cast.date('11/29/2012').toString('') == [object Date]
// cast.date('foo').value == null

// cast.integer("56.3").value == 56
// cast.integer("56.3").lessThan(60) == 56
// cast.integer("56.3").greaterThan(20).lessThan(50) == null

// is.a.date('11/29/2012') == true
// is.a.date('foo') == false
// is.an.integer("56.3") == false




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
}('Cast', function () {


  // ### CAST MODULE

  var methods = {}

  CAST = function(x){
    this.value = x
    this.valid = true
  }

  CAST.prototype = methods

  Cast = {
    VERSION: '0.0.2',
    fn: function(obj, fn, prototype){
      if (typeof obj === 'string') {
        if (prototype) {
          for (var method in prototype){
            fn[method] = prototype[method]
          }
        }
        methods[obj] = setup(fn)
      }
      else {
        for (var name in obj) {
          methods[name] = setup(obj[name])
        }
      }
    },
    as: methods
  }

  Factory = function(x){
    this.value = x
  }


  //////////////

  Cast.fn('date', function(respondWith, x){
    respondWith(isNaN(Date.parse(x)) ? null : new Date(x))
    //this.value = isNaN(Date.parse(x)) ? null : new Date(x)
  },{
    format: function(str){
      var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      var months = ['January','February','March','April','May','June','July','August','September','October','November','December']
      var v = this.value
      var UTC = str.replace(/\s*UTC$/,'')
      UTC = (str != UTC) ? (str = UTC) && 'UTC' : ''
      var day = v['get'+UTC+'Day']()
      var month = v['get'+UTC+'Month']()
      var date = v['get'+UTC+'Date']()
      var year = v['get'+UTC+'FullYear']()
      var hour = v['get'+UTC+'Hours']()
      var min = v['get'+UTC+'Minutes']()
      var sec = v['get'+UTC+'Seconds']()
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

      return str.join('')
    }
  })


  // ### PRIVATE METHODS

  function setup(cast, method){
    function responder(x){
      if (x !== this.value && x === true || x === false) validate(this, x)
      else convert(this, x)
    }
  
    fn = (cast instanceof CAST) ? cast[method] : cast
    return function(x){
      if (!cast) cast = new CAST(x)
      var args = [function(x){ responder.apply(cast, x) }, cast.value]
      fn.apply(cast, args)
    }
  }

  function validate(cast, valid){
    var v = cast.value
    var cv = cast.converted.value
    // validate converted value
    if (cast.converted.valid !== false) {
      if (valid === undefined) valid = !(cv === undefined || cv === null || (cv !== cv) || (cv.getTime && isNaN(cv.getTime())))
      cast.converted.valid = !!valid
      cast.converted.invalid = !valid
    }
    // validate original value
    if (cast.valid !== false) {
      cast.valid = v === cv && cast.converted.valid
      cast.invalid = !cast.valid
    }
  }

  function convert(cast, x){
    cast.converted.value = x
    validate(cast)
  }

  function clone(x){
    if (x instanceof Array) return [].concat(x)
    if (x instanceof Date) return new Date(x)
    if (x instanceof Object) return null // not trying to deep clone objects yet...
    return x
  }

  function makeString(x){
    return x.toString ? x.toString() : ''
  }

  function realTypeof(x){
    return typeof x === 'object' ? Object.prototype.toString.call(x).replace(/^\[object |\]$/g,'').toLowerCase() : typeof x 
  }



  return Cast

})
