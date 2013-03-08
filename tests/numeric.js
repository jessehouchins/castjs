QUnit.module('Numeric') /////////////////////////////

  test('initialize', 3, function(){
    ok(cast("4.78").number().value === 4.78, "Initialize float from string.")
    ok(cast(1.27).number(1).value === 1.3, "Limit decimal places.")
    ok(cast("not valid").number().invalid, "Fail when not a valid number.")
  })

  test('integer', 3, function(){
    ok(cast("4.28").integer().value === 4, "Initialize integer from string.")
    ok(cast(1.76).integer().value === 2, "Limit decimal places.")
    ok(cast("not valid").number().invalid, "Fail when not a valid number.")
  })

  test('lessThan', 4, function(){
    ok(!cast("4.25").number().lessThan(4.4).outOfRange, "Less than another float.")
    ok(cast(1.7).number().lessThan(1.7).outOfRange, "Less than same float.")
    ok(!cast(1.7).number().lessThan(2).outOfRange, "Less than an integer.")
    ok(!cast(1.7).number().lessThan("2").outOfRange, "Less than a numeric string.")
  })

  test('greaterThan', 4, function(){
    ok(!cast("4.25").number().greaterThan(4.1).outOfRange, "Greater than another float.")
    ok(cast(1.7).number().greaterThan(1.7).outOfRange, "Greater than same float.")
    ok(!cast(1.7).number().greaterThan(1).outOfRange, "Greater than an integer.")
    ok(!cast(1.7).number().greaterThan("1").outOfRange, "Greater than a numeric string.")
  })


