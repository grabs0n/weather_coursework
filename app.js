const express = require('express')
const app = express();
const port = 3000;


app.use(express.static('public'))

app.set('view engine', 'ejs')

const apiKey = ' ';

const weekLink = 'https://api.weather.com/v2/pws/observations/hourly/7day?stationId=IDOB36&format=json&units=m&numericPrecision=decimal&apiKey=' + apiKey;
const dayLink = 'https://api.weather.com/v2/pws/observations/all/1day?stationId=IDOB36&format=json&units=m&numericPrecision=decimal&apiKey=' + apiKey;
const currentLink = 'https://api.weather.com/v2/pws/observations/current?stationId=IDOB36&format=json&units=m&numericPrecision=decimal&apiKey=' + apiKey;

let last_observation, day_observations, week_observations;

async function updateData() {
    if (!last_observation || new Date() - new Date(last_observation.obsTimeUtc) >= 300) {
        let response = await fetch(currentLink);
        let json = await response.json();
        last_observation = json.observations[0];

        response = await fetch(dayLink);
        json = await response.json();
        day_observations = json.observations;

        response = await fetch(weekLink);
        json = await response.json();
        week_observations = json.observations;
    }

}

function windDirection(degrees) {
    const directions = [
        'S', 'S/V', 'V', 'J/V',
        'J', 'J/Z', 'Z', 'S/Z'
    ];

    let index = Math.round(degrees / 45);
    if (index === 8) index = 0;

    return directions[index];
}

function getMin(data, properties) {
    let result;
    let minValue;

    for (let element of data) {
        let value = element;
        // Iterate over each property in properties
        for (let property of properties) {
            // Get the value of the current property of the element
            value = value[property];
        }

        // If result is not defined yet or the value is less than result, update result
        if (!result || value < minValue) {
            minValue = value;
            result = element;
        }
    }

    return result;
}

function getMax(data, properties) {
    let result;
    let maxValue;

    for (let element of data) {
        let value = element;
        for (let property of properties) {
            value = value[property];
        }

        if (!result || value > maxValue) {
            maxValue = value;
            result = element;
        }
    }

    return result;
}

app.get('/', async (req, res) => {
    await updateData();
    let date = last_observation.obsTimeLocal.split(' ')[0].split('-');
    let time = last_observation.obsTimeLocal.split(' ')[1].split(':');

    // console.log(getMin(day_observations, ['metric', 'tempLow']))
    // console.log(getMax(day_observations, ['metric', 'tempHigh']))
    let data = {
        time: {
            hours: time[0],
            minutes: time[1],
            day: date[2],
            month: date[1]
        },
        last_observation:
        {
            temp: `${last_observation.metric.temp} °C`,
            condition: '',
            windSpeed: `${last_observation.metric.windSpeed} m/s`,
            winddir: windDirection(last_observation.winddir),
        },
        statistics: [{
            label: 'Dnešní data',
            items: [{
                name: 'Teplota',
                value: {
                    min: {
                        value: getMin(day_observations, ['metric', 'tempLow']).metric.tempLow,
                        time: getMin(day_observations, ['metric', 'tempLow']).obsTimeLocal
                    },
                    max: {
                        value: getMax(day_observations, ['metric', 'tempHigh']).metric.tempHigh,
                        date: getMax(day_observations, ['metric', 'tempHigh']).obsTimeLocal
                    },
                    unit: '°C'
                }
            },
            {
                name: 'Pocitově',
                value: `${last_observation.metric.heatIndex} °C`
            },
            {
                name: 'Nárazy',
                value: `${last_observation.metric.windGust} m/s`
            },
            {
                name: 'Srážky',
                value: `${last_observation.metric.precipRate} mm`
            },
            {
                name: 'Vlhkost',
                value: `${last_observation.humidity}%`
            },
            {
                name: 'Rosný bod',
                value: `${last_observation.metric.dewpt} °C`
            },
            {
                name: 'Tlak',
                value: `${last_observation.metric.pressure} mBar`
            },]
        },
        {
            label: 'Týdenní záznamy',
            items: [
                {
                    name: 'Teplota',
                    value: {
                        min: {
                            value: getMin(week_observations, ['metric', 'tempLow']).metric.tempLow,
                            time: getMin(week_observations, ['metric', 'tempLow']).obsTimeLocal
                        },
                        max: {
                            value: getMax(week_observations, ['metric', 'tempHigh']).metric.tempHigh,
                            time: getMax(week_observations, ['metric', 'tempHigh']).obsTimeLocal
                        },
                        unit: '°C'
                    }
                },
                {
                    name: 'Pocitově',
                    value: {
                        min: {
                            value: getMin(week_observations, ['metric', 'heatindexLow']).metric.heatindexLow,
                            time: getMin(week_observations, ['metric', 'heatindexLow']).obsTimeLocal
                        },
                        max: {
                            value: getMax(week_observations, ['metric', 'heatindexHigh']).metric.heatindexHigh,
                            time: getMax(week_observations, ['metric', 'heatindexHigh']).obsTimeLocal
                        },
                        unit: '°C'
                    }
                },
                {
                    name: 'Rychlost',
                    value: {
                        min: {
                            value: getMin(week_observations, ['metric', 'windspeedLow']).metric.windspeedLow,
                            time: getMin(week_observations, ['metric', 'windspeedLow']).obsTimeLocal
                        },
                        max: {
                            value: getMax(week_observations, ['metric', 'windspeedHigh']).metric.windspeedHigh,
                            time: getMax(week_observations, ['metric', 'windspeedHigh']).obsTimeLocal
                        },
                        unit: 'm/s'
                    }
                },
                {
                    name: 'Srážky',
                    value: {
                        min: {
                            value: getMin(week_observations, ['metric', 'precipRate']).metric.precipRate,
                            time: getMin(week_observations, ['metric', 'precipRate']).obsTimeLocal
                        },
                        max: {
                            value: getMax(week_observations, ['metric', 'precipRate']).metric.precipRate,
                            time: getMax(week_observations, ['metric', 'precipRate']).obsTimeLocal
                        },
                        unit: 'mm'
                    }
                },
                {
                    name: 'Vlhkost',
                    value: {
                        min: {
                            value: getMin(week_observations, ['humidityLow']).humidityLow,
                            time: getMin(week_observations, ['humidityLow']).obsTimeLocal
                        },
                        max: {
                            value: getMax(week_observations, ['humidityHigh']).humidityHigh,
                            time: getMax(week_observations, ['humidityHigh']).obsTimeLocal
                        },
                        unit: '%'
                    }
                },
                {
                    name: 'Rosný bod',
                    value: {
                        min: {
                            value: getMin(week_observations, ['metric', 'dewptLow']).metric.dewptLow,
                            time: getMin(week_observations, ['metric', 'dewptLow']).obsTimeLocal
                        },
                        max: {
                            value: getMax(week_observations, ['metric', 'dewptHigh']).metric.dewptHigh,
                            time: getMax(week_observations, ['metric', 'dewptHigh']).obsTimeLocal
                        },
                        unit: '°C'
                    }
                },
                {
                    name: 'Tlak',
                    value: {
                        min: {
                            value: getMin(week_observations, ['metric', 'pressureLow']).metric.pressureLow,
                            time: getMin(week_observations, ['metric', 'pressureLow']).obsTimeLocal
                        },
                        max: {
                            value: getMax(week_observations, ['metric', 'pressureHigh']).metric.pressureHigh,
                            time: getMax(week_observations, ['metric', 'pressureHigh']).obsTimeLocal
                        },
                        unit: 'mBar'
                    }
                },
            ]
        },],

    };
    res.render('pages/index', { data: data });
})

app.get('/data/:period', async (req, res) => {
    await updateData();
    let period = req.params.period;
    let response;
    if (period == "day") response = day_observations;
    if (period == "week") response = week_observations;
    res.send(response);
})

app.listen(port, () => {
    console.log("application is running on http://localhost:" + port);
});