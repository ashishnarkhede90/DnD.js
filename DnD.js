/* _dnd Object Constructor 
========================== */

/* ==========
	source - Id of the source div which would list the draggable options initially,
	target - Id of the target div which would be empty initialy
	searchFilterid - Id of the input searc box used to filter the list in the source div
	itemClassName - Common class name used for child divs for options listed in the source/target divs
	optionsMap - Array of JSON objects used to initially populate the list of options in the source list
	validDropTargets - List of drop valid target ids to be used for a given list of options. This will help prevent dropping 1 item into multiple places if that's the requirement 
	============= */

function _dnd(config) {
	var about = {
		Version: 0.1,
		Author: "Ashish N",
		Created: "Summer 2017"
	}

	if(config.sourceId && config.targetId) {
		// Avoid clobbering the window scope
		// return new _dnd object if we're in the wrong scope
		if(this == window) {
			return new _dnd(config);
		}

		// We're in the right scope. Init our object and return it
		this.source 			= document.getElementById(config.sourceId);
		this.target 			= document.getElementById(config.targetId);
		this.searchFilter 		= document.getElementById(config.searchFilterId);
		this.draggedElem 		= ''; // element being dragged at a particular instance
		this.itemClassName 		= config.draggableElemClass; // name of a common class used for each child div in the list of options 
		this.sourceOptions 		= ''; // filtered list of json objects used to populate source list
		//this.optionsMap 		= JSON.parse(config.optionsMap); // unfiltered list of json objects originally returned by the server
		this.optionsMap 		= config.optionsMap;
		this.validDropTargets 	= config.validDropTargets;
		this.selectedValuesJSON = [];

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
		console.log('init for ' + this.source.id)

		this.populateSourceOptions(this.optionsMap);

		// add event listener for keyup event for search box elements
		if(this.searchFilter) {
			this.searchFilter.addEventListener('keyup', this.filterOptions.bind(this));	
		}

		/* ================
			Add event handlers for drag and drop events
			Use this.eventHandlerName.bind(this) to make sure that the this object context is passed to the handler.
			Otherwise, this will be equal to document object in the event handler
			========================================
		*/

		// add event listeners to draggable elements
		var draggableElems = document.querySelectorAll('.' + this.itemClassName);
		draggableElems.forEach(function(elem) {
			
			// attach event only if the child element belongs to a parent in the current instance. This will make sure that the event is bound with correct instance of this 
			if(elem.parentNode.id == this.source.id) {
				// add handler for drag start event. dragstart -  fired when the user starts dragging an element 
				elem.addEventListener("dragstart", this.handleDragStart.bind(this), false);
				// dragend - when a drag operation is being ended (by releasing a mouse button or hitting the escape key).
				elem.addEventListener("dragend", this.handleDragEnd.bind(this), false);
			}
			
		}, this);

		// dragenter - fired when a dragged element or text selection enters a valid drop target.
		document.addEventListener("dragenter", this.handleDragEnter.bind(this), false);
		// drop - fired when an element is dropped into a valid drop target
		document.addEventListener("drop", this.handleDrop.bind(this), false);
		// dragover - fired when an element or text selection is being dragged over a valid drop target (every few hundred milliseconds).
		document.addEventListener("dragover", this.handleDragOver.bind(this), false);
		
		return this;
	},

	populateSourceOptions: function(sourceOptions) {
		this.clearOptions();
		
		if(this.optionsMap == undefined || this.optionsMap == '') {
			this.optionsMap = sourceOptions;
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
				newDiv.dataset.entityid = option['Id'];
				newDiv.dataset.name = option['Name'];
				newDiv.innerHTML = option['Label'];
				
				// attach necessary event listeners
					// add handler for drag start event. dragstart -  fired when the user starts dragging an element 
					newDiv.addEventListener("dragstart", this.handleDragStart.bind(this), false);
					// dragend - when a drag operation is being ended (by releasing a mouse button or hitting the escape key).
					newDiv.addEventListener("dragend", this.handleDragEnd.bind(this), false);

					// for the first div, add margin-top
					if(i == 0) {
						newDiv.setAttribute('style', 'margin-top: 30px'); 
					}

				// attach div to document fragment		
				docFrag.appendChild(newDiv);
			}
		} // for

		this.source.appendChild(docFrag);
		console.log(this);
	},

	handleDragStart: function(e) {

		console.log('handleDragStart for ' + e.target.id + ' source: ' + this.source.id);	

		var draggedElem = e.target; // element being dragged
		this.draggedElem = draggedElem; // attach the element being dragged to this object instance
		// change styling on element being dragged
		this.draggedElem.style.opacity = 0.4;
		this.draggedElem.style.border = '1px solid #0070d2';
		// set data transfer
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.draggedElem.innerHTML);
	},

	// Handler for drag end event. dragend - when a drag operation is being ended (by releasing a mouse button or hitting the escape key).
	handleDragEnd: function(e) {
		console.log('handleDragEnd');
		// remove/reset stylig from the dragged element
		if(this.draggedElem) {
			this.draggedElem.style.opacity = '';
			this.draggedElem.style.border = '';
			
			// clear this.draggedElem once drop is complete
			this.draggedElem = '';
		}

		// remove/reset styling from the drop target(s)
		this.target.style.border = '';		
	},

	// Handler for drag enter event. dragenter - fired when a dragged element or text selection enters a valid drop target.
	handleDragEnter: function(e) {
		//console.log('handleDragEnter for ' + this.source.id);
		if(this.validDropTargets && this.validDropTargets.length > 0) {
			this.validDropTargets.forEach(function(dt) {
				var elem = document.getElementById(dt);

				// Check if the target element's parent id is same as source id on `this` instance. this will make sure that only valid drop target is highlighted. this in in efforts to make sure elements cannot be dropped into multiple targets
				if(e.target.parentNode.id == this.source.id && this.draggedElem) {
					elem.style.border = '1px dashed #0070d2';
				}
			}, this);
		}
	},

	
	handleDragOver: function(e) {
		e.preventDefault();
		//console.log('handleDragOver');
	}, 

	handleDrop: function(e) {
		e.preventDefault();

		if(!this.draggedElem) {
			return;
		}
		console.log('handleDrop for ' + e.target.id + ' source: ' + this.source.id );

		var currentDropTarget = e.target;
		// validate that the currentDropTarget is one of the valid drop targets
		/* ===============
			Valid drop targets are:
			1) div with id this.source.id
			2) div with id this.target.id
			3) div with id of child list elements since an element can be dropped on one of the existing elements in the drop target
		 ============ */

		var isValidDropTarget = true;
		// check if the drop target is a child element in a list
		var isDropTargetAChildElem = currentDropTarget.className.indexOf(this.itemClassName) > -1;
		if(isDropTargetAChildElem) {
			// in this case, drop target is valid if its one of the valid drop targets specified on this instance or its the source from where the element was originally moved
			isValidDropTarget = (this.validDropTargets.indexOf(currentDropTarget.parentNode.id) > -1 || currentDropTarget.parentNode.id == this.source.id);
		}

		if(currentDropTarget.id == this.target.id || currentDropTarget.id == this.source.id || isValidDropTarget) {
			// get the div that originally contained dragged element i.e. parent of the dragged element
			var parentOfDraggedElem = this.draggedElem.parentNode.id;
 
			if(currentDropTarget.id == parentOfDraggedElem || currentDropTarget.parentNode.id == parentOfDraggedElem) {
				return;
			}
		
			// handle scenario where an element is dropped over an exisitng element in the drop target, also check if element is being dropped into the originating parent itself
			if(currentDropTarget.className.indexOf(this.itemClassName) > -1 && currentDropTarget.parentNode.id != parentOfDraggedElem) {
				//remove the dragged element from the source / original parent
				this.draggedElem.parentNode.removeChild( this.draggedElem );
				currentDropTarget.parentNode.appendChild(this.draggedElem);
			}
			else if(this.validDropTargets.indexOf(currentDropTarget.id) > -1 || currentDropTarget.id == this.source.id){
				//remove the dragged element from the source / original parent
				this.draggedElem.parentNode.removeChild( this.draggedElem );
				currentDropTarget.appendChild(this.draggedElem);
			}
		}

		var selectedValJSON = {
			'Id': this.draggedElem.dataset.entityid, // system id of the item
			'Name': this.draggedElem.dataset.name, // system api name of the item
			'Label': this.draggedElem.innerHTML // system label of the item
		};

		// if item is being dropped into the target box
		if(e.target.id == this.target.id || e.target.parentNode.id == this.target.id) {
			this.selectedValuesJSON.push(selectedValJSON);
		}
		else if(e.target.id == this.source.id || e.target.parentNode.id == this.source.id) { // if the item was moved from target to source box
			// find index of the item to remove from selected json
			var itemIndexToSplice = this.getPopIndex(selectedValJSON, this.selectedValuesJSON);
			// remove item from selected json
			this.selectedValuesJSON.splice(itemIndexToSplice, 1);
		}	
	},

	getPopIndex: function(itemToRemove, selectedValuesJSON) {
		for(var i=0; i<selectedValuesJSON.length; i++) {
			if(selectedValuesJSON[i]['Id'] == itemToRemove['Id']) {
				return i;
			}
		}
	},

	filterOptions: function(e) {
		console.log('filterOptions');
		console.log(this.searchFilter.value);
		//this.populateSourceOptions(null);
		var filteredOptions = [];

		for(var i=0; i<this.optionsMap.length; i++) {
			var searchKey = this.searchFilter.value;
			if(searchKey.toLowerCase() == this.optionsMap[i]['Label'].slice(0, searchKey.length).toLowerCase()) {
				filteredOptions.push(this.optionsMap[i]);
			}
		}

		console.log(filteredOptions);
		if(filteredOptions.length > 0) {
			this.populateSourceOptions(filteredOptions);
		}	
	},

	clearOptions: function() {
		console.log('clearOptions');
		
		// remove list items
		var elemKey = '#' + this.source.id + ' .' + this.itemClassName;
		var elemsToRemove = document.querySelectorAll(elemKey);
		
		for(var i=0; i<elemsToRemove.length; i++) {
			elemsToRemove[i].parentNode.removeChild(elemsToRemove[i]);
		}
	}
}
