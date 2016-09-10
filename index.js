var Service, Characteristic;
var request = require('sync-request');

var humidityService;
var url 
var humidity = 0;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-httptemperaturehumidity", "HttpTemphum", HttpTemphum);
}


function HttpTemphum(log, config) {
    this.log = log;

    // url info
    this.url = config["url"];
    this.http_method = config["http_method"] || "GET";
    this.sendimmediately = config["sendimmediately"] || "";
    this.name = config["name"];
    this.manufacturer = config["manufacturer"] || "Luca Manufacturer";
    this.model = config["model"] || "Luca Model";
    this.serial = config["serial"] || "Luca Serial";
    this.humidity = true;
}

HttpTemphum.prototype = {

    httpRequest: function (url, body, method, username, password, sendimmediately, callback) {
        request({
                    url: url,
                    body: body,
                    method: method,
                    rejectUnauthorized: false
                },
                function (error, response, body) {
                    callback(error, response, body)
                })
    },

    getStateHumidity: function(callback){    
	callback(null, this.humidity);
    },

    getState: function (callback) {
        var body;

	var res = request(this.http_method, this.url, {});
	if(res.statusCode > 400){
	  this.log('HTTP power function failed');
	  callback(error);
	} else {
	  this.log('HTTP power function succeeded!');
          var info = JSON.parse(res.body);

          if(this.humidity !== false)
            humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, info.humidity);

          this.log(res.body);
          this.log(info);

          if(this.humidity !== false)
            this.humidity = info.humidity;

	  callback(null, this.humidity);
	}
    },

    identify: function (callback) {
        this.log("Identify requested!");
        callback(); // success
    },

    getServices: function () {
        var services = [],
            informationService = new Service.AccessoryInformation();
            
        informationService
                .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
                .setCharacteristic(Characteristic.Model, this.model)
                .setCharacteristic(Characteristic.SerialNumber, this.serial);
        services.push(informationService);
        
        if(this.humidity !== false){
          humidityService = new Service.HumiditySensor(this.name);
          humidityService
                  .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                  .on('get', this.getStateHumidity.bind(this));
          services.push(humidityService);
        }

        return services;
    }
};
