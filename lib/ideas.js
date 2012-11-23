/*

// view.saveChanges()

var attrs = {
  startDate: this.valueOf('start_date')
}

castInstance = {
  value: "converted value",
  original: "original value"
}
Cast.prototype = {
  as: {} // hash of converter functions
}

// .invalid - called when value is entered, but is not valid
// .required - called when value is not entered
// .valid - called when input is valid

cast(attrs,'start_date').as.date('yyyy-mm-dd').between(date1, date2)
  .invalid(function(x, date1, date2){ self.errors['start_date'] = "Start date must be between " + date1 + " and " + date2 + "." })

cast(attrs,'email').as.email()
  .required(function(x){ console.log('An email address is required.') })
  .invalid(function(x){ console.log(x + 'is not a valid email address.') })
  .valid(function(x){ console.log('Email is valid.') })


*/