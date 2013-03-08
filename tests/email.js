QUnit.module('Email') /////////////////////////////

  test('initialize', 3, function(){
    ok(cast("foo@bar.com").email().value === 'foo@bar.com', "Initialize simple email.")
    ok(cast("  foo@bar.com  ").email().value === 'foo@bar.com', "Trim Whitespace from email.")
    ok(cast("not valid").email().invalid, "Fail when not a valid format.")
  })
