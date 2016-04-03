# twilio-price-calculator
*Calculate the price of a phone number, or a voice minute or SMS message between any two numbers..*

All prices are in USD ($).

## Quick start

```
npm install twilio-price-calculator --save
```

This module provides a promise-based API. You'll first need to initialise the price calculator client by passing in your Twilio API credentials.

```javascript
var PriceCalculator = require('twilio-price-calculator');
var priceCalculator = new PriceCalculator(YOUR_ACCOUNT_SID, YOUR_AUTH_TOKEN);

priceCalculator.calculateVoicePrice(FROM_PHONE_NUMBER, TO_PHONE_NUMBER)
  .then(function(price) {
    console.log(price);
  })
  .catch(function(error) {
    console.error(error);
  });

```

## API

### calculateVoicePrice(fromPhoneNumber, toPhoneNumber)

### calculateSMSPrice(fromPhoneNumber, toPhoneNumber)

### calculatePhoneNumberPrice(desiredPhoneNumber)
