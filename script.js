//((?<=(.|\n))\/\/[^\n]*|\s*\n\s*)
(async _=>
    typeof __a=='undefined'?(
        // Setup global functions
        __a=0,
        g={dc:document,it:'innerText',qs:'querySelector',qsa:'querySelectorAll',ap:'append',de:'dispatchEvent',cn:'className',ael:'addEventListener',D:_=>new Date(),fl:Math.floor,wait:t=>new Promise(r=>setTimeout(r,t))},
        g.bd=g.dc.body,

        g.line=g.dc[g.qs]("#upcoming-container polyline"),
        g.evroot=g.dc[g.qs]('#game-main'),
        g.uidebug=g.dc[g.qs]('#ui-debug'),
        g.fpscnt=[...g.dc[g.qsa]('body>div')].filter(x=>!x.id&&x.style['z-index']==1e4)[0],
        // Check if the debug menu is open (and thus updating)
        g.hasdebugopen=_=>(_x=g.uidebug.style.display)&&_x!='none',
        g.ispaused=_=>g.dc[g.qs]('#game-paused').style.display=='block',
        //function that returns coords of player: [x, y]
        g.pos=_=>[(_x=g.dc[g.qs]("#ui-debug-position")[g.it].split("x"))[0],_x[1].split(" ")[2].split("z")[0]],
        //function that returns the distance travelled
        g.dist=_=>parseInt(g.dc[g.qs]('#ui-debug-node')[g.it])/100,
        g.div=_=>g.dc.createElement("div"),
        // Add 'remove by value' function to Array
        Array.prototype.remove=function(el){_x=this.indexOf(el);_x!=-1?this.splice(_x,1):0;return this},
        g.css=g.dc.head[g.qs]('link[rel="stylesheet"]').sheet,

        //-----------------------------------------------------------------
        // io handler
        // All events are caught in #game-main, unless keybind is recorded, in which case the keypresses are recorded in the settings and bubbling is prevented
        // NOTE: variables in callback function should be local to avoid overwriting global variable before callback is called
        //--------
        // keys: all keys that are pressed at the moment
        // ev: a list of all attached event listeners for each event type
        // tvisels: all elements toggled by toggle keypress
        g.io={keys:[],ev:{keydown:[],keyup:[],keypress:[],mousedown:[],mouseup:[],mouseover:[],mouseout:[],click:[]},tvisels:[]},
        // Add an event listener to the list
        g.io.add=(type,cb,tgt=null)=>g.io.ev[type].push({callback:cb,target:tgt}),
        // Fire the event for all listeners of that type (since there are some custom types, `evtype` is used to denote the type instead)
        // If target is set, the target of the event must be equal to or child of the registered target.
        g.io.fireev=(t,e)=>(e.evtype=t,g.io.ev[t].filter(x=>(x.target==null||x.target.contains(e.target))).forEach(x=>x.callback(e))),
        // Check for the keypress event (fired when a key is pressed down for the first time, until it is lifted up again)
        g.io.chkpress=(t,e)=>(in__code=e.code,in__key=g.io.keys.includes(in__code),t=='keydown'&&!in__key?(g.io.keys.push(in__code),g.io.fireev('keypress',e)):t=='keyup'&&in__key?g.io.keys.remove(in__code):0),
        // Handler for all event types; checks type and calls the respective attached callback methods
        g.io.handler=e=>(in__type=e.type,g.io.fireev(in__type,e),g.io.chkpress(in__type,e)),
        g.io.ael=(t,e,el)=>(el||g.evroot)[g.ael](t,e||g.io.handler),

        // Register all event listeners to default handler
        ['mousedown','mouseup','mouseover','mouseout','click','keydown','keyup'].forEach(x=>g.io.ael(x)),

        g.io.kydn=(e,el)=>g.io.add('keydown',e,el),
        g.io.kyup=(e,el)=>g.io.add('keyup',e,el),
        g.io.kyprs=(e,el)=>g.io.add('keypress',e,el), // Custom event different from the built-in deprecated keypress event
        
        g.io.msedn=(e,el)=>g.io.add('mousedown',e,el),
        g.io.mseup=(e,el)=>g.io.add('mouseup',e,el),
        g.io.mseov=(e,el)=>g.io.add('mouseover',e,el),
        g.io.mseout=(e,el)=>g.io.add('mouseout',e,el),
        g.io.mseclk=(e,el)=>g.io.add('click',e,el),

        // Default log function. Should be used for debug output.
        g.io.log=console.log,
        // List of attached hooks. Format: [{cb: <callback function>, enabled: <bool>},...]
        g.io.loghooks=[],
        // Attach hook. Passed value should be stored first so that the `enabled` flag can be manipulated.
        g.io.addloghook=x=>typeof x.cb==='function'?g.loghooks.push(x):g.io.log('Callback is not set. Format: {cb: <callback function>, enabled: <bool>}'),
        // Call all attached hooks with the passed arguments.
        g.io.loghook=v=>g.loghooks.forEach(x=>x.enabled?x.cb(v):0),
        // Overwrite console.log function with hook so that the output can be read. Argument array is passed to the hooks.
        console.log=function(...args){g.io.log(...args);g.loghooked?g.loghook(args):0},

        // Toggle ui
        g.io.tvis=g.io.kydn(e=>g.io.tvisels.forEach(x=>e.code===x.k?(x.el.style.display=(_s=x.el.style.display=='none')?'block':'none',x.callback&&x.callback(_s)):0)),
        g.io.addtvis=(k,el,cb=null)=>g.io.tvisels.push({k:k,el:el,callback:cb}),
        g.io.tvisall=(g.io.uivis=!0,_=>(g.io.uivis=!g.io.uivis,g.dc[g.qsa]('.mod-ui').forEach(x=>x.style.opacity=g.io.uivis?1:0))),


        // Remapping of keybinds

        // Handler for recording keybinds
        // Is attached to the settings menu and stops bubbling to prevent keystrokes from affecting the game when remapping input.
        g.io.handlerkeybind=cb=>(e=>e.stopPropagation(),cb(e.code)),
        
        g.io.startkbedit=_=>0,
        g.io.stopkbedit=_=>0,


        // Faking of events
        g.io.keyev=(t,ko={bubbles:!0})=>new KeyboardEvent(t,ko),
        g.io.mouseev=(t,ko={bubbles:!0})=>new MouseEvent(t,ko),
        // Fake keypress by pressing it for 1 ms and releasing it then
        g.io.fakekey=async(ko,el)=>(el[g.de](g.io.keyev('keydown',ko)),el[g.de](g.io.keyev('keypress',ko)),await g.wait(1),el[g.de](g.io.keyev('keyup',ko))),

        g.io.fakemseev=(t,el,ko)=>el[g.de](g.io.mouseev(t,ko)),
        // Fake all mouse event types
        g.io.fakemsedn=(el,ko)=>g.io.fakemseev('mousedown',el,ko),
        g.io.fakemseup=(el,ko)=>g.io.fakemseev('mouseup',el,ko),
        g.io.fakemseov=(el,ko)=>g.io.fakemseev('mouseover',el,ko),
        g.io.fakemselv=(el,ko)=>g.io.fakemseev('mouseleave',el,ko),
        g.io.fakemseout=(el,ko)=>g.io.fakemseev('mouseout',el,ko),
        g.io.fakemseclk=(el,ko)=>g.io.fakemseev('click',el,ko),


        //---------------------------------------------------------------------
        // Local storage management
        g.ls={ls:localStorage},
        g.ls.get=k=>JSON.parse(g.ls.ls.getItem(k)),
        g.ls.set=(k,v)=>g.ls.ls.setItem(k,JSON.stringify(v)),
        g.ls.dflt=(n,k,d)=>(g.ls.get(n)||{})[k]||d,
        g.ls.keybind=(k,d)=>g.ls.dflt('controls_keys',k,d),
        g.ls.boosttoggled=_=>g.ls.dflt('controls_keys_settings','toggleBoost',!1),

        //---------------------------------------------------------------------
        g.m_unlocked=!1,
        g.menulock=s=>g.m_unlocked=g.dc[g.qs]('#menu-bar-right').style.opacity=s?0:1,
        g.getmenu=m=>(_m=[...g.dc[g.qsa]('#menu-bar-right>.menu-item')].filter(x=>x.firstChild.src.includes(g.ui.menunames[m]))).length?_m[0]:null,
        g.getstoption=s=>(_o=[...g.dc[g.qsa]('.settings-input-list .settings-input-row')].filter(x=>x.children[0][g.it]==s)).length?_o[0].children[1]:null,
        g.openst=(m,s)=>(g.menulock(1),g.io.fakemseov(g.getmenu(m)),g.io.fakemseov(_o=g.getstoption(s)),_o),
        g.exitst=_=>(g.io.fakemsedn(g.dc[g.qs]('#input-blocker')),g.menulock(0)),
        // only works with dropdowns
        // get value of setting passed in m
        g.getst=m=>m.firstChild.nodeValue,
        // set the value of setting passed in m
        g.setst=(m,o)=>g.io.fakemsedn(m[g.qs]('.settings-input-enum_options').children[o]),



        //-----------------------------------------------------------------
        // functions responsible for managing ui in the menus
        g.ui={f:null,els:{},se:'settings-input-row mod-entry ',lbl:'settings-input-label',eo:'settings-input-enum_option'},
        // ids of all menus (part of the menu icon src)
        g.ui.menunames=['kofi','feedback','vol','controls','config','circle'],
        g.ui.inputtypes=['controls.','controls_mouse','controls_controller','all'],
        // Setup elements data structure for each menu
        g.ui.menunames.forEach(x=>(g.ui.els[x]={input:{}},g.ui.inputtypes.forEach(y=>g.ui.els[x].input[y]={tab:{all:[]}}))),

        g.ui.getmenu=m=>(_m=[...g.dc[g.qsa]('#menu-bar-right>.menu-item')].filter(x=>x.firstChild.src.includes(g.ui.menunames.includes(m)?m:g.ui.menunames[m]))).length?_m[0]:null,


        // Add component to menu under a(n optional) input type in a(n optional) tab. 
        // If an optional is not specified, it is added to all of those menu tabs (e.g. if the input type is not specified, it is added to keyboard, mouse, and controller tabs).
        // input type is a string of one of the input types specified in `g.ui.inputtypes`
        // tab is a number starting from 1, that specifies which tab it should be added to. If it is 0 or null, it is added to all tabs.
        g.ui.addcomponent=(el,m,it=null,tab=null)=>m<0||m>g.ui.menunames.length?
            (_it=g.ui.inputtypes.includes(_it)?it:'all',_m=g.ui.els[g.ui.menunames[m]],_t=_m.input[_it].tab[tab||'all'],!_t?_t=[]:0,_t.push(el))
            :g.io.log(`${m} is not a valid menu index. Failed to add element: `,el),


        // Draw elements to open menu
        // s: settings element, m: menu string, it: input type (set to null if not applicable), tab: 1-indexed number indicating tab (set to null if not applicable)
        g.ui.drawcomponent=(s,el)=>s.prepend(el),
        g.ui.drawtab=(s,it,tab)=>!tab?it.tab[tab].forEach(x=>g.ui.drawcomponent(s,x)):0,
        g.ui.drawinput=(s,m,it,tab)=>!it?(_it=m.input[it],g.ui.drawtab(s,_it,tab),g.ui.drawtab(s,_it,'all')):0,
        g.ui.draw=(s,m,it,tab)=>(_m=g.ui.els[m],g.ui.drawinput(s,_m,it,tab),g.ui.drawinput(s,_m,'all',tab)),

        // Detect currently active menu
        g.ui.handlemenu=(m,focus)=>e=>0,
        // Add event listeners for opening menu
        g.ui.menunames.forEach(m=>(e=g.ui.handlemenu,mel=g.ui.getmenu(m),g.io.mseov(e(m,!1),mel),g.io.msedn(e(m,!0),mel))),
        // Add event listener for closing menu


        g.ui.ready=s=>s.tabIndex=-1,
        g.ui.deselect=el=>(_x=el[g.cn]).includes('input-type_dropdown')||_x.includes('input-type_keybind')?('close the dropdown or stop keybind'):0,
        g.ui.focus=(s,el)=>(s.focus(),g.ui.f=el),
        g.ui.unfocus=s=>(s.blur(),g.ui.f=null),

        g.ui.add=e=>(e[g.cn]='mod-ui',g.bd[g.ap](e)),

        // change toggle to clicked state, and call callback function with either 0 or 1 given the new state (not checked if state changed)
        g.ui.toggle=(t,o,e)=>(t.children[+!o].classList.remove('bool_selected'),t.children[o].classList.add('bool_selected'),e(o)),
        // toggle collapse section (elements in section are stored in _els variable of element)
        // g.ui.collapse=(s,sc,cr)=>(_t=cr[g.it]=='-',_i=(_c=[...s.children]).indexOf(sc),_nxt=s[g.qs](`.collapsible:nth-child(n+${_i+2})`),_c.slice(_i+1,_nxt?_c.indexOf(_nxt):1e5).forEach(x=>x.style.display=_t?'none':'flex'),cr[g.it]=_t?'+':'-'),
        g.ui.collapse=(sc,crs)=>(_t=crs[g.it]=='-',sc._els.forEach(x=>x.style.display=_t?'none':'flex'),crs[g.it]=_t?'+':'-'),

        g.ui.ddopen=null,
        // Open or close dropdown
        g.ui.opendd=o=>o?(o.style.display='flex',g.ui.ddopen=o):0,
        g.ui.closedd=o=>o?(o.style.display='none',g.ui.ddopen=null):0,
        // Select option dropdown
        g.ui.ddselect=(d,o,e)=>o[g.cn]==g.ui.eo?(_o=o[g.it],d[g.it]=_o,e(_o)):0,

        // creation of ui components
        g.ui.makelbl=(l,tlt)=>((_l=g.div())[g.cn]='settings-input-label'+(tlt?' help':''),_l.title=tlt,_l[g.it]=l,_l),
        
        g.ui.makebttn=(s,l,e,tlt='')=>{var _el=g.div();_el[g.cn]=g.ui.se+'input-type_bttn'+(tlt?' help':'');_el.title=tlt;_el[g.it]=l;g.io.mseclk(e,_el);s.prepend(_el);return _el},

        g.ui.makekeybind=(s,l,d,tlt='')=>{var _e=g.div();_e[g.cn]=g.ui.se;var _l=g.ui.makelbl(l,tlt);var _c=g.div();_c[g.cn]='settings-input-signal-clear';_c[g.it]='x';var _i=g.div();_i[g.cn]='settings-input-signal';_i.title='Click to remap';_i[g.it]=v;
            g.km.aelclear(_c,_l,_i),g.km.aelbeginedit(s,_l,_i),g.km.aeledit(_i),_e[g.ap](_l,_c,_i),s.prepend(_e);return _e},
        
        g.ui.maketoggle=(s,l,o1,o2,d,e,tlt='')=>{var _el=g.div();_el[g.cn]=g.ui.se+'input-type_toggle';_l=g.ui.makelbl(l,tlt);var _t=g.div();_t[g.cn]='settings-input-bool';
            var _o1=g.div();var _o2=g.div();_o1[g.cn]=_o2[g.cn]='settings-input-bool_option';_o1[g.it]=o1;_o2[g.it]=o2,(d?_o2:_o1).classList.add('bool_selected');
            g.io.msedn((_=>g.ui.toggle(_t,0,e)),_o1);g.io.msedn(_=>g.ui.toggle(_t,1,e),_o2);_t[g.ap](_o1,_o2),_el[g.ap](_l,_t);s.prepend(_el);return _el},
        
        g.ui.makedropdown=(s,l,o,d,e,tlt='')=>{var _el=g.div();_el[g.cn]=g.ui.se+'input-type_dropdown';_l=g.ui.makelbl(l,tlt);var _e=g.div();_e[g.cn]='settings-input-enum';_e[g.it]=o[d];
            var _a=g.div();_a[g.cn]='settings-input-enum_arrow';_a[g.it]='▾';_e[g.ap](_a);var _o=g.div();_o[g.cn]='settings-input-enum_options';_o.style.display='none';g.io.msedn(e1=>g.ui.ddselect(_e,e1.target,e),_o);
            _op=o.forEach(x=>((__o=g.div())[g.cn]=g.ui.eo,__o[g.it]=x));_o[g.ap](..._op);g.io.mseov(_=>g.ui.opendd(_o),_e);g.io.mseout(_=>g.ui.closedd(_o),_e);s.prepend(_el);return _el},

        g.ui.makesection=(s,l,els)=>{var _el=g.div();_el[g.cn]=g.ui.se+'settings-input-list_section collapsible input-type_section';var _t=g.div();_t[g.cn]='collapsible-title';_t[g.it]=l;var _c=g.div();_c[g.cn]='collapsible-cross';
            g.io.mseclk(_=>g.ui.collapse(_el,_c),_el);_c[g.it]='-';_el._els=els;_el[g.ap](_t,_c);s.prepend(_el);return _el},
        
        g.ui.makeslider=(s,l,mn,mx,d,e,tlt='')=>{},

        // add styling ui
        g.css.insertRule('.mod-entry.input-type_bttn:hover{background:#3b3b3b;}'),
        g.css.insertRule('.mod-entry.input-type_bttn{display:flex;align-items:center;justify-content:center;}'),

        //-------------------------------------------------------------------

        // Set up settings UI for mod
        // g.st={opt:[]},
        // g.st.menu=g.getmenu(3),
        // g.st.add=(n,o,d)=>0,
        // g.st.makesection=(s,n)=>((_d=g.div())[g.cn]=g.ui.se+' settings-input-list_section collapsible',(_t=g.div())[g.cn]='collapsible-title',_t[g.it]=n,(_c=g.div())[g.cn]='collapsible-cross',_c[g.it]='-',_d[g.ap](_t),_d[g.ap](_c),s.prepend(_d),_d),
        // g.st.makeentry=(s,n,o,d)=>((_d=g.div())[g.cn]=g.ui.se,s.prepend(_d),_d),
        // g.st.draw=_=>(_s=g.dc[g.qs]('.settings-input-list')),
        
        // Set up keybinds settings for mod
        // instead save when settings change + reset button
        // g.ls.set('modkeybinds',g.km.b),
        g.km={lsname:'modkeybinds',default:{'Road Time Display':'Digit1','Drive Switch Display':'Digit2','Switch Drive':'KeyO','Boost Display':'Digit3','Debug':'F2'}},
        (g.km.todefault=_=>g.km.b=g.ls.get(g.km.lsname)||(_x={},Object.entries(g.km.default).forEach(x=>_x[x[0]]=x[1]),_x))(),
        // The order that the properties are displayed in the settings (reversed because it is added in reverse order)
        g.km.order=['Road Time Display','Drive Switch Display','Boost Display','Switch Drive','Debug'].reverse(),
        // Select the keybinds menu icon
        g.km.menu=g.getmenu(3),
        // Set a keybind and sync to local storage
        g.km.setkey=(k,v)=>(g.km.b[k]=v,g.ls.set(g.km.lsname,g.km.b)),
        // stores the label and field of the field being edited
        g.km.ed=['',null],
        g.km.stopedit=_=>(_l=g.km.ed[0])!=''?((_f=g.km.ed[1])[g.it]=g.km.b[_l],_f.classList.remove('settings-input-signal-reset'),g.km.ed=['',null]):0,
        // Start editing the selected field; if the field was already being edited, stop editing instead. If another field is already being edited, stop editing that first.
        g.km.beginedit=(s,l,f)=>g.km.ed[0]!=l[g.it]?(g.km.stopedit(),f[g.it]='press any key...',f.classList.add('settings-input-signal-reset'),s.focus(),g.km.ed=[l[g.it],f]):g.km.stopedit(),
        g.km.aelbeginedit=(s,l,f)=>g.io.msedn(_=>g.km.beginedit(s,l,f),f),
        g.km.edit=e=>g.km.ed[1]?(g.io.log(e.code),g.km.setkey(e.code),g.km.ed[1][g.it]=e.code,g.km.stopedit()):0,
        g.km.aeledit=f=>f[g.ael]('keydown',g.km.edit),
        // Add listener for clear button
        g.km.aelclear=(c,l,f)=>g.io.msedn(_=>(g.km.stopedit(),f[g.it]='',g.km.setkey(l[g.it],'')),c),
        // Create entry with a name and value, and prepend to settings
        g.km.makeentry=(s,n,v)=>((_e=g.div())[g.cn]=g.ui.se,(_l=g.div())[g.cn]='settings-input-label',_l[g.it]=n,(_c=g.div())[g.cn]='settings-input-signal-clear',_c[g.it]='x',(_i=g.div())[g.cn]='settings-input-signal',_i.title='Click to remap',_i[g.it]=v,
            g.km.aelclear(_c,_l,_i),g.km.aelbeginedit(s,_l,_i),g.km.aeledit(_i),_e[g.ap](_l,_c,_i),s.prepend(_e),_e),
        // Reset all keybinds to default values and delete the local storage entry
        g.km.reset=_=>(g.km.stopedit(),g.km.todefault(),g.dc[g.qsa]('.settings-input-row.mod-entry .settings-input-signal').forEach((x,i)=>x[g.it]=g.km.default[g.km.order[g.km.order.length-i-1]]),g.ls.removeItem(g.km.lsname)),
        // Create reset button, and prepend to settings
        g.km.resetbttn=s=>((_e=g.div())[g.cn]=g.ui.se,_e.id='resetbttn',_e[g.it]='Reset mod keybinds',g.io.msedn(_=>g.km.reset(),_e),s.prepend(_e),_e),
        // TODO add event listeners
        // Draw all keybind options for the mod
        g.km.draw=_=>(_s=g.dc[g.qs]('.settings-input-list'),_s.tabIndex=-1,_r=g.km.resetbttn(_s),g.km.order.forEach(x=>g.km.makeentry(_s,x,g.km.default[x])),0),

        // Add event listeners to test for opening keybinds menu and swapping of tabs
        //
        // Check if in both the correct tab and the correct input type (keyboard), and check if the elements aren't already present
        // Also add an event listener to the tab and input type switch while the menu is open
        g.km.chkupdate=async _=>(await g.wait(10),(_o=g.bd[g.qs]('.settings-sidebar_options'))&&g.io.msedn(g.km.chkupdate,_o),(_t=g.bd[g.qs]('.settings-sidebar_tabs'))&&g.io.msedn(g.km.chkupdate,_t),
            g.dc[g.qs]('.settings-sidebar_tab.option-selected:first-child')&&g.dc[g.qs]('.settings-sidebar_option.option-selected:first-child')&&!g.dc[g.qs]('#resetbttn')?g.km.draw():0),
        g.io.msedn(g.km.chkupdate,g.km.menu),
        g.io.mseov(g.km.chkupdate,g.km.menu),


        //open and hide debug menus
        g.hasdebugopen()?g.f3open=!0:(await g.io.fakekey({"code":g.ls.keybind('ToggleDebug','F3')},g.evroot),g.uidebug.style.opacity=0,g.fpscnt.style.opacity=0,g.f3open=!1),
        
        // Add proxy F3 menu key (F2)
        g.io.kydn(e=>e.code===g.km.b['Debug']?(g.uidebug.style.opacity=g.fpscnt.style.opacity=(g.f3open=!g.f3open)?1:0):0),

        // Toggle ui visibility when pressing hide/show ui button (default: U)
        g.io.kyprs(e=>e.code==g.ls.keybind('ToggleUI','KeyU')?g.io.tvisall():0),

        // Display hidden ms counter
        g.fpscnt.children[1].style.display='block',

        // Prevent text selection on debug menu
        g.css.insertRule('#ui-debug{-webkit-user-select:none;-ms-user-select:none;user-select:none;}'),

        // Add ui for error messages
        g.style='display:none;position:absolute;z-index:999;backdrop-filter:blur(10px);background:#66666666;color:white;',
        (g.errdiv=g.div()).style=g.style+'left:0;top:50%;max-width:300px;padding:5px',
        g.ui.add(g.errdiv),
        g.errtocode=0,
        // Function that displays an error for a certain time  (or until another error overrides it)
        g.err=(e,t=1500)=>(clearTimeout(g.errtocode),g.errdiv[g.it]=e,g.errdiv.style.display='block',g.errtocode=setTimeout(_=>g.errdiv.style.display='none',t)),

        // wait a hot second to let engine catch up (otherwise the F3 menu isn't open yet)
        await g.wait(1000),

        //------------------------------------------------------------------------------------
        // ROADTIME
        rt={sd:g.D(),ds:g.dist(),lsn_hs:'modrt_hs',lsn_hsdist:'modrt_hsdist',reset:0,started:!1,paused:!1,hidden:!0,saveddist:0,savedtime:0},
        rt.hs=g.ls.get(rt.lsn_hs)||0,
        rt.hsdist=g.ls.get(rt.lsn_hsdist)||0,


        rt.formattime=v=>v?`${(v-=(_hh=g.fl(v/36e5))*36e5),_hh}:${(v-=(_m=g.fl(v/6e4))*6e4),('0'+_m).slice(-2)}:${('0'+g.fl(v/1e3)).slice(-2)}`:'-',
        rt.formatdist=v=>v?v.toFixed(2)+'km':'-',

        // Set up UI roadtime
        (rt.ui=g.div()).style=g.style+'left:50%;top:0;width:300px',
        // create div and add to container
        _ad=_=>(_x=g.div(),_x.style='padding:5px',rt.ui[g.ap](_x),_x),
        rt.tdiv=_ad(),
        rt.ddiv=_ad(),
        (rt.hsdiv=_ad())[g.it]=`Highscore time: ${rt.formattime(rt.hs)}`,
        (rt.dhsdiv=_ad())[g.it]=`Highscore distance: ${rt.formatdist(rt.hsdist)}`,
        g.ui.add(rt.ui),

        // Start loop roadtime
        setInterval(_=>(
            // check if ui is hidden
            rt.hidden?0:(
                // check if debug menu is open
                !g.hasdebugopen()?g.err(`Debug menu needs to be open for the script to properly work. Please press ${g.ls.keybind('ToggleDebug','F3')} once to open it. You can toggle the visibility with ${g.km.b['Debug']}.`)
                :(
                    // calculate distance to road line
                    _p=g.pos(),
                    _r=g.line.points,
                    _a=-_r[0].y+_r[1].y,
                    _b=_r[0].x-_r[1].x,
                    _d=Math.abs(_a*_p[0]+_b*_p[1]-_a*_r[0].x-_b*_r[0].y)/Math.sqrt(_a*_a+_b*_b),
                    // Calculate distance and time on road
                    _dist=rt.saveddist+Math.round((g.dist()-rt.ds)*100)/100,
                    _sc=g.D()-rt.sd+rt.savedtime,
                    // Save the distance and time on pause, and keep dist+time frozen during pause
                    g.ispaused()?(!rt.paused?(rt.saveddist=_dist,rt.savedtime=_sc,rt.paused=!0):0,rt.sd=g.D(),rt.ds=g.dist(),_dist=rt.saveddist,_sc=rt.savedtime):rt.paused=!1,
                    // format time and distance in printable format
                    _fs=rt.formattime(_sc),
                    _fd=rt.formatdist(_dist),
                    // write output
                    rt.reset||_d>3.2||!rt.started
                        ?(rt.sd=g.D(),rt.ds=g.dist(),rt.saveddist=0,rt.savedtime=0,rt.ddiv[g.it]='Distance: -',rt.tdiv[g.it]=rt.reset||!rt.started?(rt.reset=0,"RESETTING... Start driving to begin the timer."):"OFF ROAD")
                        :(rt.tdiv[g.it]=`Time on road: ${_fs}`,rt.ddiv[g.it]=`Distance: ${_fd}`,
                        _sc>rt.hs?(rt.hs=_sc,rt.hsdiv[g.it]=`Highscore time: ${_fs}`,g.ls.set(rt.lsn_hs,_sc)):0,
                        _dist>rt.hsdist?(rt.hsdist=_dist,rt.dhsdiv[g.it]=`Highscore distance: ${_fd}`,g.ls.set(rt.lsn_hsdist,_dist)):0)
        ))),16), //16 = 1000/60fps
        // catch the reset key press, and driving keys
        g.io.kydn(e=>(rt.reset=e.code===g.ls.keybind('Reset','KeyR'))?rt.started=!1:['ArrowUp','ArrowDown',g.ls.keybind('Forward','KeyW'),g.ls.keybind('Backward','KeyS')].includes(e.code)?rt.started=!0:0),
        // toggle visibility of ui with '1' key
        g.io.addtvis(g.km.b['Road Time Display'],rt.ui,s=>(rt.hidden=!s,rt.started=!1)),

        //---------------------------------------------------------------------------------
        // WHEEL DRIVE SWITCHER
        wd={wdst:'Drive Mode'},

        wd.parse=s=>s.includes('All')?0:s.includes('Front')?1:2,
        wd.getstate=_=>(_s=wd.parse(g.getst(g.openst(4,wd.wdst))),g.exitst(),_s),
        wd.switchstate=_=>(_s=g.getst(_x=g.openst(4,wd.wdst)),g.setst(_x,_v=_s.includes('All')?1:0),g.exitst(),_v),
        wd.disp=x=>!x?'AWD':x==1?'FWD':'RWD',
        wd.update=s=>wd.wddiv[g.it]=wd.disp(s),

        // add event listener when menu is opened
        wd.menu=g.getmenu(4),
        // wd.updatelistener=async _=>g.m_unlocked?(await g.wait(100),(wd.entry=g.getstoption(wd.wdst))&&wd.entry[g.ael](
        //     'mousedown',async _=>(await g.wait(10),wd.update(wd.parse(g.getst(wd.entry))))
        // )):0,
        wd.updatelistener=async _=>g.m_unlocked?(await g.wait(100),(wd.entry=g.getstoption(wd.wdst))&&g.io.msedn(async _=>(await g.wait(10),wd.update(wd.parse(g.getst(wd.entry)))),wd.entry)):0,
        g.io.msedn(wd.updatelistener,wd.menu),
        g.io.mseov(wd.updatelistener,wd.menu),

        // Set up UI wheel drive
        (wd.ui=g.div()).style=g.style+'top:0;right:80px',
        (wd.wddiv=g.div()).style='padding:5px',
        wd.wddiv[g.it]=wd.disp(wd.getstate()),
        wd.ui[g.ap](wd.wddiv),
        g.bd[g.ap](wd.ui),
        g.ui.add(wd.ui),

        // toggle between awd and fwd
        g.io.kydn(e=>e.code==g.km.b['Switch Drive']?wd.update(wd.switchstate()):0),

        g.io.addtvis(g.km.b['Drive Switch Display'],wd.ui),

        //----------------------------------------------------------------------------------
        // BOOST STATE DISPLAY
        bs={state:!1,kydn:!1,tmode:!1},
        (bs.ui=g.div()).style=g.style+'top:0;right:115px;padding:5px',
        g.ui.add(bs.ui),
        bs.ui[g.it]='BOOST OFF',

        g.io.kydn(e=>((_m=g.ls.boosttoggled())!=bs.tmode?(bs.state=!1,bs.tmode=_m):0,e.code==g.ls.keybind('Boost','ShiftLeft')?_m?!bs.kydn?bs.ui[g.it]=(bs.kydn=!0,bs.state=!bs.state)?'BOOST ON':'BOOST OFF':0:bs.ui[g.it]='BOOST ON':0)),
        g.io.kyup(e=>e.code==g.ls.keybind('Boost','ShiftLeft')?g.ls.boosttoggled()?bs.kydn=!1:bs.ui[g.it]='BOOST OFF':0),
        // g.io.kydn(e=>e.code===g.ls.keybind('Reset','KeyR')&&bs.tmode?(bs.state=!1,bs.div[g.it]='BOOST OFF'):0),

        g.io.addtvis(g.km.b['Boost Display'],bs.ui),

        await g.wait(100),
        g.err('SCRIPT READY',2e3)
        
):undefined)()