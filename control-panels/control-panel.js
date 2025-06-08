/**
 * Base class for all control panels
 */
class ControlPanel {
    constructor(title, position = { top: '20px', left: '20px' }) {
        this.consolePane = null;
        this.consoleContent = null;
        this.consoleVisible = false;
        this.title = title;
        this.position = position;

        this.createConsolePane();
    }

    createConsolePane() {
        // Create console pane
        this.consolePane = document.createElement('div');
        this.consolePane.className = 'console-pane';
        this.consolePane.style.position = 'absolute';
        this.consolePane.style.top = this.position.top;

        // Handle either left or right position
        if (this.position.right) {
            this.consolePane.style.right = this.position.right;
        } else if (this.position.left) {
            this.consolePane.style.left = this.position.left;
        }
        this.consolePane.style.backgroundColor = 'rgba(80, 80, 80, 0.8)';
        this.consolePane.style.color = 'white';
        this.consolePane.style.padding = '0';
        this.consolePane.style.borderRadius = '5px';
        this.consolePane.style.fontFamily = 'Arial, sans-serif';
        this.consolePane.style.display = 'block';
        this.consolePane.style.width = '300px';
        this.consolePane.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)';

        // Create header for dragging
        const header = document.createElement('div');
        header.style.backgroundColor = 'rgba(100, 100, 100, 0.9)';
        header.style.padding = '10px 15px';
        header.style.borderTopLeftRadius = '5px';
        header.style.borderTopRightRadius = '5px';
        header.style.cursor = 'move';
        header.style.borderBottom = '1px solid #666';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';

        // Add title to header
        const titleElement = document.createElement('h3');
        titleElement.textContent = this.title;
        titleElement.style.margin = '0';
        header.appendChild(titleElement);

        // Create icons container for collapse and close
        const iconsContainer = document.createElement('div');
        iconsContainer.style.display = 'flex';
        iconsContainer.style.alignItems = 'center';

        // Add collapse/expand icon
        const collapseIcon = document.createElement('div');
        collapseIcon.innerHTML = '&#9650;'; // Up arrow (collapse)
        collapseIcon.style.cursor = 'pointer';
        collapseIcon.style.fontSize = '16px';
        collapseIcon.style.width = '20px';
        collapseIcon.style.height = '20px';
        collapseIcon.style.display = 'flex';
        collapseIcon.style.justifyContent = 'center';
        collapseIcon.style.alignItems = 'center';
        collapseIcon.style.userSelect = 'none';
        collapseIcon.title = 'Collapse/Expand';
        iconsContainer.appendChild(collapseIcon);

        // Add close icon
        const closeIcon = document.createElement('div');
        closeIcon.innerHTML = '&#10006;'; // X symbol
        closeIcon.style.cursor = 'pointer';
        closeIcon.style.fontSize = '16px';
        closeIcon.style.width = '20px';
        closeIcon.style.height = '20px';
        closeIcon.style.display = 'flex';
        closeIcon.style.justifyContent = 'center';
        closeIcon.style.alignItems = 'center';
        closeIcon.style.userSelect = 'none';
        closeIcon.style.marginLeft = '8px';
        closeIcon.title = 'Close';

        // Add click handler to hide the panel
        closeIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent dragging
            this.hide();

            // Find the toggle for this panel in the Solar System Controls
            const planetName = this.title.split(' ')[0].toLowerCase();
            const toggle = document.getElementById(`${planetName}-controls-toggle`);
            if (toggle) {
                toggle.checked = false;
            }
        });

        iconsContainer.appendChild(closeIcon);

        // Add icons container to header
        header.appendChild(iconsContainer);

        // Add the header to the console pane
        this.consolePane.appendChild(header);

        // Create content container with padding
        const content = document.createElement('div');
        content.style.padding = '15px';
        this.consolePane.appendChild(content);

        // Make the console pane draggable
        this.makeDraggable(this.consolePane, header);

        // Store content container for adding controls
        this.consoleContent = content;

        // Add to document
        document.body.appendChild(this.consolePane);

        // Add collapse/expand functionality
        collapseIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent dragging when clicking the icon

            // Get current position before changing display
            const currentTop = this.consolePane.offsetTop;
            const currentLeft = this.consolePane.offsetLeft;

            if (content.style.display === 'none') {
                // Expand
                content.style.display = 'block';
                collapseIcon.innerHTML = '&#9650;'; // Up arrow (collapse)
            } else {
                // Collapse
                content.style.display = 'none';
                collapseIcon.innerHTML = '&#9660;'; // Down arrow (expand)
            }

            // Restore position after changing display
            this.consolePane.style.top = `${currentTop}px`;
            this.consolePane.style.left = `${currentLeft}px`;
        });
    }

    makeDraggable(element, dragHandle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        dragHandle.onmousedown = function(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeHandler;
            document.onmousemove = dragHandler;
        };

        function dragHandler(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.bottom = 'auto';
            element.style.right = 'auto';
        }

        function closeHandler() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    show() {
        if (this.consolePane) {
            this.consolePane.style.display = 'block';
            this.consoleVisible = true;
        }
    }

    hide() {
        if (this.consolePane) {
            this.consolePane.style.display = 'none';
            this.consoleVisible = false;
        }
    }
}