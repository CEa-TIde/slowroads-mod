// would be nice to have it as a module, but that is not possible :<

// __IMPORT_DIRNAME__: the base directory from which to import everything. This should be defined in the bookmark.js scripts, before the eval call.
// DON'T: __IMPORT_[capitalised module name]__: is set and checked when imported, to avoid a double import of the same module. Ex. __IMPORT_INPUTHANDLER__

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

// __IMPORT_DIRNAME__ = "https://raw.githubusercontent.com/CEa-TIde/slowroads-mod/refs/heads/dev/sr2_dash/";
// importModule = async function(script) {
//   return new Promise(resolve=>resolve(eval(script)));
// };

// script1 = `console.log('script1'); var script1Var = 1; script1Var;`;
// script2 = `console.log('script2'); var script2Var = 2; script2Var;`;
// script3 = `console.log('script3'); var script3Var = 3; script3Var;`;

// importModule(script1).then(
//     script1Var => {
//         console.log(script1Var);
//         importModule(script2).then(
//             script2Var => {
//                 console.log(script1Var, script2Var);
//                 importModule(script3).then(
//                     script3Var => {
//                         console.log(script1Var, script2Var, script3Var);
                        
//                         callback();
//                     }
//                 )
//             }
//         )
//     }
// );

// function main() {
//     console.log("main", script1Var, script2Var, script3Var);
// }

// y = await importModule(script1).then(v1=>{
// 	console.log(v1);
// 	return importModule(script2).then(v2=>{
// 		console.log(v2);
// 		console.log(v1);
// 		return new function(){this.v1=v1;this.v2=v2;};
// 	});
// });

// y = await importModule(script1).then(v1=>{
// 	console.log(v1);
// 	return importModule(script2).then(v2=>{
// 		console.log(v2);
// 		console.log(v1);
// 		return new function(){this.v1=v1;this.v2=v2;};
// 	});
// });

// import all modules
// each .then() call adds the return value of eval to the scope
// the main function is called with all dependencies in bound to `this`
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

// importModule('storageHandler.js').then(
//     StorageHandler => importModule('inputHandler.js')
// ).then(
//     _ => importModule('uiHandler.js')
// ).then(
//     // return packed object so these variables can be used outside the eval() for debugging
//     _ => new function() {
//         // TODO: UI Handler not in scope; what to do? First test in smaller setting
//         this.UIHandler = UIHandler;
//         this.InputHandler = InputHandler;
//         this.StorageHandler = StorageHandler;
//     }
// )
// // await importModule('inputHandler.js');
// // await importModule('uiHandler.js');

// called with all imports in scope
function main() {
    console.log(this.StorageHandler);
    console.log(this.InputHandler);
    console.log(this.UIHandler);
}





