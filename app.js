const express = require('express')
const app = express();
const port = 3000;

app.use(express.static('public'))

app.set('view engine', 'ejs')

app.get('/', async (req, res) => {
    // var response = await fetch('https://api.weather.com/v2/pws/observations/current?stationId=IDOB36&format=json&units=m&numericPrecision=decimal&apiKey= ');
    // var data = await response.json();
    // var observation = data.observations[0];
    res.render('pages/index');
    // res.render('pages/index', { observation: observation });
})

app.listen(port, () => {
    console.log("application is running on http://localhost:" + port);
});