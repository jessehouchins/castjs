QUnit.module("Date")

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
