var html = document.querySelector("template").firstChild.data;
console.log(html);

var response = await fetch('https://api.weather.com/v2/pws/observations/current?stationId=IDOB36&format=json&units=m&numericPrecision=decimal&apiKey= ');
var data = await response.json();
var observation = data.observations[0];
var outputHTML = ejs.render(html, { observation: observation });
document.querySelector(".output").innerHTML = outputHTML;
console.log(observation);