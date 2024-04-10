(async function () {
    let response = await fetch('/data/day');
    var data = await response.json();
    // console.log(data)

    let chart = new Chart(
        document.getElementById('chart'),
        {
            type: 'line',
            data: {
                labels: data.map(row => row.obsTimeLocal),
                
                datasets: data.map(row => {
                    let value = row;
                    for (let param of params) {
                        value = value[param];
                    }
                    return value;
                })
            }
        }
    );


    document.querySelector('.chart_data_selector').addEventListener('click', function (event) {
        console.log(event.target.type)
        if (event.target.type == 'checkbox') {

            let params = event.target.parentElement.dataset.path.split(',');
            let label = event.target.parentElement.dataset.label;
            // console.log(params);

            if (!event.target.checked) {
                chart.data.datasets[0].hidden = true;
            }

            chart.data.labels.push(label);
            chart.data.datasets.push({
                label: "line",
                data: data.map(row => {
                    let value = row;
                    for (let param of params) {
                        value = value[param];
                    }
                    return value;
                })
            });
            chart.update();
        }
    })


})()