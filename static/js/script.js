const endPoints = ['films', 'people', 'planets', 'starships', 'species', 'vehicles'];

const apiURL = 'https://swapi.co/api/';

let allData = [];
let dataCounts = {};

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
                data.results[i].category = endpoint;
                allData.push(data.results[i]);
            }
            
            checkData();
            
            if (data.next) {
                getData(data.next, endpoint, true);
            }
        })
    } else {
        $.getJSON(`${url}${endpoint}`, function(data) {
            dataCounts[endpoint] = data.count;

            for (let i = 0; i < data.results.length; i++){
                data.results[i].category = endpoint;
                allData.push(data.results[i]);
            }
            
            if (data.next) {
                getData(data.next, endpoint, true);
            } else {
                checkData();
            }
        });
    }
}

function checkData() {
    let totalCount = 0;
    
    for (let i = 0; i < endPoints.length; i++) {
        totalCount += dataCounts[endPoints[i]];    
    }
    
    console.log('data checked!'); // for testing
    
    if (allData.length === totalCount) {
        makeGraphs();        
    }
}

function makeGraphs() {
    console.log('All data has been retrieved!');
    console.log('All Data:') // for testing
    console.log(allData); // for testing
    console.log('Data Counts:') // for testing
    console.log(dataCounts); // for testing
    makeMeters();
    
    
    
}

function makeMeters() {
    for (let i = 0; i < endPoints.length; i++) {
        let number = new CountUp(`${endPoints[i]}-meter`, 0, dataCounts[endPoints[i]]);
        if (!number.error) {
            number.start();
        } else {
            console.error(number.error);
        }
    }
}
