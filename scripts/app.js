var DOM_IDS = {
	EDITOR_CONTENT: 'editorContent',
	EDITOR_TOOLS: 'editorTools',
	EDITOR_PROPERTIES: 'properties',
	EDITOR_MENU_OPTIONS: 'menuOptions',
}

var ToolIDSuffix = 'TL', rootId = ToolIDSuffix + '0';
var $editorContentEl, $editorToolsEl, $editorPropsEl, $editorMenuOptionsEl;
var DataModel = (function(){
	var _nodeRegistry = {};
	var _requestObject = {};
	var _sequence = {};
	var _sequenceCache = {};
	
	var _returnAllData = function(){
		return _nodeRegistry;
	};

	var clearAllData = function(){
		way.clear();
		_nodeRegistry = {};
	};	

	var _registerUpdateableNode = function( parentElId, name, val ){
		//if( parentElId ){ _nodeRegistry[ parentElId ].data[name] = { updateableNode: true, value: val }; }
		if( parentElId ){ _nodeRegistry[ parentElId ].data[name] = val; }
	};
	
	var _registerNode = function( parentElId, id, nodeObject ){
		nodeObject.parentId = parentElId;
		
		if( parentElId ){
			_nodeRegistry[ parentElId ].childrenTools.push( id );
		}
		
		_nodeRegistry[id] = nodeObject;
	};
	var _updateNodeData = function( toolId, name, value ){
		var tool = _nodeRegistry[toolId], property;
		//if( !tool ){ console.log(); return;}
		if( property = tool.data[name] ){
			//property
		}else{ console.log('No such prototype!'); return; }
		if( tool ){ tool[name].data = value; }else{
			console.log( 'Data Update Failed! NOT FOUND: Tool With ID: ' + toolId );
		}
	};
	var _getNodeType = function( toolId ){
		if( !_nodeRegistry[ toolId ] ){ return 'unknown'; }
		return _nodeRegistry[ toolId ].toolName;
	};
	var _getNodeDataReference = function( toolId ){
		var tool = _nodeRegistry[ toolId ];
		if( tool ){ return tool.data; }
		return {};
	};
	var _moveTool = function( toolId, direction ){
		var tool = _nodeRegistry[ toolId ];
		console.log( tool );
	};
	var _removeTool = function( toolId, remove ){
		var toolsToRemove = [];
		var tool = _nodeRegistry[ toolId ];
		if( tool.childrenTools ){
			toolsToRemove = tool.childrenTools.slice( 0 );
		}
		toolsToRemove.push( toolId );
		
		var toolp = tool.parentId;
		var tipid = _nodeRegistry[ toolp ].childrenTools.indexOf( toolId );
		
		if( tipid >= 0 ){
			_nodeRegistry[ toolp ].childrenTools.splice( tipid, 1 );
			console.log( _nodeRegistry[ toolp ].childrenTools );
		}
		
		if( remove ){
			for( var t = 0, len = toolsToRemove.length; t < len; t++ ){
				var tool = toolsToRemove[t];				
				console.log( 'Removing tool from memory ' + tool );
				delete _nodeRegistry[ tool ];				
			}
		}

		return toolsToRemove;
	};

	// JUNK
	var _addToSequence = function( id, parent, type ){
		var index = 1;
		if( type === TOOLTYPE_CONTAINER ){
			if( _sequence[parent] ){
				var obj = {}; obj[id] = [];
				index = _sequence[parent].push( obj );
			}
		}
		if( type === TOOLTYPE_CONTROL ){
			if( _sequenceCache[parent] ){
				//var i = 
				//index = _sequence[  ].push( id );
			}
		}
		if( type === TOOLTYPE_ROOT ){
			_sequence[id] = [];
		}
		
		_sequenceCache[ id ] = [ parent, (index - 1) ];
		console.log( _sequence );
		console.log( _sequenceCache );
		
	};
	// END JUNK

	var _parseForChildTools = function( parent ){
		var els = [];
		var children = parent.children('[data-tooltype]');
		children.each(function(){
			var obj = { id: this.id, el: $(this) };
			els.push( obj );
		});
		return els;
	};
	
	var _treeFromDOM = function(){
		var virtualDOM = $( document.createElement('div') );
		virtualDOM.html( $editorContentEl.html() );
		
		var containers = _parseForChildTools( virtualDOM );
		var children = [];
		for( var i = 0, len = containers.length; i < len; i++){
			children.push( {'id': containers[i].id, 'children': _parseForChildTools( containers[i].el )} );
		}
		return children;
	};
	
	var _returnJSON = function(){
		return _treeFromDOM();
	};


	var returnTreeJSON = function(){
		var domData = _returnJSON();
		var allData = _returnAllData();
		var json = [ { 
			'id': rootId,
			'toolName': allData[rootId]['toolName'],
			'data':allData[rootId]['data'],
			'children': []
		} ];

		var _populateChildren = function( tree ){

			var parent = [];
			
			for( var i = 0, len = tree.length; i < len; i++ ){

				var toolID = tree[i]['id'],
				toolIndex = ( parent.push({ 'id': toolID }) ) -1;
				
				parent[toolIndex]['toolName'] = allData[toolID]['toolName'];
				parent[toolIndex]['data'] = allData[toolID]['data'];
				parent[toolIndex]['children'] = [];

				if( tree[i]['children'] && tree[i]['children'].length > 0 ){
					parent[toolIndex]['children'] = _populateChildren( tree[i]['children'] );
				}
			}
			
			return parent;
		};
		
		json[0]['children'] = _populateChildren( domData );
		return json;		
	};


	return { 
		registerNode: _registerNode, registerUpdateableNode: _registerUpdateableNode, 
		getNodeDataReference: _getNodeDataReference, returnAllData: _returnAllData,
		removeTool : _removeTool, getNodeType: _getNodeType, moveTool: _moveTool,
		returnJSON: _returnJSON, clearAllData: clearAllData, returnTreeJSON: returnTreeJSON 
	};
	
})();

var PropertyEditorController = (function(){
	
	var _showEditor = function(){};
	var _showPropertyEditor = function( toolId ){
		$editorPropertiesEl.html('');
		var data = DataModel.getNodeDataReference( toolId );
		if(Object.getOwnPropertyNames(data).length === 0){
			console.log('Nothing To Edit!');
		}else{
			var template = TemplateController.getTemplate('template_properties'),
				toolType = DataModel.getNodeType( toolId );
				template = template( {properties: data, guid: toolId, type: toolType } );
			$( $editorPropertiesEl ).html( template )
			PageController.setBindings( toolId );
		}
	};
	return { showPropertyEditor : _showPropertyEditor };

})();

var XMLController = (function(){})();

var PageController = (function(){
	var _seed, _elRegistry = {};
	var _getNewGUID = function( seed ){	
		var _guid;
		if(!_seed){ _seed = 1; }
		if( seed ){ _seed = seed }
		if( seed < 1){ console.log( 'Invalid Seed! '); return; }
		_guid = _seed; _seed++; 
		return _guid;
	};
	var dropTool = function( tooltypename, targetToolId ){

		var tooltype = TOOLS_REGISTRY[tooltypename]?TOOLS_REGISTRY[tooltypename].type:TOOLTYPE_UNKNOWN;
		var toolId = ToolIDSuffix + _getNewGUID();

		// Target info for Drop Test
		var target = $('#' + targetToolId )[0];
		var targettype = target.getAttribute('data-tooltype');
		
		var targettypename = targettype,
			targettype = TOOLS_REGISTRY[targettype]?TOOLS_REGISTRY[targettype].type:TOOLTYPE_UNKNOWN;
				
		// DROP TEST
		var dropdenied = false;
		if( targettype === TOOLTYPE_CONTROL || targettype === TOOLTYPE_UNKNOWN ){ dropdenied = true; }
		if( (tooltype === TOOLTYPE_CONTROL) && (targettype !== TOOLTYPE_CONTAINER) ){ dropdenied = true; }
		if( (tooltypename === targettypename) && !(TOOLS_REGISTRY[tooltypename].canContainSelf) ){ dropdenied = true; }
		if(dropdenied){ console.log( 'Drop Denied' ); return; }
		// END DROP TEST


		// Create JSON Object with Default Visibility
		var nodeObject = { toolName: tooltypename, toolType: tooltype, data: { CHK_Visible: 'on' }, childrenTools: [] };
		DataModel.registerNode( targetToolId, toolId, nodeObject );
		
		// Get template for the tooltype
		var rootTemplate =  TemplateController.getTemplate( 'template_tool' );
		var template = TemplateController.getTemplate( 'template_' + tooltypename );
		
		if( template ){ 
			template = template( { 'guid': toolId, 'name': tooltypename } );
		}
		rootTemplate = rootTemplate( { 'html': template, 'guid': toolId, 'name': tooltypename } );
		var rootEl = $(rootTemplate)[0];

		// Attach Dropped Tool
		target.appendChild( rootEl );

		// Trigger Way
		_setBindings( toolId );
		
		_elRegistry[toolId] = $('#' + toolId);
		PropertyEditorController.showPropertyEditor( toolId );

	};

	var bindRootPreferences = function(){
		var rid = rootId, defaults = TOOLS_REGISTRY['root']['defaults'];
		for( var prop in defaults ){
			DataModel.registerUpdateableNode( rid, prop, defaults[prop] );
		}
		_setBindings( rid );
	};

	var _toolDragstart = function(e){
		var tooltype = e.target.getAttribute('data-tooltype');
		e.originalEvent.dataTransfer.setData('tooltype', tooltype);
	};
	var _toolDragging = function(e){
		e.preventDefault();
	};
	var _setBindings = function( toolId ){
		var nd = DataModel.getNodeDataReference( toolId );
		way.set( toolId, nd );
		way.registerBindings();
		way.updateBindings( toolId );
	};
	var _toolDrop = function(e){

		// For exp. Page
		var tooltypename = e.originalEvent.dataTransfer.getData('tooltype');

		// For exp. tooltype_container
		var tooltype = TOOLS_REGISTRY[tooltypename]?TOOLS_REGISTRY[tooltypename].type:TOOLTYPE_UNKNOWN;

		// Target info for Drop Test
		var target = e.target;
		var targettype = target.getAttribute('data-tooltype');
		
		var targettypename = targettype,
			targettype = TOOLS_REGISTRY[targettype]?TOOLS_REGISTRY[targettype].type:TOOLTYPE_UNKNOWN;
		var targetToolId = e.target.getAttribute( 'id' );
				
		// DROP TEST
		var dropdenied = false;
		if( targettype === TOOLTYPE_CONTROL || targettype === TOOLTYPE_UNKNOWN ){ dropdenied = true; }
		if( (tooltype === TOOLTYPE_CONTROL) && (targettype !== TOOLTYPE_CONTAINER) ){ dropdenied = true; }
		if( (tooltypename === targettypename) && !(TOOLS_REGISTRY[tooltypename].canContainSelf) ){ dropdenied = true; }
		if(dropdenied){ console.log( 'Drop Denied' ); return; }
		// END DROP TEST

		// Generate a new ID for this tool
		var toolId = ToolIDSuffix + _getNewGUID();

		// Create JSON Object with Default Visibility
		var nodeObject = { toolName: tooltypename, toolType: tooltype, data: { CHK_Visible: 'on' }, childrenTools: [] };
		DataModel.registerNode( targetToolId, toolId, nodeObject );
		
		// Get template for the tooltype
		var rootTemplate =  TemplateController.getTemplate( 'template_tool' );
		var template = TemplateController.getTemplate( 'template_' + tooltypename );
		
		// If Template is found set default values
		if( template ){ 
			template = template( { 'guid': toolId, 'name': tooltypename } );
		}

		// Render Tool's Root template with template html
		rootTemplate = rootTemplate( { 'html': template, 'guid': toolId, 'name': tooltypename } );
		var rootEl = $(rootTemplate)[0];

		// Attach Dropped Tool
		target.appendChild( rootEl );

		// Trigger 'Way'
		_setBindings( toolId );
		
		// Register element with the elRegistry and show property editor
		_elRegistry[toolId] = $('#' + toolId);
		PropertyEditorController.showPropertyEditor( toolId );

		//DataModel.addToSequence( toolId, targetToolId, tooltype );

	};
	var _contentClick = function(e){
		var editProp = e.target.getAttribute('data-editproperties');
		if( editProp ){
			PropertyEditorController.showPropertyEditor(editProp);
		}
	}
	var _propertiesClick = function(e){
		var delProp = e.target.getAttribute('data-deleteTool');
		if( delProp ){
			PropertyEditorController.showPropertyEditor();
			_removeTool(delProp);
		}
		
		var movetoolup = e.target.getAttribute('data-moveToolUp');
		if( movetoolup ){
			var tool = _elRegistry[ movetoolup ];
			var prevTool = tool.prev('[data-tooltype]');
			if( prevTool ){
				tool.insertBefore( prevTool );
			}
		}

		var movetooldown = e.target.getAttribute('data-moveToolDown');
		if( movetooldown ){
			var tool = _elRegistry[ movetooldown ];
			var nextTool = tool.next('[data-tooltype]');
			if( nextTool ){
				tool.insertAfter( nextTool );
			}
		}
		
	}
	
	var _removeTool = function( toolId ){
		var toolsToRemove = DataModel.removeTool( toolId );
		for( var tool = 0, len = toolsToRemove.length; tool < len; tool++){
			var toolname = toolsToRemove[tool];
			_elRegistry[ toolname ].remove();
		}
		DataModel.removeTool( toolId, true );
		_setBindings( toolId );
	};

	var menuSelect = function(e){
		var type = e.target.getAttribute('data-editor-action');
		switch( type ){
			case 'save': 
				PreloaderController.show();
				setTimeout( function(){ PreloaderController.hide(); }, 2000 );
			break;
			case 'getJson': JSONPresentationController.showJSON( JSON.stringify(DataModel.returnTreeJSON(), null , 2) ); break;
			case 'clear': PageController.clear(); break;
			case 'preferences': PropertyEditorController.showPropertyEditor( rootId ); break;
		}
	};	


	var _clearTools = function(){
		$editorContentEl.html('');
		$editorPropsEl.html('');
	};

	var loadRootData = function(){
		var toolId = rootId, rootEl = $editorContentEl[0];
		rootEl.setAttribute('data-tooltype', 'root');
		rootEl.setAttribute('id', toolId);

		//var nodeObject = { el: rootEl, toolName: 'root', toolType: TOOLTYPE_ROOT, data: {}, childrenTools: [] };
		var nodeObject = { toolName: 'root', toolType: TOOLTYPE_ROOT, data: {}, childrenTools: [] };
		DataModel.registerNode( null, toolId, nodeObject );
	};

	var clear = function(){
		_seed = 0;
		DataModel.clearAllData();
		_clearTools();
		loadRootData();
		bindRootPreferences();
	};


	return {toolDragstart: _toolDragstart, toolDragging: _toolDragging, toolDrop: _toolDrop, 
		contentClick: _contentClick, setBindings: _setBindings, propertiesClick: _propertiesClick,
		removeTool: _removeTool, menuSelect: menuSelect, bindRootPreferences: bindRootPreferences, loadRootData: loadRootData, clear: clear
	};
	
})();

var BootStrap = (function(){
	
	var _loadTools = function(){

		var tooltemplate = TemplateController.getTemplate( 'template_tools');

		for( tool in TOOLS_REGISTRY ){
			if( TOOLS_REGISTRY[tool].isVisible !== false ){
				var htm = $( tooltemplate({ name: tool, caption: TOOLS_REGISTRY[tool].caption }) );
				$editorToolsEl.append( htm );
			}
		}
		
		PageController.bindRootPreferences();

		//PreloaderController.show();
		//setTimeout( function(){ PreloaderController.hide(); }, 2000 );
	};
	
	var _loadHelpers = function(){
		var notAPropHelper = function( name, options ){
			if( (/^PROP/).test(name) ){
				return options.inverse(this);
			}else{
				return options.fn(this);
			}
		};
		var updateableHelper = function( name, dval ){
		
			var guid = this.guid || this.super.root.guid;
		
			var propertyId = guid + '_' + name;
			var retval = 'id="' + propertyId + '" ';
				retval += 'way-data="' + guid + '.' + name + '" ';
			var defaultVal = dval;
			if( (typeof dval) === (typeof {}) ){ defaultVal = ""; }
			DataModel.registerUpdateableNode( guid, name, defaultVal );
			
			return new Handlebars.SafeString( retval );
		};
		var controlHelper = function( name, dval ){
			var guid = this.guid || this.super.root.guid;
			var propertyId = guid + '_' + name;
			
			var retval = '';
			var namePrefix = name.split('_');
				namePrefix = namePrefix[1]?namePrefix[0]:null;
				
				switch( namePrefix ){
					case 'CHK': 
						retval = '<input type="checkbox" '; 
						retval += 'id="' + propertyId + '" ';
						retval += 'way-data="' + guid + '.' + name + '" ';
						retval += ' />';
					break;
					case 'TXA': 
						retval = '<textarea  '; 
						retval += 'id="' + propertyId + '" ';
						retval += 'way-data="' + guid + '.' + name + '" ';
						retval += '></textarea>';						
					break;
					default: 
						retval = '<input type="text" '; 
						retval += 'id="' + propertyId + '" ';
						retval += 'way-data="' + guid + '.' + name + '" ';
						retval += '/>';
					break;
				}

			
			var defaultVal = dval;
			if( (typeof dval) === (typeof {}) ){ defaultVal = ""; }
			DataModel.registerUpdateableNode( guid, name, defaultVal );
			return new Handlebars.SafeString( retval );
		};
		var actionHelper = function( type ){
			var retval;
			switch( type ){
				case 'edit': retval = 'data-editProperties="' + this.guid + '"'; break;
				case 'remove': retval = 'data-deleteTool="' + this.guid + '"'; break;
				case 'moveup': retval = 'data-moveToolUp="' + this.guid + '"'; break;
				case 'movedown': retval = 'data-moveToolDown="' + this.guid + '"'; break;
			}
			return new Handlebars.SafeString( retval );
		};
		var controlNameHelper = function( name ){
			var name = name.split('_');
				namePrefix = name[1]?name[0]:null;
				switch( namePrefix ){ 
					case 'CHK': case 'TXA': 
						name.splice(0,1);
						name = name.join(' ');
					break; 
					default: name = name.join(' '); break;
				}
			name = name.replace(/([A-Z])/gm, ' $1' );
			return new Handlebars.SafeString( name );
		};
		
		TemplateController.addHelper( 'updateable', updateableHelper );
		TemplateController.addHelper( 'control', controlHelper );
		TemplateController.addHelper( 'controlName', controlNameHelper );
		TemplateController.addHelper( 'action', actionHelper );
		TemplateController.addHelper( 'notAProp', notAPropHelper );
	};
	var _attachHandlers = function(){
		$editorToolsEl.on( 'dragstart', PageController.toolDragstart );
		$editorContentEl.on( 'dragover', PageController.toolDragging );
		$editorContentEl.on( 'drop', PageController.toolDrop );
		$editorContentEl.on( 'click', PageController.contentClick );
		$editorPropsEl.on( 'click', PageController.propertiesClick );
		$editorMenuOptionsEl.on('click', PageController.menuSelect );
	};

	var _init = function(){

		PreloaderController.init();
		TemplateController.init();

		$editorContentEl = $('#'+DOM_IDS.EDITOR_CONTENT);
		$editorPropertiesEl = $('#'+DOM_IDS.EDITOR_PROPERTIES);
		$editorToolsEl = $( '#'+DOM_IDS.EDITOR_TOOLS );
		$editorPropsEl = $( '#'+DOM_IDS.EDITOR_PROPERTIES );
		$editorMenuOptionsEl = $( '#'+DOM_IDS.EDITOR_MENU_OPTIONS );

		//DataModel.addToSequence( toolId, null, TOOLTYPE_ROOT );
		
		PageController.loadRootData();
		_loadHelpers();
		_loadTools();
		_attachHandlers();
	};

	return { init: _init };

})();
$(function(){ BootStrap.init(); });