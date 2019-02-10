describe('getData function', function() {
    
    const url = 'https://swapi.co/api/';
    const endpoints = ['films', 'people', 'planets', 'starships', 'species', 'vehicles'];
    const endpoint = 'people';
    let allData = [];
    
    it('API URL should be defined', function() {
        // arrange
        
        // act
        getData(url, endpoint, false);
        
        // assert
        expect(url).toBeDefined();   
    });
    
    it('API URL should be a string', function() {
        // arrange
        
        // act
        getData(url, endpoint, false);
        
        // assert
        expect(typeof(url)).toBe('string');   
    });

    it('Should call getJSON jQuery method', function() {
        // arrange
        spyOn(jQuery, 'getJSON');
        
        // act
        getData(url, endpoint, false);
        
        // assert
        expect(jQuery.getJSON).toHaveBeenCalled();   
    });
    
    it('endpoint should be a string', function() {
        // arrange
        
        // act
        getData(url, endpoint, false);
        
        // assert
        expect(typeof(endpoint)).toBe('string');   
    });

    
    it('allData variable should be defined', function() {
        // arrange
        
        // act
        getData(url, endpoint, false);
        
        // assert
        expect(allData).toBeDefined();   
    });
    
    it('allData variable should contain an array', function() {
        // arrange
        
        // act
        getData(url, endpoint, false);
        
        // assert
        expect(Array.isArray(allData)).toBe(true);   
    });
});

describe('makeGraphs function', function() {
    
    it('calls makeMeters function', function() {
        // arrange
        spyOn(window, 'makeMeters');
        
        // act
        makeGraphs();
        
        // assert
        expect(window.makeMeters).toHaveBeenCalled();  
    });
    
    it('calls humanNonHumanChart function', function() {
        // arrange
        spyOn(window, 'humanNonHumanChart');
        
        // act
        makeGraphs();
        
        // assert
        expect(window.humanNonHumanChart).toHaveBeenCalled();
    });
    
    it('calls wheeledNonWheeledChart function', function() {
        // arrange
        spyOn(window, 'wheeledNonWheeledChart');
        
        // act
        makeGraphs();
        
        // assert
        expect(window.wheeledNonWheeledChart).toHaveBeenCalled();
    });
    
    it('calls largestPlanetsChart function', function() {
        // arrange
        spyOn(window, 'largestPlanetsChart');
        
        // act
        makeGraphs();
        
        // assert
        expect(window.largestPlanetsChart).toHaveBeenCalled();
    });
    
    it('calls mostUsedStarshipsChart function', function() {
        // arrange
        spyOn(window, 'mostUsedStarshipsChart');
        
        // act
        makeGraphs();
        
        // assert
        expect(window.mostUsedStarshipsChart).toHaveBeenCalled();
    });
    
    it('calls mostAppearancesByCharachterChart function', function() {
        // arrange
        spyOn(window, 'mostAppearancesByCharachterChart');
        
        // act
        makeGraphs();
        
        // assert
        expect(window.mostAppearancesByCharachterChart).toHaveBeenCalled();
    });
    
    it('calls speedByStarshipsChart function', function() {
        // arrange
        spyOn(window, 'speedByStarshipsChart');
        
        // act
        makeGraphs();
        
        // assert
        expect(window.speedByStarshipsChart).toHaveBeenCalled();
    });
    
    it('calls tallestCharactersChart function', function() {
        // arrange
        spyOn(window, 'tallestCharactersChart');
        
        // act
        makeGraphs();
        
        // assert
        expect(window.tallestCharactersChart).toHaveBeenCalled();
    });
    
    it('calls crewCapacityChart function', function() {
        // arrange
        spyOn(window, 'crewCapacityChart');
        
        // act
        makeGraphs();
        
        // assert
        expect(window.crewCapacityChart).toHaveBeenCalled();
    });
    
    it('calls planetPopulationsChart function', function() {
        // arrange
        spyOn(window, 'planetPopulationsChart');
        
        // act
        makeGraphs();
        
        // assert
        expect(window.planetPopulationsChart).toHaveBeenCalled();
    });
});