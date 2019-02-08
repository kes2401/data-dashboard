describe('getData function', function() {

    it('Should call getJSON jQuery method', function() {
        // arrange
        const url = 'https://swapi.co/api/';
        const endpoint = 'people';
        spyOn(jQuery, 'getJSON');
        
        // act
        getData(url, endpoint, false);
        
        // assert
        expect(jQuery.getJSON).toHaveBeenCalled();   
    })
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