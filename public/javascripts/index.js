(async function () {
    let response = await fetch('/data/day');
    let data = await response.json();
    console.log(data)

    new Chart(
        document.getElementById('chart'),
        {
            type: 'line',
            data: {
                labels: data.map(row => row.obsTimeLocal),
                datasets: [
                    {
                        label: 'Teplota',
                        data: data.map(row => row.metric.tempAvg)
                    }
                ]
            }
        }
    );
})();