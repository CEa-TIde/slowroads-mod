// FOR CONSOLE:
let url = "https://raw.githubusercontent.com/CEa-TIde/slowroads-mod/refs/heads/main/sr2_dash/script.js";
window.fetch(url).then(response => response.text()).then(textScript => textScript.eval());


// FOR BOOKMARKLET:
javascript:window.fetch("https://raw.githubusercontent.com/CEa-TIde/slowroads-mod/refs/heads/main/sr2_dash/script.js").then(response=>response.text()).then(textScript=>eval(textScript))




// for dev use only (uses latest commit in dev branch instead):
let devurl = "https://raw.githubusercontent.com/CEa-TIde/slowroads-mod/refs/heads/dev/sr2_dash/script.js";
window.fetch(devurl).then(response => response.text()).then(textScript => textScript.eval());