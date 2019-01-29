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
            
            if (data.next) {
                getData(data.next, endpoint, true);
            } else {
                checkData();
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
    
    const ndx = crossfilter(allData);
    console.log(ndx);
    
    makePieChart(ndx); // Test chart function
    makeBarChart(ndx); // Test chart function
    makeRowChart(ndx); // Test chart function
    
    
    humanNonHumanChart(ndx);
    wheeledNonWheeledChart(ndx);
    largestPlanetsChart(ndx);
    mostUsedStarshipsChart(ndx);
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


function makePieChart(ndx) {
    let pieChart = dc.pieChart('#pie-chart');

    let nameDim = ndx.dimension(dc.pluck('category'));
    
    let nameGroup = nameDim.group();

    pieChart
        .width(400)
        .height(400)
        .slicesCap(6)
        .innerRadius(100)
        .dimension(nameDim)
        .group(nameGroup)
        .legend(dc.legend())
        .on('pretransition', function(chart) {
            chart.selectAll('text.pie-slice').text(function(d) {
                return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
            });
        });
    
    pieChart.render();

}

function makeBarChart(ndx) {
    
    let barChart = dc.barChart('#bar-chart');
    
    let dim = ndx.dimension(dc.pluck('category'));
    
    let group = dim.group();
    
    barChart
        .width(400)
        .height(400)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dim)
        .group(group)
        .transitionDuration(500)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .xAxisLabel('Categories')
        .yAxis().ticks(10);
    
    barChart.render()
}

function makeRowChart(ndx) {
    // let rowChart = dc.rowChart('#row-chart');
    
    // let categoryDim = ndx.dimension(dc.pluck('category'));
    
    // let peopleFilter = categoryDim.filter(function(d) {return d.category === 'people'});
    
    // let filmGroup = peopleFilter.group(function(d){return d.films});
    
    // rowChart
    //     .width(768)
    //     .height(450)
    //     .x(d3.scaleLinear().domain([0, endPoints.length]))
    //     .dimension(peopleFilter)
    //     .group(filmGroup)
    //     .render()
}

function humanNonHumanChart(ndx) {
    let humanChart = dc.pieChart('#human-non-human-chart');
    
    let categoryDim = ndx.dimension(function(d) {
        if (d.category === 'people' && d.species[0] === 'https://swapi.co/api/species/1/') {
            return 'Human';
        } else if (d.category === 'people' && d.species[0] !== 'https://swapi.co/api/species/1/') {
            return 'Non-Human';
        } else {
            return 'not-people';
        }
    });
    
    let peopleGroup = categoryDim.group();
    
    let filteredGroup = removeNonPeople(peopleGroup);
    
    // function to create fake group
    function removeNonPeople(source_group) {
        return {
            all:function () {
                return source_group.all().filter(function(d) {
                    return d.key !== 'not-people';
                });
            }
        };
    }
    
    humanChart
        .height(400)
        .width(400)
        .innerRadius(80)
        .transitionDuration(500)
        .dimension(categoryDim)
        .group(filteredGroup)
        .legend(dc.legend())
        .on('pretransition', function(chart) {
            chart.selectAll('text.pie-slice').text(function(d) {
                return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
            });
        });
    
    humanChart.render();
}

function wheeledNonWheeledChart(ndx) {
    
    let wheeledChart = dc.pieChart('#wheeled-non-wheeled-chart');
    
    let vehCategoryDim = ndx.dimension(function(d) {
        if (d.category === 'vehicles' && d.vehicle_class === 'wheeled') {
            return 'Wheeled';
        } else if (d.category === 'vehicles' && d.vehicle_class !== 'wheeled') {
            return 'Non-Wheeled';
        } else {
            return 'n/a';
        }
    });
    
    let vehiclesGroup = vehCategoryDim.group();
    
    let filterVehiclesGroup = removeNonVehicles(vehiclesGroup);
    
    console.log(filterVehiclesGroup.all()); // for testing
    
    // function to create fake group
    function removeNonVehicles(source_group) {
        return {
            all:function () {
                return source_group.all().filter(function(d) {
                    return d.key !== 'n/a';
                });
            }
        };
    }
    
    wheeledChart
        .height(400)
        .width(400)
        .innerRadius(80)
        .transitionDuration(500)
        .dimension(vehCategoryDim)
        .group(filterVehiclesGroup)
        .legend(dc.legend())
        .on('pretransition', function(chart) {
            chart.selectAll('text.pie-slice').text(function(d) {
                return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
            });
        });
    
    wheeledChart.render();
}

function largestPlanetsChart(ndx) {
    let planetsChart = dc.rowChart('#largest-planets-chart');
    
    let nameDim = ndx.dimension(dc.pluck('name'));
    
    let diameterPerPlanet = nameDim.group().reduceSum(dc.pluck('diameter'));
    
    let filteredGroup = removeNoDiameterSortTopTen(diameterPerPlanet);
    
    console.log(filteredGroup.all()); // for testing

    // function to create fake group
    function removeNoDiameterSortTopTen(source_group) {
        return {
            all: function (d) {
                return source_group.all().filter(function(d){return d.value > 0;}).sort((a, b) => (a.value < b.value) ? -1 : 1).slice(-10);
            }
        };
    }
    
    planetsChart
        .width(740)
        .height(360)
        .x(d3.scaleOrdinal())
        .elasticX(true)
        .transitionDuration(500)
        .dimension(nameDim)
        .group(filteredGroup)
        .labelOffsetX(5);
    
    planetsChart.render();
}

function mostUsedStarshipsChart(ndx) {
    let starshipsChart = dc.rowChart('#most-used-starships-chart');
    
    let nameStarshipsDim = ndx.dimension(dc.pluck('name'));
    
    let filmsPerFact = nameStarshipsDim.group().reduce(
        function(p, v) {
            p.count++;
            if (Array.isArray(v.films)) {
                p.films += v.films.length
            };
            p.category = v.category;
            return p;
        },
        function(p, v) {
            p.count--;
            if (p.count === 0) {
                p.category = '';
                p.films = 0;
            }
            return p;
        },  
        function(p, v) {
            return { count: 0, category: '', films: 0 };
        }
    );

    console.log(filmsPerFact.all()); // for testing
    
    let filteredStarshipsGroup = removeNonStarshipsSortTopFifteen(filmsPerFact);
    
    // console.log(filteredStarshipsGroup.all()); // for testing

    // function to create fake group
    function removeNonStarshipsSortTopFifteen(source_group) {
        return {
            all: function (d) {
                return source_group.all().filter(function(d){ 
                    if (typeof(d.value) === 'object') {
                        return d.value.category === 'starships';
                    } else {
                        return 0;
                    }
                }).sort((a, b) => (a.value.films < b.value.films) ? 1 : -1).slice(0, 15);
            }
        };
    }
    
    starshipsChart
        .width(560)
        .height(360)
        .x(d3.scaleOrdinal())
        .elasticX(true)
        .transitionDuration(500)
        .dimension(nameStarshipsDim)
        .group(filteredStarshipsGroup)
        .valueAccessor(function(d) {
            return d.value.films;
        })
        .labelOffsetX(5);
    
    starshipsChart.render();
}