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
    
    if (allData.length === totalCount) {
        makeGraphs();        
    }
}

function makeGraphs() {
    console.log('All data has been retrieved!');
    console.log(allData); // for testing
    makeMeters();
    
    const ndx = crossfilter(allData);

    // function calls to build dashboard charts
    humanNonHumanChart(ndx);
    wheeledNonWheeledChart(ndx);
    largestPlanetsChart(ndx);
    mostUsedStarshipsChart(ndx);
    mostAppearancesByCharachterChart(ndx);
    speedByStarshipsChart(ndx);
    tallestCharactersChart(ndx);
    crewCapacityChart(ndx);
    planetPopulationsChart(ndx);
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

function humanNonHumanChart(ndx) {
    
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
    
    let humanChart = dc.pieChart('#human-non-human-chart');
    
    humanChart
        .height(360)
        .width(360)
        .innerRadius(40)
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
    
    let wheeledChart = dc.pieChart('#wheeled-non-wheeled-chart');
    
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
    
    let nameDim = ndx.dimension(dc.pluck('name'));
    
    let diameterPerPlanet = nameDim.group().reduceSum(dc.pluck('diameter'));
    
    let filteredGroup = removeNoDiameterSortTopTen(diameterPerPlanet);
    
    // function to create fake group
    function removeNoDiameterSortTopTen(source_group) {
        return {
            all: function (d) {
                return source_group.all().filter(function(d){return d.value > 0;}).sort((a, b) => (a.value < b.value) ? -1 : 1).slice(-10);
            }
        };
    }
    
    let planetsChart = dc.rowChart('#largest-planets-chart');
    
    planetsChart
        .width(680)
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
    
    let nameStarshipsDim = ndx.dimension(dc.pluck('name'));
    
    let filmsPerFact = nameStarshipsDim.group().reduce(
        function(p, v) {
            p.count = 1;
            if (Array.isArray(v.films)) {
                p.films = v.films.length
            };
            p.category = v.category;
            return p;
        },
        function(p, v) {
            p.count = 0;
            p.category = '';
            p.films = 0;
            return p;
        },  
        function(p, v) {
            return { count: 0, category: '', films: 0 };
        }
    );

    let filteredStarshipsGroup = removeNonStarshipsSortTopFifteen(filmsPerFact);

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
    
    let starshipsChart = dc.rowChart('#most-used-starships-chart');
    
    starshipsChart
        .width(640)
        .height(360)
        .x(d3.scaleOrdinal())
        .elasticX(true)
        .transitionDuration(500)
        .dimension(nameStarshipsDim)
        .group(filteredStarshipsGroup)
        .valueAccessor(function(d) {
            return d.value.films;
        })
        .labelOffsetX(5)
        .xAxis().tickFormat(d3.format(",.0f")).tickValues([0, 1, 2, 3, 4]);
    
    starshipsChart.render();
}

function mostAppearancesByCharachterChart(ndx) {
    
    let nameCharacterDim = ndx.dimension(dc.pluck('name'));
    
    let charactersPerFact = nameCharacterDim.group().reduce(
        function(p, v) {
            p.count = 1;
            if (Array.isArray(v.films)) {
                p.films = v.films.length
            };
            p.category = v.category;
            return p;
        },
        function(p, v) {
            p.count = 0;
            p.category = '';
            p.films = 0;
            return p;
        },  
        function(p, v) {
            return { count: 0, category: '', films: 0 };
        }
    );

    let filteredCharactersGroup = removeNonCharactersSortTopFifteen(charactersPerFact);
    
    // function to create fake group
    function removeNonCharactersSortTopFifteen(source_group) {
        return {
            all: function (d) {
                return source_group.all().filter(function(d){ 
                    if (typeof(d.value) === 'object') {
                        return d.value.category === 'people';
                    } else {
                        return 0;
                    }
                }).sort((a, b) => (a.value.films < b.value.films) ? 1 : -1).slice(0, 15);
            }
        };
    }
    
    let characterAppearancesChart = dc.barChart('#most-appearing-characters-chart');

    characterAppearancesChart
        .width(640)
        .height(360)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(nameCharacterDim)
        .group(filteredCharactersGroup)
        .valueAccessor(function(d) {
            return d.value.films;
        })
        .transitionDuration(500)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .xAxisLabel('', 64)
        .yAxis().ticks(8);
    
    characterAppearancesChart.render()
}

function speedByStarshipsChart(ndx) {
    
    let nameStarshipDim = ndx.dimension(dc.pluck('name'));
    
    let starshipsPerFact = nameStarshipDim.group().reduce(
        function(p, v) {
            p.count = 1;
            if (v.name === 'Y-wing') {
                p.max_atmosphering_speed = parseInt(v.max_atmosphering_speed.substring(0, v.max_atmosphering_speed.length - 2)); // data from API has "km" at end of number
            } else {
                p.max_atmosphering_speed = parseInt(v.max_atmosphering_speed);
            }
            p.category = v.category;
            return p;
        },
        function(p, v) {
            p.count = 0;
            p.category = '';
            p.max_atmosphering_speed = 0;
            return p;
        },  
        function(p, v) {
            return { count: 0, category: '', max_atmosphering_speed: 0 };
        }
    );

    let filteredStarshipsGroup = removeNonStarships(starshipsPerFact);
    
    // function to create fake group
    function removeNonStarships(source_group) {
        return {
            all: function (d) {
                return source_group.all().filter(function(d){ 
                    return d.value.category === 'starships' && !isNaN(d.value.max_atmosphering_speed) ;
                });
            }
        };
    }

    let starshipSpeedChart = dc.barChart('#speed-by-starship-chart');
    
    starshipSpeedChart
        .width(720)
        .height(440)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(nameStarshipDim)
        .group(filteredStarshipsGroup)
        .valueAccessor(function(d) {
            return d.value.max_atmosphering_speed;
        })
        .transitionDuration(500)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .xAxisLabel('', 100)
        .xAxisPadding(100)
        .yAxis().ticks(12);
    
    starshipSpeedChart.render()
}

function tallestCharactersChart(ndx) {
    
    let charactersDim = ndx.dimension(dc.pluck('name'));
    
    let heightPerCharacter = charactersDim.group().reduceSum(dc.pluck('height'));
    
    let filteredCharactersGroup = removeNonCharacters(heightPerCharacter);

    // function to create fake group
    function removeNonCharacters(source_group) {
        return {
            all: function (d) {
                return source_group.all().filter(function(d){return !Number.isNaN(d.value)});
            }
        };
    }
    
    let tallestCharactersChart = dc.lineChart('#tallest-characters-chart');
    
    tallestCharactersChart
        .width(1200)
        .height(440)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .transitionDuration(500)
        .brushOn(false)
        .xyTipsOn(true)
        .xAxisLabel('', 86)
        .dimension(charactersDim)
        .group(filteredCharactersGroup);
    
    tallestCharactersChart.render();
}


function crewCapacityChart(ndx) {
    
    let crewDim = ndx.dimension(dc.pluck('name'));
    
    let vehiclesPerFact = crewDim.group().reduce(
        function(p, v) {
            p.count = 1;
            p.category = v.category;
            p.crew = parseInt(v.crew);
            return p;
        },
        function(p, v) {
            p.count = 0;
            p.category = '';
            p.crew = 0;
            return p;
        },  
        function(p, v) {
            return { count: 0, category: '', crew: 0 };
        }
    );

    let filteredVehiclesGroup = removeNonVehicles(vehiclesPerFact);
    
    // function to create fake group
    function removeNonVehicles(source_group) {
        return {
            all: function (d) {
                return source_group.all().filter(function(d){return d.value.category === 'vehicles' && !Number.isNaN(d.value.crew)});
            }
        };
    }
    
    let crewCapacityChart = dc.lineChart('#crew-capacity-chart');
    
    crewCapacityChart
        .width(750)
        .height(480)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .transitionDuration(500)
        .brushOn(false)
        .xyTipsOn(true)
        .xAxisLabel('', 96)
        .yAxisLabel('', 32)
        .valueAccessor(function(d) {
            return d.value.crew;
        })
        .dimension(crewDim)
        .group(filteredVehiclesGroup);
    
    crewCapacityChart.render();
}

function planetPopulationsChart(ndx) {
    
    let populationNameDim = ndx.dimension(dc.pluck('name'));

    let populationPerPlanet = populationNameDim.group().reduce(
        function(p, v) {
            p.count = 1;
            p.category = v.category;
            p.diameter = parseInt(v.diameter);
            p.population = parseInt(v.population);
            return p;
        },
        function(p, v) {
            p.count = 0;
            p.category = '';
            p.diameter = 0;
            p.population = 0;
            return p;
        },  
        function(p, v) {
            return { count: 0, category: '', diameter: 0, population: 0 };
        }
    );
    
    let filteredPopulationGroup = removeNonPlanets(populationPerPlanet);

    // function to create fake group
    function removeNonPlanets(source_group) {
        return {
            all: function (d) {
                return source_group.all().filter(function(d){return d.value.category === 'planets' && d.value.diameter > 0}).sort((a, b) => (a.value.diameter < b.value.diameter) ? -1 : 1).slice(-10);
            }
        };
    }
    
    let populationChart = dc.pieChart('#planet-population-chart');
    
    populationChart
        .width(360)
        .height(360)
        .innerRadius(0)
        .transitionDuration(500)
        .dimension(populationNameDim)
        .group(filteredPopulationGroup)
        .valueAccessor(function(d) {
            return d.value.population;
        })
        .legend(dc.legend());
        
    populationChart.render();
}