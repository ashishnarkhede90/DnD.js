/* _dnd Object Constructor 
========================== */

function _dnd(source, target, searchFilterId, itemClassName) {
	var about = {
		Version: 0.1,
		Author: "Ashish N",
		Created: "Summer 2017"
	}

	if(source && target) {
		// Avoid clobbering the window scope
		// return new _dnd object if we're in the wrong scope
		if(this == window) {
			return new _dnd(source, target, searchFilterId, itemClassName);
		}

		// We're in the right scope. Init our object and return it
		this.source = document.getElementById(source);
		this.target = document.getElementById(target);
		this.searchFilter = document.getElementById(searchFilterId);
		this.draggedElem = ''; // element being dragged at a particular instance
		this.itemClassName = itemClassName; // name of a common class used for each child div in the list of options 
		/* ====== Lists used to populate source options ======= */
		this.sourceOptions = ''; // filtered list of json objects used to populate source list
		this.dataMap = ''; // unfiltered list of json objects originally returned by the server

		return this;

	} else {
		return about;
	}
}

/* _dnd Prototype Functions
========================== */
_dnd.prototype = {
	
	init: function() {
		// Attach event listeners to the elements
		console.log(this);

		/* ================
			Add event handlers for drag and drop events
			Use this.eventHandlerName.bind(this) to make sure that the this object context is passed to the handler.
			Otherwise, this will be equal to document object in the event handler
			========================================
		*/

		// add handler for drag start event. dragstart -  fired when the user starts dragging an element 
		document.addEventListener("dragstart", this.handleDragStart.bind(this), false);
		// dragend - when a drag operation is being ended (by releasing a mouse button or hitting the escape key).
		document.addEventListener("dragend", this.handleDragEnd.bind(this), false);
		// dragenter - fired when a dragged element or text selection enters a valid drop target.
		document.addEventListener("dragenter", this.handleDragEnter.bind(this), false);
		// dragover - fired when an element or text selection is being dragged over a valid drop target (every few hundred milliseconds).
		document.addEventListener("dragover", this.handleDragOver.bind(this), false);
		// drag - fired when an element is dropped into a valid drop target
		document.addEventListener("drop", this.handleDrop.bind(this), false);
		// add handler for keyup event for the search box
		document.querySelector('#inputSearch').addEventListener('keyup', this.filterOptions.bind(this));

		return this;
	},

	populateSourceOptions: function(sourceOptions) {
		this.clearOptions();
		
		if(this.dataMap == undefined || this.dataMap == '') {
			this.dataMap = sourceOptions;
		}

		// set sourceoptions property of current object instance
		this.sourceOptions = sourceOptions;

		var docFrag = document.createDocumentFragment();

		for(var i=0; i<sourceOptions.length; i++) {
			var option = sourceOptions[i];
			
			if(option) {
				var newDiv = document.createElement('div');
				newDiv.className = 'item';
				newDiv.setAttribute('draggable', true);
				newDiv.setAttribute('Id', option['Id']);
				newDiv.dataset.psid = option['Id'];
				newDiv.dataset.name = option['Name'];
				newDiv.innerHTML = option['Label'];
				
				// attach div to document fragment		
				docFrag.appendChild(newDiv);
			}
		} // for

		this.source.appendChild(docFrag);
	},

	handleDragStart: function(e) {
		console.log('handleDragStart');	

		var draggedElem = e.target; // element being dragged
		this.draggedElem = draggedElem; // attach the element being dragged to this object instance
		// change styling on element being dragged
		this.draggedElem.style.opacity = 0.4;
		this.draggedElem.style.border = '1px solid #0070d2';
		// set data transfer
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.draggedElem.innerHTML);

		console.log(this);
	},

	// Handler for drag end event. dragend - when a drag operation is being ended (by releasing a mouse button or hitting the escape key).
	handleDragEnd: function(e) {
		console.log('handleDragEnd');
		console.log(this);
		// remove/reset stylig from the dragged element
		if(this.draggedElem) {
			this.draggedElem.style.opacity = '';
			this.draggedElem.style.border = '';
		}
		// remove/reset styling from the drop target
		this.target.style.border = '';
	},

	// Handler for drag enter event. dragenter - fired when a dragged element or text selection enters a valid drop target.
	handleDragEnter: function(e) {
		console.log('handleDragEnter');
		console.log(this);
		// change styling on drop target
		this.target.style.border = '1px dashed #0070d2';
	},

	handleDragOver: function(e) {
		e.preventDefault();
		console.log('handleDragOver');
		console.log(this);
	},

	handleDrop: function(e) {
		e.preventDefault();
		console.log('handleDrop');
		console.log(this);

		var currentDropTarget = e.target;
		// validate that the currentDropTarget is one of the valid drop targets
		/* ===============
			Valid drop targets are:
			1) div with id this.source.id
			2) div with id this.target.id
			3) div with id of child list elements since an element can be dropped on one of the existing elements in the drop target
		 ============ */
		if(currentDropTarget.id == this.target.id || currentDropTarget.id == this.source.id || currentDropTarget.className.indexOf(this.itemClassName) > -1) {
			// get the div that originally contained dragged element i.e. parent of the dragged element
			var parentOfDraggedElem = this.draggedElem.parentNode.id;
			//remove the dragged element from the source / original parent
			this.draggedElem.parentNode.removeChild( this.draggedElem );

			// handle scenario where an element is dropped over an exisitng element in the drop target, also check if element is being dropped into the originating parent itself
			if(currentDropTarget.className.indexOf(this.itemClassName) > -1 && currentDropTarget.parentNode.id != parentOfDraggedElem) {
				currentDropTarget.parentNode.appendChild(this.draggedElem);
			}
			else {
				currentDropTarget.appendChild(this.draggedElem);
			}
		}
	},

	filterOptions: function(e) {
		console.log('filterOptions');
		console.log(this);
		console.log(this.searchFilter.value);
		//this.populateSourceOptions(null);
		var filteredOptions = [];

		for(var i=0; i<this.dataMap.length; i++) {
			var searchKey = this.searchFilter.value;
			if(searchKey.toLowerCase() == this.dataMap[i]['Label'].slice(0, searchKey.length).toLowerCase()) {
				filteredOptions.push(this.dataMap[i]);
			}
		}

		console.log(filteredOptions);
		if(filteredOptions.length > 0) {
			this.populateSourceOptions(filteredOptions);
		}	
	},

	clearOptions: function() {
		console.log('clearOptions');
		console.log(this);
		
		// remove list items
		var elemKey = '#' + this.source.id + ' .' + this.itemClassName;
		var elemsToRemove = document.querySelectorAll(elemKey);
		
		for(var i=0; i<elemsToRemove.length; i++) {
			elemsToRemove[i].parentNode.removeChild(elemsToRemove[i]);
		}
	}
}