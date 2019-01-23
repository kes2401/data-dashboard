const endPoints = ['films', 'people', 'planets', 'starships', 'species', 'vehicles'];

const apiURL = 'https://swapi.co/api/';

let allData = {};
allData.counts = {};

for (let i = 0; i < endPoints.length; i++) {
    getData(apiURL, endPoints[i]);
    $(`#${endPoints[i]}-meter`).html(
        `<div class="loader">
            <img src="assets/loader/loader.gif" alt="loading..."/>
        </div>`
    );
}

function getData(url, endpoint, linked = false) {
    if (linked) {
        $.getJSON(url, function(data) {
            for (let i = 0; i < data.results.length; i++){
                allData[endpoint].push(data.results[i]);
            }
            checkData();
            if (data.next) {
                getData(data.next, endpoint, true);
            }
        })
    } else {
        $.getJSON(`${url}${endpoint}`, function(data) {
            allData.counts[endpoint] = data.count;
            
            if (allData[endpoint]) {
                for (let i = 0; i < data.results.length; i++){
                    allData[endpoint].push(data.results[i]);
                }
                checkData();
            } else {
                allData[endpoint] = data.results;
                checkData();
            }
            
            if (data.next) {
                getData(data.next, endpoint, true);
            }
        });
    }
}

function checkData() {
    for (let i = 0; i < endPoints.length; i++) {
        if (allData[endPoints[i]] && allData[endPoints[i]].length !== allData.counts[endPoints[i]]) {
            return;
        };
    }
    makeGraphs();
}

function makeGraphs() {
    console.log('All data has been retrieved!');
    console.log(allData); // for testing
    
    makeMeters();
    
    
    
}

function makeMeters() {
    for (let i = 0; i < endPoints.length; i++) {
        let number = new CountUp(`${endPoints[i]}-meter`, 0, allData.counts[endPoints[i]]);
        if (!number.error) {
            number.start();
        } else {
            console.error(number.error);
        }
    }

    // var numAnim = new CountUp('films-meter', 0, allData.counts.films);
    // if (!numAnim.error) {
    //     numAnim.start();
    // } else {
    //     console.error(numAnim.error);
    // }
}
