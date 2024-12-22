// would be nice to have it as a module, but that is not possible :<

// __IMPORT_DIRNAME__: the base directory from which to import everything. This should be defined in the bookmark.js scripts, before the eval call.

console.log('importing script.js');

// TODO: for now dev by default if not defined; if it is working change to main
if (typeof __IMPORT_DIRNAME__ === 'undefined') {
    __IMPORT_DIRNAME__ = "https://raw.githubusercontent.com/CEa-TIde/slowroads-mod/refs/heads/dev/sr2_dash/";
}

if (typeof importModule === 'undefined') {
    /**
     * Fetch the script from the URL, and parse it using eval.
     * This is a workaround for ES6 modules not being allowed.
     * @param {String} filePath file path relative from __IMPORT_DIRNAME__ (base path)
     */
    importModule = async function(filePath) {
        return window.fetch(new URL(filePath, __IMPORT_DIRNAME__)).then(response => response.text()).then(script => eval(script));
    }
}

// import all modules
// This is a workaround for ES6 modules not being allowed.
// each .then() call adds the return value of eval to the scope
// the main function is called with all dependencies bound to `this`
// NOTE: cyclic dependencies are not possible. AVOID. Make sure the modules are imported in the correct order.
importModule('storageHandler.js').then(
    StorageHandler => importModule('inputHandler.js').then(
        InputHandler => importModule('uiHandler.js').then(
            UIHandler => main.call({
                StorageHandler: StorageHandler,
                InputHandler: InputHandler,
                UIHandler: UIHandler,
            })
        )
    )
);

// called with all imports in `this` bind.
function main() {
    const StorageHandler = this.StorageHandler;
    const InputHandler = this.InputHandler;
    const UIHandler = this.UIHandler;

    UIHandler.init();

    let inputUIBox = new UIHandler.inputUIBox(document.body, "0", "20px");
    console.log(inputUIBox);

}





