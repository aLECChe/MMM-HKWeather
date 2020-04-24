/* Magic Mirror
 * Module: MMM-HKWeather
 * By aLEC 2020
 */

var NodeHelper = require("node_helper");
var request = require("request");

module.exports = NodeHelper.create({

    start: function() {

    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'CONFIG') {
            this.config = payload;
            this.getAQHI();
        }
    },

    getAQHI: function() {

        var url = "https://www.aqhi.gov.hk/epd/ddata/html/out/aqhirss_ChT.xml";
        if (this.config.lang == "en") {
            url = "https://www.aqhi.gov.hk/epd/ddata/html/out/aqhirss_Eng.xml";
        } else if (this.config.lang == "sc") {
            url = "https://www.aqhi.gov.hk/epd/ddata/html/out/aqhirss_ChS.xml";
        }
        var self = this;

        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {

			var aqhi = body;
            self.sendSocketNotification('UPDATE_AQHI', aqhi);

        });

    },


});