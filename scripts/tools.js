var TOOLTYPE_ROOT = 'tooltype_root';
var TOOLTYPE_CONTAINER = 'tooltype_container';
var TOOLTYPE_CONTROL = 'tooltype_control';
var TOOLTYPE_UNKNOWN = 'tooltype_unknown';

var TOOLS_REGISTRY = {
	'root': { type: TOOLTYPE_ROOT, caption: 'root', isVisible: false, canContainSelf: false, defaults: { 
		'PROP_hidePlacement': true, 'PROP_hideActions': true, 
		'CHK_showProgress': 'on', 'CHK_showPageNavigation': false, 'CHK_questionPerSeperator': false 
	}},
	'page': { type: TOOLTYPE_CONTAINER, caption: 'page' },
	'button': { type: TOOLTYPE_CONTROL, caption: 'button' },
	'textbox': { type: TOOLTYPE_CONTROL, caption: 'text box' },
	'password': { type: TOOLTYPE_CONTROL, caption: 'password' },
	'label': { type: TOOLTYPE_CONTROL, caption: 'Label' },
	'textarea': { type: TOOLTYPE_CONTROL, caption: 'text area' },
	'radio': { type: TOOLTYPE_CONTROL, caption: 'radio button' },
	'checkbox': { type: TOOLTYPE_CONTROL, caption: 'check box' },
	'selectbox': { type: TOOLTYPE_CONTROL, caption: 'select box' },
	'multiselect': { type: TOOLTYPE_CONTROL, caption: 'multi select box' },
	'calendar': { type: TOOLTYPE_CONTROL, caption: 'Calendar' },
	'link': { type: TOOLTYPE_CONTROL, caption: 'web link' },
	'image': { type: TOOLTYPE_CONTROL, caption: 'image' },
	'video': { type: TOOLTYPE_CONTROL, caption: 'youtube video' },
	'seperator': { type: TOOLTYPE_CONTROL, caption: 'seperator' },
};