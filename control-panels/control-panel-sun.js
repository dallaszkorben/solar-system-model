/**
 * SunControlPanel class for controlling the sun
 * Extends PlanetControlPanel with sun-specific functionality
 */
class SunControlPanel extends PlanetControlPanel {

    static defaultAxisVisibility = false;

    constructor(sun) {
        super(sun); // Call parent constructor
    }

    getDefaultAxisVisibility() {
        return SunControlPanel.defaultAxisVisibility;
    }

}
