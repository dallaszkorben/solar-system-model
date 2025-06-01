/**
 * ViewControlPanel class for controlling the view
 */
class ViewControlPanel extends ControlPanel {
    constructor(solarSystem) {
        super('View Controls', { top: '20px', left: '340px' });
        this.solarSystem = solarSystem;

        // Store references to radio buttons
        this.viewRadios = {};

        // Create view objects
        this.globalView = new GlobalView(solarSystem);
        this.planetSideView = new PlanetSideView(solarSystem);
        this.localView = new LocalView(solarSystem);
        
        // Set view type for planet side view
        this.planetSideView.setViewType('sunSideView');

        // Track current active view
        this.activeView = null;

        // Create view sections
        this.createGlobalViewsSection();
        this.createPlanetSideViewsSection();
        this.createLocalViewsSection();
    }

    createGlobalViewsSection() {
        // Create Global Views section header
        const globalSectionHeader = document.createElement('h4');
        globalSectionHeader.textContent = 'Global Views';
        globalSectionHeader.style.margin = '0 0 10px 0';
        globalSectionHeader.style.borderBottom = '1px solid #555';
        globalSectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(globalSectionHeader);

        // Create radio button group for views
        const viewRadioGroup = document.createElement('div');
        viewRadioGroup.className = 'view-radio-group';
        viewRadioGroup.style.marginBottom = '15px';
        this.consoleContent.appendChild(viewRadioGroup);

        // Add radio buttons for global views
        this.addViewRadioButton('Top View', 'view', 'topView', viewRadioGroup);
        this.addViewRadioButton('Side View', 'view', 'sideView', viewRadioGroup);
    }

    createPlanetSideViewsSection() {
        // Create Planet Side Views section header with extra margin
        const planetSectionHeader = document.createElement('h4');
        planetSectionHeader.textContent = 'Planet Side Views';
        planetSectionHeader.style.margin = '20px 0 10px 0';
        planetSectionHeader.style.borderBottom = '1px solid #555';
        planetSectionHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(planetSectionHeader);

        // Create radio button group for planet side views
        const planetViewRadioGroup = document.createElement('div');
        planetViewRadioGroup.className = 'view-radio-group';
        planetViewRadioGroup.style.marginBottom = '15px';
        this.consoleContent.appendChild(planetViewRadioGroup);

        // Add radio buttons for planet side views
        this.addViewRadioButton('Sun Side View', 'view', 'sunSideView', planetViewRadioGroup);
        this.addViewRadioButton('Mercury Side View', 'view', 'mercurySideView', planetViewRadioGroup);
        this.addViewRadioButton('Venus Side View', 'view', 'venusSideView', planetViewRadioGroup);
        this.addViewRadioButton('Earth Side View', 'view', 'earthSideView', planetViewRadioGroup);
        this.addViewRadioButton('Mars Side View', 'view', 'marsSideView', planetViewRadioGroup);
        this.addViewRadioButton('Jupiter Side View', 'view', 'jupiterSideView', planetViewRadioGroup);
        this.addViewRadioButton('Saturn Side View', 'view', 'saturnSideView', planetViewRadioGroup);
        this.addViewRadioButton('Uranus Side View', 'view', 'uranusSideView', planetViewRadioGroup);
        this.addViewRadioButton('Neptune Side View', 'view', 'neptuneSideView', planetViewRadioGroup);
    }

    createLocalViewsSection() {
        // Create section header
        const locationHeader = document.createElement('h4');
        locationHeader.textContent = 'Local Views';
        locationHeader.style.margin = '15px 0 10px 0';
        locationHeader.style.borderBottom = '1px solid #555';
        locationHeader.style.paddingBottom = '5px';
        this.consoleContent.appendChild(locationHeader);

        // Create radio button group for location views
        const locationViewRadioGroup = document.createElement('div');
        locationViewRadioGroup.className = 'view-radio-group';
        locationViewRadioGroup.style.marginBottom = '15px';
        this.consoleContent.appendChild(locationViewRadioGroup);

        // Add radio buttons for location views (placeholder for now)
        this.addViewRadioButton('View from Budapest', 'view', 'budapest', locationViewRadioGroup);
        this.addViewRadioButton('View from Kiruna', 'view', 'kiruna', locationViewRadioGroup);
    }

    addViewRadioButton(label, name, value, container) {
        const radioContainer = document.createElement('div');
        radioContainer.style.marginBottom = '10px';
        radioContainer.style.display = 'flex';
        radioContainer.style.alignItems = 'center';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = name;
        radio.value = value;
        radio.id = `radio-${value}`;
        radio.style.marginRight = '10px';

        // Add event listener to handle view changes
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.handleViewChange(value);
            }
        });

        const radioLabel = document.createElement('label');
        radioLabel.htmlFor = `radio-${value}`;
        radioLabel.textContent = label;
        radioLabel.style.flexGrow = '1';
        radioLabel.style.cursor = 'pointer';

        radioContainer.appendChild(radio);
        radioContainer.appendChild(radioLabel);
        container.appendChild(radioContainer);

        // Store reference to the radio button
        this.viewRadios[value] = radio;

        return radio;
    }

    // Method to set the active view
    setView(viewName) {
        if (this.viewRadios[viewName]) {
            this.viewRadios[viewName].checked = true;
            this.handleViewChange(viewName);
        } else {
            console.warn(`View "${viewName}" not found`);
        }
    }

    handleViewChange(viewName) {
        console.log(`Changing view to: ${viewName}`);
        
        // Deactivate current view if any
        if (this.activeView) {
            this.activeView.deactivate();
        }

        // Determine which view object to use based on the view name
        if (viewName === 'topView' || viewName === 'sideView') {
            // Global views
            this.globalView.setViewType(viewName);
            this.activeView = this.globalView;
        } else if (viewName.includes('SideView')) {
            // Planet side views
            this.planetSideView.setViewType(viewName);
            this.activeView = this.planetSideView;
        } else {
            // Local views
            this.localView.setViewType(viewName);
            this.activeView = this.localView;
        }
        
        // Activate the new view
        this.activeView.activate();
    }


}