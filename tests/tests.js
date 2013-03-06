module("Core") ////////////////////////////////////

  test("Register/unregister a single module", 2, function(){
    cast.register('unregisterTest1', function(x){})
    cast.register('unregisterTest2', function(x){})
    var registered = cast().unregisterTest1 && cast().unregisterTest2

    cast.unregister('unregisterTest1', 'unregisterTest2')
    var unregistered = !cast().unregisterTest1 && !cast().unregisterTest2

    ok(registered, "Register test modules." )
    ok(unregistered, "Unregister test modules." )
  })

  test("Register/unregister many modules at once", 7, function(){
    var A, A1
    var B, B1, B2

    cast.register({
      A: {
        initialize: function(x){ A = x },
        A1: function(x){ A1 = x }
      },
      B: {
        initialize: function(x){ B = x },
        B1: function(x){ B1 = x },
        B2: function(x){ B2 = x }
      }
    })

    cast('A').A().A1()
    cast('B').B().B1().B2()

    ok(cast().A, "Module `A` registered")
    ok(cast().B, "Module `B` registered")
    ok(A === 'A', "`A` constructor called.")
    ok(A1 === 'A', "`A.A1` chained method called.")
    ok(B === 'B', "`B` constructor called.")
    ok(B1 === 'B', "`B.B1` chained method called.")
    ok(B2 === 'B', "`B.B1.B2` chained method called.")

    cast.unregister('A','B')
  })

  test("Initialize a module", 2, function(){
    var A
    cast.register('A', function(x){ A = x })
    cast('A').A()

    ok(cast().A, "Register a single module." )
    ok(A === 'A', "Initialize a registered module." )

    cast.unregister('A')
  })

  test("Handle blank data", 7, function(){
    var x = {}
    cast(null).text().if({
      blank: function(){ x.isNull = true }
    })
    cast(undefined).text().if({
      blank: function(){ x.isUndefined = true }
    })
    cast('').text().if({
      blank: function(){ x.isEmpty = true },
      valid: function(){ x.isValid = true },
      invalid: function(){ x.isInvalid = true },
      outOfRange: function(){ x.isOutOfRange = true }
    })
    cast('').text().if({
      valid: function(){ x.isValid2 = true }
    })

    ok(x.isNull, "Blank handler called when given null.")
    ok(x.isUndefined, "Blank handler called when given undefined.")
    ok(x.isEmpty, "Blank handler called when given empty string.")
    ok(!x.isValid, "Valid handler not called when blank and blank handler present.")
    ok(x.isValid2, "Valid handler called when blank and no blank handler present.")
    ok(!x.isInvalid, "Invalid handler not called when blank.")
    ok(!x.isOutOfRange, "OutOfRange handler not called when blank.")
  })

  test("Handle valid data", 4, function(){
    var x = {}
    cast("OK").text().if({
      blank: function(){ x.isblank = true },
      valid: function(){ x.isValid = true },
      invalid: function(){ x.isInvalid = true },
      outOfRange: function(){ x.isOutOfRange = true }
    })

    ok(!x.isblank, "Blank handler not called when valid.")
    ok(x.isValid, "Valid handler called when valid.")
    ok(!x.isInvalid, "Invalid handler not called when valid.")
    ok(!x.isOutOfRange, "OutOfRange handler not called when valid.")
  })


  test("Handle invalid data", 4, function(){
    var x = {}
    cast("OK").integer().if({
      blank: function(){ x.isblank = true },
      valid: function(){ x.isValid = true },
      invalid: function(){ x.isInvalid = true },
      outOfRange: function(){ x.isOutOfRange = true }
    })

    ok(!x.isblank, "Blank handler not called when invalid.")
    ok(!x.isValid, "Valid handler not called when invalid.")
    ok(x.isInvalid, "Invalid handler called when invalid.")
    ok(!x.isOutOfRange, "OutOfRange handler not called when invalid.")
  })

  test("Handle data that is out of range", 4, function(){
    var x = {}
    cast(2).integer().lessThan(1).if({
      blank: function(){ x.isblank = true },
      valid: function(){ x.isValid = true },
      invalid: function(){ x.isInvalid = true },
      outOfRange: function(){ x.isOutOfRange = true }
    })

    ok(!x.isblank, "Blank handler not called when out of range.")
    ok(!x.isValid, "Valid handler not called when out of range.")
    ok(!x.isInvalid, "Invalid handler not called when out of range.")
    ok(x.isOutOfRange, "OutOfRange handler called when out of range.")
  })


module("Date") //////////////////////////////////////

  test("initialize", 1, function(){
    var date = cast("July 31 1981").date().value
    var correctDate = date.getMonth() == 6 && date.getDate() == 31 && date.getFullYear() == 1981

    ok(correctDate, "Parse date string." )
  })

  test("beginningOfDay", 1, function(){
    var timeZoneOffset = Date.parse(new Date('Jan 1, 2001'))
    var beginningOfDay = cast("Jan 1, 2001 14:25:36").date().beginningOfDay().value
    var offset = Date.parse(beginningOfDay)
    ok(offset == timeZoneOffset, "Date reset to beginning of day.")
  })

  test("endOfDay", 1, function(){
    var timeZoneOffset = Date.parse(new Date('Jan 1, 2001 23:59:59'))
    var endOfDay = cast("Jan 1, 2001 14:25:36").date().endOfDay().value
    var offset = Date.parse(endOfDay)
    ok(offset == timeZoneOffset, "Date reset to end of day.")
  })

  test("before", 2, function(){
    ok(cast("July 31 1981").date().before("Dec 1, 2012").valid, "July 31 1981 is before Dec 1, 2012")
    ok(cast("July 31 1981").date().before("Dec 1, 1980").invalid, "July 31 1981 is not before Dec 1, 1980")
  })

  test("after", 2, function(){
    ok(cast("July 31 1981").date().after("Dec 1, 1980").valid, "July 31 1981 is after Dec 1, 1980")
    ok(cast("July 31 1981").date().after("Dec 1, 2012").invalid, "July 31 1981 is not after Dec 1, 2012")
  })

  test("format", 23, function(){
    var date = "July 3 1981 09:08:04"
    function testFormat(format, expected) {
      var result = cast(date).date().format(format).value
      ok(result === expected, "Format date \""+format+"\" -> \""+result+"\"")
    }

    testFormat('day', 'Friday')
    testFormat('DAY', 'FRIDAY')
    testFormat('dy', 'Fri')
    testFormat('DY', 'FRI')
    testFormat('D', 'F')
    testFormat('month', 'July')
    testFormat('MONTH', 'JULY')
    testFormat('mon', 'Jul')
    testFormat('MON', 'JUL')
    testFormat('mm', '07')
    testFormat('m', '7')
    testFormat('yyyy', '1981')
    testFormat('yy', '81')
    testFormat('dd', '03')
    testFormat('d', '3')
    testFormat('HH', '09')
    testFormat('H', '9')
    testFormat('MM', '08')
    testFormat('M', '8')
    testFormat('SS', '04')
    testFormat('S', '4')

    testFormat('yyyy-mm-dd', '1981-07-03')
    testFormat('DY MON d @ H:MM:SS', 'FRI JUL 3 @ 9:08:04')

  })


module('Text') /////////////////////////////

  test('initialize', 4, function(){
    var multilineText = "  First line.  \n  Second line.  "
    ok(cast("This").text().value === 'This', "Initialize simple string." )
    ok(cast("  This  ").text().value === 'This', "Trim Whitespace from string." )
    ok(cast(multilineText).text().value === multilineText, "Do not trim whitespace from multiline text." )
    ok(cast(6).text().value === '6', "Convert Number to Text." )
  })

  // test('matches', 1, function(){
  // })

  // test('doesNotmatch', 1, function(){
  // })

  // test('min', 1, function(){
  // })

  // test('max', 1, function(){
  // })


module('Email') /////////////////////////////

  test('initialize', 3, function(){
    ok(cast("foo@bar.com").email().value === 'foo@bar.com', "Initialize simple email.")
    ok(cast("  foo@bar.com  ").email().value === 'foo@bar.com', "Trim Whitespace from email.")
    ok(cast("not valid").email().invalid, "Fail when not a valid format.")
  })


module('Number') /////////////////////////////

  test('initialize', 3, function(){
    ok(cast("4.78").number().value === 4.78, "Initialize float from string.")
    ok(cast(1.27).number(1).value === 1.3, "Limit decimal places.")
    ok(cast("not valid").number().invalid, "Fail when not a valid number.")
  })


module('Integer') /////////////////////////////

  test('initialize', 3, function(){
    ok(cast("4.28").integer().value === 4, "Initialize integer from string.")
    ok(cast(1.76).integer().value === 2, "Limit decimal places.")
    ok(cast("not valid").number().invalid, "Fail when not a valid number.")
  })


