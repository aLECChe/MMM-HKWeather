
# MMM-HKWeather

**Weather from Hong Kong Observatory**

- Hong Kong Observatory Open Data API, no API Key is needed.
- Air Quality Health Index ( AQHI ) data is from Environmental Protection Department.
- [VClouds Weather Icons by VClouds](https://www.deviantart.com/vclouds/art/VClouds-Weather-Icons-179152045).
- Appearance heavily inspired by [MMM-NOAA3 by cowboysdude](https://github.com/cowboysdude/MMM-NOAA3).
- more information can be found at [DATA.GOV.HK](https://data.gov.hk/tc/).

## Screenshots

![Screenshot](examples/MMM-HKWeather-chi.jpg) 
![Screenshot](examples/MMM-HKWeather-eng.jpg) 

## Installation
```javascript
cd ~/MagicMirror/modules/
git clone https://github.com/aLECChe/MMM-HKWeather
```

## Config.js entry and options
- The lang option here is only used by the HKO Open Data API. 
- To change the language of the module, please change the system language.

 ```	 {
			module: "MMM-HKWeather",
			position: "top_left",
			config: {
				lang: "tc",  // en: english, tc: traditional chinese,  sc: simplified chinese
				updateInterval: 1000 * 60 * 60, // 60 minitues
			}
		},
```

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Enjoy!

