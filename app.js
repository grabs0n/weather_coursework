const express = require('express')
const app = express();
const port = 3000;

const apiKey = ' ';

const weekLink = 'https://api.weather.com/v2/pws/observations/hourly/7day?stationId=IDOB36&format=json&units=m&numericPrecision=decimal&apiKey=' + apiKey;
const dayLink = 'https://api.weather.com/v2/pws/observations/all/1day?stationId=IDOB36&format=json&units=m&numericPrecision=decimal&apiKey=' + apiKey;
const currentLink = 'https://api.weather.com/v2/pws/observations/current?stationId=IDOB36&format=json&units=m&numericPrecision=decimal&apiKey=' + apiKey;

app.use(express.static('public'))

app.set('view engine', 'ejs')

app.get('/', async (req, res) => {
    let response = await fetch(currentLink);
    let json = await response.json();
    let last_observation = json.observations[0];

    let date = last_observation.obsTimeLocal.split(' ')[0].split('-');
    let time = last_observation.obsTimeLocal.split(' ')[1].split(':');

    let data = {
        time: {
            hours: time[0],
            minutes: time[1],
            day: date[2],
            month: date[1]
        },
        last_observation:
        {
            temp: last_observation.metric.temp,
            condition: '',
            windSpeed: `$last_observation.metric.windSpeed m/s`,
            winddir: ''
        }

    };

    res.render('pages/index', { data: data });
})

app.listen(port, () => {
    console.log("application is running on http://localhost:" + port);
});