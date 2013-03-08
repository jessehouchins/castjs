QUnit.module("Core")

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
