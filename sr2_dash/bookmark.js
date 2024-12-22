// FOR CONSOLE:
let url = "https://raw.githubusercontent.com/CEa-TIde/slowroads-mod/refs/heads/main/sr2_dash/script.js";
window.fetch(url).then(response => response.text()).then(textScript => eval(textScript));


// FOR BOOKMARKLET:
javascript:window.fetch("https://raw.githubusercontent.com/CEa-TIde/slowroads-mod/refs/heads/main/sr2_dash/script.js").then(response=>response.text()).then(textScript=>eval(textScript))




// for dev use only (uses latest commit in dev branch instead):
let devurl = "https://raw.githubusercontent.com/CEa-TIde/slowroads-mod/refs/heads/dev/sr2_dash/script.js";
window.fetch(devurl).then(response => response.text()).then(textScript => eval(textScript));
//or
javascript:window.fetch("https://raw.githubusercontent.com/CEa-TIde/slowroads-mod/refs/heads/dev/sr2_dash/script.js").then(response=>response.text()).then(textScript=>eval(textScript))

// new dev
__IMPORT_DIRNAME__="https://raw.githubusercontent.com/CEa-TIde/slowroads-mod/refs/heads/dev/sr2_dash/";fetch(new URL('script.js',__IMPORT_DIRNAME__)).then(r=>r.text()).then(script=>eval(script))