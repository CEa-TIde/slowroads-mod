// would be nice to have it as a module, but that is not possible :<

// __IMPORT_DIRNAME__: the base directory from which to import everything. This should be defined in the bookmark.js scripts, before the eval call.
// DON'T: __IMPORT_[capitalised module name]__: is set and checked when imported, to avoid a double import of the same module. Ex. __IMPORT_INPUTHANDLER__

console.log('importing script.js');

if (typeof importModule === 'undefined') {
    /**
     * Fetch the script from the URL, and parse it using eval.
     * This is a workaround for ES6 modules not being allowed.
     * @param {String} filePath file path relative from __IMPORT_DIRNAME__ (base path)
     */
    importModule = async function(filePath) {
        window.fetch(new URL(filePath, __IMPORT_DIRNAME__)).then(response => response.text()).then(script => eval(script));
    }
}

// import all modules
await importModule('storageHandler.js');
await importModule('inputHandler.js');
await importModule('uiHandler.js');




// return packed object so these variables can be used outside the eval() for debugging
new function() {
    this.UIHandler = UIHandler;
    this.InputHandler = InputHandler;
    this.StorageHandler = StorageHandler;
}
