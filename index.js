var Service, Characteristic;
var request = require('sync-request');

var humidityService;
var url 

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-httptemperaturehumidity", "HTTPMoisture", HTTPMoisture);
}


function HTTPMoisture(log, config) {
    this.log = log;

    // url info
    this.url = config["url"];
    this.http_method = config["http_method"] || "GET";
    this.sendimmediately = config["sendimmediately"] || "";
    this.name = config["name"];
    this.manufacturer = config["manufacturer"] || "SparkFun";
    this.model = config["model"] || "Soil Moisture Sensor";
    this.serial = config["serial"] || "NA";
    this.humidity = true;
}

HTTPMoisture.prototype = {

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

    getStateHumidity: function (callback) {
        var body;

	var res = request(this.http_method, this.url, {});
	if(res.statusCode > 400){
	  this.log('HTTP power function failed');
	  callback(error);
	} else {
	  this.log('HTTP power function succeeded!');
          var info = JSON.parse(res.body);

         humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, info.humidity);

         this.log(res.body);
         this.log(info);

         this.humidity = info.humidity;

         accessory.log("Current moisture level is: " + this.humidity)

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
