/* Magic Mirror
 * Module: MMM-HKWeather
 * By aLEC 2020
 */

Module.register("MMM-HKWeather", {
	// Default module config.
	defaults: {
		
		updateInterval: 1000 * 60 * 60, // 60 minitues
		lang: "tc", // en, sc
	
		imageArray: {
			"50": "sunny",
			"51": "mostlysunny",
			"52": "mostlyclear",
			"53": "drizzle",
			"54": "drizzle",
			"60": "mostlycloudy",
			"61": "cloudy",
			"62": "chancerain",
			"63": "rain",
			"64": "chancetstorms",
			"65": "tstorms",
			"70": "clear",
			"71": "clear",
			"72": "clear",
			"73": "clear",
			"74": "clear",
			"75": "clear",
			"76": "cloudy",
			"77": "mostlysunny",
			"80": "wind",
			"81": "clear",
			"82": "fog",
			"83": "fog",
			"84": "hazy",
			"85": "hazy",
			"90": "undefined",
			"91": "undefined",
			"92": "undefined",
			"93": "undefined",
		},

	},
	
	start: function() {
		
		this.temperature = null;
		this.humidity = null;
		this.uv = null;
		this.icon = "undefined";
		this.forecastDesc = null;
		this.sunrise = null;
		this.sunset = null;
		this.tran = null; // 日中天
		this.ltmv = null;
		this.forecast = [];
		this.aqhi = null;
		
		this.updateWeather();

	},
	
	updateWeather: function() {
		
        var d = new Date();
		var y = d.getFullYear();
		var m = d.getMonth() + 1;
        var n = d.getDate();

		// 本港地區天氣報告 rhrread
		var url1 = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=" + this.config.lang;

		// 本港地區天氣預報 flw
		var url2 = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=flw&lang=" + this.config.lang;

		// 九天天氣預報 fnd
		var url3 = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=" + this.config.lang;

		// 日出、日中天、日落時間 SRS
		var url4 = "http://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=SRS&rformat=json&year=" + y + "&month=" + m + "&day=" + n + "&lang=" + this.config.lang;

		// 最新十分鐘平均能見度 LTMV
		var url5 = "http://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=LTMV&rformat=json&lang=" + this.config.lang;
		
		// 詳細天氣警告資訊 ( 未有資料，後補 )
		var url6 = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warningInfo&lang="  + this.config.lang;
		
		// 天氣警告一覽
		// https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=tc
		
		var nextLoad = this.config.updateInterval;
		var self = this;
		
		fetch(url1)
			.then((resp) => resp.json()) 
			.then(function(data) {
				// Here you get the data to modify as you please
				
				self.temperature = data.temperature.data[0].value + "°C";
				self.humidity = data.humidity.data[0].value + "%";
				self.uv = data.uvindex.data[0].value + "(" + data.uvindex.data[0].desc + ")";
				self.icon = self.config.imageArray[data.icon[0]];
				// self.icon = "https://www.hko.gov.hk/images/wxicon/pic" + data.icon[0]; + ".png";
				
				self.updateDom();
			})
			.catch(function(error) {
				// If there is any error you will catch them here
			});
			
		fetch(url2)
			.then((resp) => resp.json()) 
			.then(function(data) {
				// Here you get the data to modify as you please
				
				self.forecastDesc = data.forecastDesc;
				
				self.updateDom();
			})
			.catch(function(error) {
				// If there is any error you will catch them here
			});
			
		fetch(url3)
			.then((resp) => resp.json()) 
			.then(function(data) {
				// Here you get the data to modify as you please
				
				self.forecast = data.weatherForecast;
				
				self.updateDom();
			})
			.catch(function(error) {
				// If there is any error you will catch them here
			});
			
		fetch(url4)
			.then((resp) => resp.json()) 
			.then(function(data) {
				// Here you get the data to modify as you please
				
				self.sunrise = data.data[0][1];
				self.tran = data.data[0][2]; // 日中天,暫無顯示
				self.sunset = data.data[0][3];
				
				self.updateDom();
			})
			.catch(function(error) {
				// If there is any error you will catch them here
			});
			
		fetch(url5)
			.then((resp) => resp.json()) 
			.then(function(data) {
				// Here you get the data to modify as you please
				
				self.ltmv = data.data[0][2];
				
				self.updateDom();
			})
			.catch(function(error) {
				// If there is any error you will catch them here
			});
		
		// ask node_helper to update AQHI
		this.sendSocketNotification('CONFIG', this.config);

		setTimeout(function() {
			self.updateWeather();
		}, nextLoad);

	},
	
    socketNotificationReceived: function(notification, payload) {
		
		if (notification === "UPDATE_AQHI") {
			
			var parser = new DOMParser();
			var xmlDoc = parser.parseFromString(payload,"text/xml");
			var aqhitext = xmlDoc.getElementsByTagName("description")[1].textContent;
			var aqhi = aqhitext.slice(aqhitext.indexOf(":") + 1,aqhitext.indexOf("("));
			
            this.aqhi = aqhi;

        }
        this.updateDom();
    },
	
	getStyles: function() {
		return [
			this.file('css/MMM-HKWeather.css')
		]
	},
	
	getTranslations: function() {
		return {
			en: "translations/en.json",
			zh: "translations/zh_hk.json",
			'zh-hk': "translations/zh_hk.json",
			'zh-cn': "translations/zh_cn.json"
		}
	},


	// Override dom generator.
	getDom: function() {
		
        var wrapper = document.createElement("div");
        var d = new Date();
        var n = d.getHours();

		// 即時天氣預測
        var cweat = document.createElement("div");
        cweat.classList.add("small", "bright", "floatl");
		cweat.innerHTML = this.forecastDesc;
        wrapper.appendChild(cweat);

		// 天氣圖示
        var curCon = document.createElement("div");
        curCon.classList.add("img");
        curCon.innerHTML = (n < 18 && n > 6) ? "<img src='modules/MMM-HKWeather/images/" + this.icon + ".png'>" : "<img src='modules/MMM-HKWeather/images/nt_" + this.icon + ".png'>";
        wrapper.appendChild(curCon);

		// 現時氣溫 ( 京士柏 )
        var cur = document.createElement("div");
        cur.classList.add("tempf", "tooltip");
		var temper = this.temperature;
        cur.innerHTML = `<div class="divTable">
          <div class="divTableBody">
        <div class="divTableRow">
            <div class="divTableHead"> </div> 
        </div>
		<div class="divTableRow"> 
                <div class="divTableCell2">${temper}</div>
            </div></div></div> `;
        wrapper.appendChild(cur);

		// 濕度 ( 香港天文台 ) + UV ( 京士柏 ) + 十分鐘平均能見度 ( 中環 )
        var top = document.createElement('div');
        top.classList.add('topshow');
		var humid = this.humidity;
        var Baro = this.uv;
        var Miles = this.ltmv;
        top.innerHTML =
            `<div class="divTable">
          <div class="divTableBody">
        <div class="divTableRow">
            <div class="divTableHead">${this.translate("Humidity")}</div>
            <div class="divTableHead">${this.translate("UV")}</div>
            <div class="divTableHead">${this.translate("Visibility")}</div>
        </div>
		
		<div class="divTableRow">
                <div class="divTableCell">${humid}</div>
                <div class="divTableCell">${Baro}</div>
                <div class="divTableCell">${Miles}</div>
            </div></div></div>`;
        wrapper.appendChild(top);

		// 日出 + 日落 + AQHI ( 環保署，當前空氣質素健康指數，一般監測站 )
        var sunrise = this.sunrise;
        var sunset = this.sunset;
		var air = this.aqhi;

        var nextDiv = document.createElement('div');
        nextDiv.innerHTML =
            `<div class="divTable">
   <div class="divTableBody">
   
      <div class="divTableRow">
         <div class="divTableHead">${this.translate("Rise")}</div>
         <div class="divTableHead">${this.translate("Set")}</div>
         <div class="divTableHead">${this.translate("AQHI")}</div>
      </div>
	 
      <div class="divTableRow">
         <div class="divTableCell">${sunrise}</div>
         <div class="divTableCell">${sunset}</div>
         <div class="divTableCell">${air}</div>
      </div>
   </div>
</div>`;
        wrapper.appendChild(nextDiv);

        // weather forecast below //////////////////////////////////////////////////

        var forecast = this.forecast;
		
        if (forecast != null && forecast.length > 0) {

            var ForecastTable = document.createElement("table");
            ForecastTable.classList.add("table")
            ForecastTable.setAttribute('style', 'line-height: 20%;');

			// 標題
            var FCRow = document.createElement("tr");
            var jumpy = document.createElement("th");
            jumpy.setAttribute("colspan", 4);
            jumpy.classList.add("rheading");
            jumpy.innerHTML = this.translate("HK Weather Forecast");
            FCRow.appendChild(jumpy);
            ForecastTable.appendChild(FCRow);

			// 頭四天，星期幾
            var nextRow = document.createElement("tr");
            for (i = 0; i < 4; i++) {
                var noaa = forecast[i];
                var wdshort = document.createElement("td");
				wdshort.classList.add("dates", "bright");
				wdshort.setAttribute("style", "padding:11px");
                wdshort.innerHTML = shortWeek(noaa.week);
                nextRow.appendChild(wdshort);
                ForecastTable.appendChild(nextRow);
            }
			
			// 縮短星期幾文字
			function shortWeek(week) {
				week = week.replace("星期","週");
				week = week.replace("Monday","Mon");
				week = week.replace("Tuesday","Tue");
				week = week.replace("Wednesday","Wed");
				week = week.replace("Thursday","Thu");
				week = week.replace("Friday","Fri");
				week = week.replace("Saturday","Sat");
				week = week.replace("Sunday","Sun");
				return week;
			}
			
			// 頭四天，天氣圖示
            var foreRow = document.createElement("tr");
            for (i = 0; i < 4; i++) {
                var noaa = forecast[i];
                var fore = document.createElement("td");
                fore.setAttribute("colspan", "1");
                //fore.setAttribute('style','float: center');
                fore.classList.add("CellWithComment");
				fore.innerHTML = "<img src='modules/MMM-HKWeather/images/" + this.config.imageArray[noaa.ForecastIcon] + ".png' height='22' width='28'>";
                foreRow.appendChild(fore);
                ForecastTable.appendChild(foreRow);
            }
			
			// 頭四天，最高 / 最低 溫度
            var tempRow = document.createElement("tr");
            for (i = 0; i < 4; i++) {
                var noaa = forecast[i];
                var temper = document.createElement("td");
                temper.setAttribute("colspan", "1");
                temper.classList.add("xsmall", "bright");
                temper.innerHTML = "<span class='red'>" + Math.round(noaa.forecastMaxtemp.value) + "</span>/<span class='blue'>" + Math.round(noaa.forecastMintemp.value) + "</span>";
                tempRow.appendChild(temper);
                ForecastTable.appendChild(tempRow);
            }

			// 後四天，星期幾
            var nextRow = document.createElement("tr");
            for (i = 4; i < 8; i++) {
                var noaa = forecast[i];
                var wdshort = document.createElement("td");
				wdshort.classList.add("dates", "bright");
				wdshort.setAttribute("style", "padding:11px");
                wdshort.innerHTML = shortWeek(noaa.week);
                nextRow.appendChild(wdshort);
                ForecastTable.appendChild(nextRow);
            }
			
			// 後四天，天氣圖示
            var foreRow = document.createElement("tr");
            for (i = 4; i < 8; i++) {
                var noaa = forecast[i];
                var fore = document.createElement("td");
                fore.setAttribute("colspan", "1");
                //fore.setAttribute('style','float: center');
                fore.classList.add("CellWithComment");
				fore.innerHTML = "<img src='modules/MMM-HKWeather/images/" + this.config.imageArray[noaa.ForecastIcon] + ".png' height='22' width='28'>";
                foreRow.appendChild(fore);
                ForecastTable.appendChild(foreRow);
            }
			
			// 後四天，最高 / 最低 溫度
            var tempRow = document.createElement("tr");
            for (i = 4; i < 8; i++) {
                var noaa = forecast[i];
                var temper = document.createElement("td");
                temper.setAttribute("colspan", "1");
                temper.classList.add("xsmall", "bright");
                temper.innerHTML = "<span class='red'>" + Math.round(noaa.forecastMaxtemp.value) + "</span>/<span class='blue'>" + Math.round(noaa.forecastMintemp.value) + "</span>";
                tempRow.appendChild(temper);
                ForecastTable.appendChild(tempRow);
            }

            wrapper.appendChild(ForecastTable);
        }

        return wrapper;

	}
	
});
