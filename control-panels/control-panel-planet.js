/**
 * PlanetControlPanel class for controlling individual planets
 * This will be implemented later
 */
class PlanetControlPanel extends ControlPanel {
    constructor(planet) {
        super(`${planet ? planet.constructor.name : 'Planet'} Controls`, { top: '20px', right: '20px' });
        this.planet = planet;
        
        // Hide the panel by default since we're not using it yet
        this.hide();
    }
}