function generateDataset(chart_contents, data, items_count) {

    let result = chart_contents.map(row => {
        let path = row.path;
        let len = data.length;
        let step = Math.floor(len / items_count);
        let generatedData = [];
        for (let i = 0; i < items_count; i++) {
            let index = i * step;
            let row = data[index];
            let value = row;
            for (let element of path) {
                value = value[element];
            }
            generatedData.push(value);
        }
        return {
            label: row.label,
            data: generatedData,
            hidden: !row.enabled
        }
    });

    return result;
}

function formateDate(date, include_date, include_time) {
    let date_part = date.split(' ')[0];
    let time_part = date.split(' ')[1];

    let formatedDate = date_part.split('-').reverse().slice(0, 2).join('.');
    let formatedTime = time_part.slice(0, -3);
    let result = `${include_time ? formatedTime : ''}${include_date ? ' - ' + formatedDate : ''}`;
    return result;
}

function generateLabels(data, labels_count, include_date, include_time) {
    let result = [];
    let len = data.length;
    let step = Math.floor(len / labels_count);
    for (let i = 0; i < labels_count; i++) {
        let index = i * step;
        let row = data[index];
        result.push(formateDate(row.obsTimeLocal, include_date, include_time));
    }
    return result;
}


(async function () {
    let response = await fetch('/data');
    let data = await response.json();
    let chart_contents = data.chart_contents;
    // console.log(data)

    let chart = new Chart(
        document.getElementById('chart'),
        {
            type: 'line',
            data: {
                labels: generateLabels(data.day, 48, false, true),
                datasets: generateDataset(chart_contents, data.day, 48)
            }
        }
    );

    let period_selector = document.querySelector('.period_selector');
    period_selector.addEventListener('click', (event) => {

        if (event.target.classList.contains('period_selector')) return;

        // console.log(period_selector.children)
        for (let child of period_selector.children) {
            child.removeAttribute('selected')
        }

        let button = event.target;
        button.setAttribute('selected', '');
        let period = button.dataset.period;
        let neededPart, include_date, include_time, labels_count;


        switch (period) {
            case '12h':
                labels_count = 24;
                include_date = false;
                include_time = true;
                neededPart = data.day.slice(Math.floor((data.day.length - 1) / 2), data.day.length - 1);
                break;
            case '1day':
                labels_count = 48;
                include_date = false;
                include_time = true;
                neededPart = data.day;
                break;
            case '3days':
                labels_count = 48;
                include_date = true;
                include_time = true;
                neededPart = data.week.slice(Math.floor((data.week.length - 1) / 2), data.week.length - 1);
                break;
            case '1week':
                labels_count = 70;
                include_date = true;
                include_time = true;
                neededPart = data.week
                break;
        }

        for (let i = 0; i < chart_contents.length; i++) {
            // console.log(chart.isDatasetVisible(i))
            chart_contents[i].enabled = chart.isDatasetVisible(i);
        }



        chart.data = {
            labels: generateLabels(neededPart, labels_count, include_date, include_time),
            datasets: generateDataset(chart_contents, neededPart, labels_count)
        }
        chart.update();
    })

    let statistics_element = document.querySelector('.statistics');
    let popup = document.querySelector('.popup');

    statistics_element.addEventListener('mouseover', (event) => {

        let target = event.target;
        // console.log(target)
        if (!target.classList.contains('value_part') | !target.dataset.time) {
            // popup.style.visibility = 'hidden';
            popup.style.opacity = 0;
            return;
        };
        // popup.style.visibility = 'visible';
        popup.style.opacity = 1;


        popup.innerText = formateDate(target.dataset.time, true, true);
        let bounding = target.getBoundingClientRect();
        popup.style.top = `${bounding.y - 37}px`;
        popup.style.left = `${bounding.x + bounding.width / 2 - 57}px`;


    })


    //checkboxes

    // document.querySelector('.chart_contents_selector').addEventListener('click', function (event) {
    //     console.log(event.target.type)
    //     if (event.target.type == 'checkbox') {
    //         // console.log(chart)

    //         let params = event.target.parentElement.dataset.path.split(',');
    //         let label = event.target.parentElement.innerContent;
    //         // console.log(params);
    //         let dataset = chart.data.datasets.filter((set) => set.label == label)[0];

    //         dataset.hidden = !event.target.checked;


    //         chart.update();
    //     }
    // })
})()
