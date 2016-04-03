var Q = require('q');
var twilio = require('twilio');
var PricingClient = require('twilio').PricingClient;
var LookupsClient = require('twilio').LookupsClient;

function PriceCalculator(accountSid, accountToken) {
  this.pricingClient = new PricingClient(accountSid, accountToken);
  this.lookupsClient = new LookupsClient(accountSid, accountToken);
}

PriceCalculator.prototype.calculateSmsPrice = function(fromPhoneNumber, toPhoneNumber) {
  var deferred = Q.defer();

  var fromMcc, fromMnc;
  var fromCountryCode;
  var toType;

  this.lookupsClient.phoneNumbers(fromPhoneNumber).get({
    type: 'carrier'
  }, function(error, number) {
    if (error) {
      return deferred.reject(error);
    }
    fromMcc = number.carrier.mobile_country_code;
    fromMnc = number.carrier.mobile_network_code;
    fromCountryCode = number.countryCode;
    this.lookupsClient.phoneNumbers(toPhoneNumber).get({
        type: 'carrier'
      }, function(error, number) {
        if (error) {
          return deferred.reject(error);
        }
        toType = number.carrier.type;
        this.pricingClient.messaging.countries(fromCountryCode).get(function(error, country) {
          if (error) {
            return deferred.reject(error);
          }
          var matchingTariffs = country.outboundSmsPrices.filter(function(tariff) {
            return tariff.mcc === fromMcc && tariff.mnc === fromMnc;
          });
          var matchingTariff = matchingTariffs[0].prices.filter(function(tariff) {
            return tariff.number_type = toType;
          });
          deferred.resolve(matchingTariff[0].currentPrice);
        });
    }.bind(this));
  }.bind(this));

  return deferred.promise;
}

PriceCalculator.prototype.calculateVoicePrice = function(fromPhoneNumber, toPhoneNumber) {
  var deferred = Q.defer();

  var fromCountryCode;
  var toCountryCode;

  this.lookupsClient.phoneNumbers(fromPhoneNumber).get({
    type: 'carrier'
  }, function(error, number) {
    if (error) {
      return deferred.reject(error);
    }
    fromCountryCode = number.countryCode;
    this.lookupsClient.phoneNumbers(toPhoneNumber).get({
        type: 'carrier'
      }, function(error, number) {
        if (error) {
          return deferred.reject(error);
        }
        toCountryCode = number.countryCode;

        this.pricingClient.voice.countries(fromCountryCode).get(function(error, country) {
          if (error) {
            return deferred.reject(error);
          }
          var matchingTariff = country.outboundPrefixPrices.filter(function(tariff) {
            return tariff.prefixes.filter(function(prefix) {
              return toPhoneNumber.startsWith(prefix);
            });
          });
          if (!matchingTariff[0]) {
            return deferred.reject('No matching tariff found');
          }
          return deferred.resolve(matchingTariff[0].currentPrice);
        });
    }.bind(this));
  }.bind(this));

  return deferred.promise;
}

PriceCalculator.prototype.calculatePhoneNumberPrice = function(desiredPhoneNumber, callback) {
  var deferred = Q.defer();

  this.lookupsClient.phoneNumbers(desiredPhoneNumber).get({
    type: 'carrier'
  }, function(error, number) {
    if (error) {
      return deferred.reject(error);
    }
    this.pricingClient.phoneNumbers.countries(number.country_code).get(function(error, country) {
        if (error) {
          return deferred.reject(error);
        }
        var numberType = country.phoneNumberPrices.filter(function(p) {
          return p.numberType === number.carrier.type;
        });
        if (!numberType[0]) {
          return deferred.reject('Number type not found');
        }
        return deferred.resolve(numberType[0].currentPrice);
    });
  }.bind(this));

  return deferred.promise;
}

module.exports = PriceCalculator;
