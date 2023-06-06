//((?<=(.|\n))\/\/[^\n]*|\s*\n\s*)
(async _=>
    typeof __a=='undefined'?(
        // Setup global functions
        __a=0,
        g={dc:document,it:'innerText',qs:'querySelector',qsa:'querySelectorAll',ap:'append',de:'dispatchEvent',cn:'className',ael:'addEventListener',hdit:'hidden-item',D:_=>new Date(),fl:Math.floor,wait:t=>new Promise(r=>setTimeout(r,t))},
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
        g.io={keys:[],ev:{},tvisels:[]},
        // Add an event listener to the list (type is added if not already present)
        g.io.add=(type,cb,tgt=null,persistent=false)=>typeof cb!=='function'?console.error('callback specified is not a function: ',cb):(!g.io.ev[type]?g.io.ev[type]=[]:0,g.io.ev[type].push({callback:cb,target:tgt,persistent:persistent})),
        // Fire the event for all listeners of that type (since there are some custom types, `evtype` is used to denote the type instead)
        // If target is set, the target of the event must be equal to or child of the registered target.
        // Also checks if the targets still exist in DOM, and if not remove them from the event list (to prevent mem leak)
        g.io.fireev=(t,e)=>(e.evtype=t,_del=[],g.io.ev[t]?.filter(x=>(x.target!=null&&!g.dc.contains(x.target)&&!x.persistent?_del.push(x):0,x.target==null||x.target.contains(e.target))).forEach(x=>x.callback(e)),_del.forEach(x=>g.io.ev[t].remove(x))),
        // Check for the keypress event (fired when a key is pressed down for the first time, until it is lifted up again)
        g.io.chkpress=(t,e)=>(in__code=e.code,in__key=g.io.keys.includes(in__code),t=='keydown'&&!in__key?(g.io.keys.push(in__code),g.io.fireev('keypress',e)):t=='keyup'&&in__key?g.io.keys.remove(in__code):0),
        // Handler for all event types; checks type and calls the respective attached callback methods
        g.io.handler=e=>(in__type=e.type,g.io.fireev(in__type,e),g.io.chkpress(in__type,e)),
        g.io.ael=(t,e,el)=>(el||g.evroot)[g.ael](t,e||g.io.handler),

        // Register all event listeners to default handler
        ['mousedown','mouseup','mouseover',/*'mouseleave',*/'mouseout','click','keydown','keyup'].forEach(x=>g.io.ael(x)),

        g.io.kydn=(e,el,p)=>g.io.add('keydown',e,el,p),
        g.io.kyup=(e,el,p)=>g.io.add('keyup',e,el,p),
        g.io.kyprs=(e,el,p)=>g.io.add('keypress',e,el,p), // Custom event different from the built-in deprecated keypress event 
        
        g.io.msedn=(e,el,p)=>g.io.add('mousedown',e,el,p),
        g.io.mseup=(e,el,p)=>g.io.add('mouseup',e,el,p),
        g.io.mseov=(e,el,p)=>g.io.add('mouseover',e,el,p),
        g.io.mselv=(e,el)=>g.io.ael('mouseleave',e,el), // special case: Event is not handled by event handler but cb is directly called.
        g.io.mseout=(e,el,p)=>g.io.add('mouseout',e,el,p),
        g.io.mseclk=(e,el,p)=>g.io.add('click',e,el,p),

        // Default log function. Should be used for debug output.
        g.io.log=console.log,
        // List of attached hooks. Format: [{cb: <callback function>, enabled: <bool>},...]
        g.io.loghooks=[],
        // Attach hook. Passed value should be stored first so that the `enabled` flag can be manipulated.
        g.io.addloghook=x=>typeof x.cb==='function'?g.loghooks.push(x):g.io.log('Callback is not set. Format: {cb: <callback function>, enabled: <bool>}'),
        // Call all attached hooks with the passed arguments.
        g.io.loghook=v=>g.loghooks.forEach(x=>x.enabled?x.cb(v):0),
        // Overwrite console.log function with hook so that the output can be read. Argument array is passed to the hooks.
        console.log=function(...args){g.io.log(...args);g.io.loghook(args)},

        // Toggle ui
        g.io.tvis=g.io.kydn(e=>g.io.tvisels.forEach(x=>e.code===x.k?(x.el.style.display=(_s=x.el.style.display=='none')?'block':'none',x.callback&&x.callback(_s)):0)),
        g.io.addtvis=(k,el,cb=null)=>g.io.tvisels.push({k:k,el:el,callback:cb}),
        g.io.uivis=!0,
        g.io.tvisall=_=>(g.io.uivis=!g.io.uivis,g.dc[g.qsa]('.mod-ui').forEach(x=>g.io.uivis?x.classList.remove(g.hdit):x.classList.add(g.hdit))),


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
        g.io.fakekey=async(el,ko)=>(el[g.de](g.io.keyev('keydown',ko)),el[g.de](g.io.keyev('keypress',ko)),await g.wait(1),el[g.de](g.io.keyev('keyup',ko))),

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
        g.ls.del=k=>g.ls.ls.removeItem(k),
        // Get value from key object in ls, or default if doesn't exist. Should only be used for objects containing keys, not single-value variables; use g.ls.get then instead.
        g.ls.getwdflt=(n,k,d)=>(_v=(g.ls.get(n)||{})[k])!==undefined?_v:d,
        // Set value of  key object in ls. Object is created if it didn't exist yet.
        g.ls.setkey=(n,k,v)=>(_s=g.ls.get(n)||{},_s[k]=v,g.ls.set(n,_s)),
        g.ls.keybind=(k,d)=>g.ls.getwdflt('controls_keys',k,d),
        g.ls.boosttoggled=_=>g.ls.getwdflt('controls_keys_settings','toggleBoost',!1),

        //---------------------------------------------------------------------
        g.m_unlocked=!1,
        g.menulock=s=>g.m_unlocked=g.dc[g.qs]('#menu-bar-right').style.opacity=s?0:1,
        // x=>x[g.qs]('settings-input-label')?.innerText==s
        g.getstoption=s=>(_o=[...g.dc[g.qsa]('.settings-input-list .settings-input-row')].filter(x=>x.children[0][g.it]==s)).length?_o[0].children[1]:null,
        g.openst=(m,s)=>(g.menulock(1),g.io.fakemseov(g.ui.geticon(m)),_o=g.getstoption(s),g.io.fakemseov(_o),_o),
        g.exitst=_=>(g.io.fakemsedn(g.dc[g.qs]('#input-blocker')),g.menulock(0)),
        // only works with dropdowns
        // get value of setting passed in m
        g.getst=m=>m.firstChild.nodeValue,
        // set the value of setting passed in m
        g.setst=(m,o)=>g.io.fakemsedn(m[g.qs]('.settings-input-enum_options').children[o]),



        //-----------------------------------------------------------------
        // functions responsible for managing ui in the menus
        g.ui={f:null,elslst:{},els:{},uid:0,lsn_ststates:'mod_ststates',se:'settings-input-row mod-entry ',lbl:'settings-input-label',eo:'settings-input-enum_option',menubar:g.dc[g.qs]('#menu-bar')},
        // ids of all menu icons (part of the menu icon src). Divider is a special case for the divide line.
        g.ui.iconnames=['kofi','feedback','vol','controls','config','divider','circle'],
        // all ids of icon that have a menu attached to it.
        g.ui.menunames=['controls','config'],
        // ids of input types (part of the icon src)
        g.ui.inputtypes=['controls','controls_mouse_icon','controls_controller','all'],
        // Setup elements data structure for each menu
        g.ui.iconnames.forEach(x=>(g.ui.els[x]={input:{}},g.ui.inputtypes.forEach(y=>g.ui.els[x].input[y]={tab:{all:[]}}))),

        g.ui.geticon=m=>m=='divider'?g.dc[g.qs]('#menu-bar-right>.menu-bar-vertical-divider'):(_m=[...g.dc[g.qsa]('#menu-bar-right>.menu-item')].filter(x=>g.ui.iconnames.includes(m)&&x.firstChild.src.includes(m))).length?_m[0]:null,
        g.ui.settinglist=_=>g.dc[g.qs]('#menu-bar-right>.settings-input-list'),


        // Add component to menu under a(n optional) input type in a(n optional) tab. 
        // If an optional is not specified, it is added to all of those menu tabs (e.g. if the input type is not specified, it is added to keyboard, mouse, and controller tabs).
        // input type is a string of one of the input types specified in `g.ui.inputtypes`
        // tab is a number starting from 1, that specifies which tab it should be added to. If it is 0 or null, it is added to all tabs.
        // Each element is also assigned a UID so that the state can be loaded from/saved in localstorage. It is incremented with each added element. Only this id is stored in this structure, so that it can be added to multiple tabs.
        g.ui.addcomponent=(el,m,it=null,tab=null)=>g.ui.menunames.includes(m)?
            (_it=g.ui.inputtypes.includes(it)?it:'all',_m=g.ui.els[m],_tab=tab||'all',_t=_m.input[_it].tab,!_t[_tab]?_t[_tab]=[]:0,_t[_tab].push(el.__id))
            :g.io.log(`${m} is not a valid menu id; the icon needs to have an associated menu. All valid ids are listed in 'g.ui.menunames'. Failed to add element: `,el),

        
        // Get state from ls value and update value of element to stored state
        g.ui.getlsstate=(id,d)=>(_v=g.ls.getwdflt(g.ui.lsn_ststates,id,d),_v),
        // Save state to ls
        g.ui.setlsstate=(id,v)=>g.ls.setkey(g.ui.lsn_ststates,id,v),


        // Draw elements to open menu
        // s: settings element, m: menu string, it: input type (set to null if not applicable), tab: 1-indexed number indicating tab (set to null if not applicable)
        g.ui.drawcomponent=(s,el)=>s.prepend(el),
        g.ui.drawtab=(s,it,tab)=>tab?(it.tab[tab]?.forEach(x=>g.ui.drawcomponent(s,g.ui.elslst[x]))):0,
        g.ui.drawinput=(s,m,it,tab)=>it?(_it=m.input[it],g.ui.drawtab(s,_it,tab),g.ui.drawtab(s,_it,'all')):0,
        g.ui.draw=(s,m,it,tab)=>(_m=g.ui.els[m],g.ui.drawinput(s,_m,it,tab),g.ui.drawinput(s,_m,'all',tab)),

        // Get name of current input type or null if not present (name is part of the img src, file name up to the first dot)
        g.ui.getinputtype=s=>(_it=s[g.qs]('.settings-sidebar_option.option-selected'),_it?_it.firstChild.src.split('/media/')[1].split('.')[0]:null),
        // Get name of current tab or null if not present
        g.ui.gettab=s=>(_tab=s[g.qs]('.settings-sidebar_tab.option-selected'))?_tab.innerText:null,
        g.ui.drawcurrent=(ss,m)=>ss?(_it=g.ui.getinputtype(ss),_tab=g.ui.gettab(ss),_s=ss[g.qs]('.settings-input-list'),g.io.log('drawing ',m,'... it: ',_it,' tab: ',_tab,_s),_s?g.ui.draw(_s,m,_it,_tab):0):0,
        g.ui.drawmenu=m=>g.ui.drawcurrent(g.dc[g.qs]('.settings-sidebar'),m),


        g.ui.settingfocused=!1,
        g.ui.currmenuicon=null,
        // Return focus if keybind was being edited and close menu
        g.ui.closemenu=(clk=!0,t=null)=>g.ui.currmenuicon&&(!t||g.ui.currmenuicon!=t)&&(clk||!g.ui.settingfocused)?(g.io.log('closing menu...',g.ui.currmenuicon,t),g.ui.currmenuicon=null,g.ui.settingfocused=!1):0,
        // Handle currently active menu + add ev listeners for closing menu
        // Only handle if not already handled
        g.ui.handlemenu=(m,clk,icon)=>async _=>g.m_unlocked?(
            // If clicked on icon and menu is already active, toggle focus
            clk&&g.ui.currmenuicon==icon?g.ui.settingfocused=!g.ui.settingfocused:0,
            g.ui.currmenuicon!=icon?(
                g.ui.closemenu(!0,icon),await g.wait(1),g.io.log('opening menu...',m,clk),
                !g.ui.menunames.includes(m)?(g.ui.currmenuicon=null,g.ui.settingfocused=!1)
                // if current menu icon has a menu associated with it, and menu isn't already handled, activate menu
                :!g.dc[g.qs]('.settings-input-row.mod-entry')?(g.ui.currmenuicon=icon,g.ui.settingfocused=clk,_ib=g.dc[g.qs]('#input-blocker'),_ss=g.dc[g.qs]('.settings-sidebar'),
                    // draw custom menu entries if menu exists
                    g.ui.drawcurrent(_ss,m),
                    // add event listeners for closing menu when clicking/hovering outside menu (depending if focus there or not)
                    // Listeners added only on opening menu (not tab switching)
                    _ib&&_ss?(g.io.msedn(_=>(g.io.log('clk on ib'),g.ui.closemenu(!0)),_ib),g.io.mselv(_=>(g.io.log('hover out setting'),g.ui.closemenu(!1)),_ss),g.io.msedn(_=>g.ui.settingfocused=!0,_ss)):0,

                    // Add event listeners for switching input types and tabs
                    // Menu should be redrawn in that case
                    // TODO: cancel keybind focus
                    _it=g.dc[g.qs]('.settings-sidebar_options'),_tab=g.dc[g.qs]('.settings-sidebar_tabs'),
                    _e=async _=>(await g.wait(1),g.ui.drawmenu(m)),
                    _it?g.io.msedn(_e,_it):0,
                    _tab?g.io.msedn(_e,_tab):0
                ):0
            ):0,
            g.io.log('current state: ',g.ui.settingfocused)
        ):0,
        // Add event listeners for opening menu (by click and by hover; former starts focus)
        g.ui.iconnames.forEach(m=>(_e=g.ui.handlemenu,_icon=g.ui.geticon(m),g.io.mseov(_e(m,!1,_icon),_icon),g.io.msedn(_e(m,!0,_icon),_icon))),
        // Close menu if hovered over anything else in the menubar, and the menu isn't open by focus
        // TODO FIX
        // g.ui.closeonhover=e=>g.ui.currmenuicon&&!g.ui.currmenuicon.contains(e.target)&&!g.ui.settingfocused?(g.io.log('hovered over other icon. Closing...',g.ui.currmenuicon,e.target),g.ui.closemenu()):0,
        // [...g.ui.menubar[g.qsa]('#menu-bar-left,#menu-bar-right>.menu-item,.menu-bar-vertical-divider')].forEach(el=>g.io.mseov(g.ui.closeonhover,el)),
        // g.io.mseov(e=>e.target===g.ui.menubar?g.ui.closeonhover(e):0,g.ui.menubar),

        // Close menu if mouse leaves screen (and setting isn't focused)
        g.io.mselv(_=>g.ui.closemenu(!1),g.evroot),



        g.ui.ready=s=>s.tabIndex=-1,
        g.ui.deselect=el=>(_x=el[g.cn]).includes('input-type_dropdown')||_x.includes('input-type_keybind')?('close the dropdown or stop keybind'):0,
        g.ui.focus=(s,el)=>(s.focus(),g.ui.f=el),
        g.ui.unfocus=s=>(s.blur(),g.ui.f=null),

        g.ui.add=e=>(e[g.cn]='mod-ui',g.bd[g.ap](e)),

        // change toggle to clicked state, and call callback function with either 0 or 1 given the new state (not checked if state changed)
        g.ui.toggle=(t,o,e)=>(t.children[+!o].classList.remove('bool_selected'),t.children[o].classList.add('bool_selected'),e(o)),
        // toggle collapse section (elements in section are stored in _els variable of element)
        g.ui.collapse=(sc,crs)=>(_t=crs[g.it]=='-',sc._els.forEach(x=>x.style.display=_t?'none':'flex'),crs[g.it]=_t?'+':'-'),

        g.ui.ddopen=null,
        // Open or close dropdown
        g.ui.opendd=o=>o?(o.style.display='flex',g.ui.ddopen=o):0,
        g.ui.closedd=_=>g.ui.ddopen?(g.ui.ddopen.style.display='none',g.ui.ddopen=null):0,
        // Select option dropdown
        g.ui.ddselect=(d,o,e)=>o[g.cn]==g.ui.eo?(_o=o[g.it],d.firstChild.nodeValue=_o,e(_o)):0,

        //------------
        // creation of ui components
        //
        
        // check if setting is a certain type
        g.ui.istoggle=el=>el[g.qs]('.settings-input-bool')!==null,
        g.ui.isdd=el=>el[g.qs]('.settings-input-enum')!==null,
        g.ui.iskeybind=el=>el[g.qs]('.settings-input-signal')!==null,
        g.ui.issection=el=>el?.[g.cn].includes('settings-input-list_section')||!1,
        g.ui.isbttn=el=>el?.[g.cn].includes('input-type_bttn')||!1,
        g.ui.isslider=el=>false, // TODO

        // Get value of each type of setting that allows one
        g.ui.getvaltoggle=el=>(_op=el[g.qs]('.settings-input-bool'),_v=el[g.qs]('.settings-input-bool_option.bool_selected'),_op?+(_op.lastChild===_v):null),
        g.ui.getvaldd=el=>(_nv=el[g.qs]('.settings-input-enum'),_ops=[...el[g.qsa]('.settings-input-enum_option')],_op=_ops.filter(x=>_nv!==null&&x.firstChild.nodeValue==_nv.firstChild.nodeValue),
            _op.length&&_ops?_ops.indexOf(_op[0]):null),
        g.ui.getvalkeybind=el=>null, // TODO
        g.ui.getvalsection=el=>el[g.qs]('collapsible-cross')[g.it]=='-', // returns true if open
        g.ui.getvalslider=el=>null, // TODO

        // Get value of an element (if applicable), or return null otherwise
        g.ui.getvalue=el=>
            g.ui.istoggle(el)?g.ui.getvaltoggle(el)
            :g.ui.isdd(el)?g.ui.getvaldd(el)
            :g.ui.iskeybind(el)?g.ui.getvalkeybind(el)
            :g.ui.issection(el)?g.ui.getvalsection(el)
            :g.ui.isslider(el)?g.ui.getvalslider(el)
            :null,

        
        g.ui.makelbl=(l,tlt)=>((_l=g.div())[g.cn]='settings-input-label'+(tlt?' help':''),_l.title=tlt,_l[g.it]=l,_l),
        g.ui.addelem=el=>(el.__id=g.ui.uid++,g.ui.elslst[el.__id]=el,el.__id),
        

        g.ui.cb=(el,e,ev)=>(e(ev),(_v=g.ui.getvalue(el))!==null?g.ui.setlsstate(el.__id,_v):0),
        
        g.ui.makebttn=(l,e,tlt='')=>{var _el=g.div();var _id=g.ui.addelem(_el);_el[g.cn]=g.ui.se+'input-type_bttn'+(tlt?' help':'');_el.title=tlt;_el[g.it]=l;g.io.mseclk(e,_el,!0);return _el},

        g.ui.makekeybind=(s,l,d,tlt='')=>{var _e=g.div();var _id=g.ui.addelem(_el);var _dflt=g.ui.getlsstate(_id,d);_e[g.cn]=g.ui.se;var _l=g.ui.makelbl(l,tlt);var _c=g.div();_c[g.cn]='settings-input-signal-clear';_c[g.it]='x';
            var _i=g.div();_i[g.cn]='settings-input-signal';_i.title='Click to remap';_i[g.it]=v;
            g.km.aelclear(_c,_l,_i);g.km.aelbeginedit(s,_l,_i);g.km.aeledit(_i);_e[g.ap](_l,_c,_i);return _e},
        
        g.ui.maketoggle=(l,o1,o2,d,e,tlt='')=>{var _el=g.div();var _id=g.ui.addelem(_el);var _dflt=g.ui.getlsstate(_id,d);_el[g.cn]=g.ui.se+'input-type_toggle';_l=g.ui.makelbl(l,tlt);var _t=g.div();_t[g.cn]='settings-input-bool';
            var _o1=g.div();var _o2=g.div();_o1[g.cn]=_o2[g.cn]='settings-input-bool_option';_o1[g.it]=o1;_o2[g.it]=o2,(_dflt?_o2:_o1).classList.add('bool_selected');
            g.io.msedn(_=>g.ui.cb(_el,_=>g.ui.toggle(_t,0,e)),_o1,!0);g.io.msedn(_=>g.ui.cb(_el,_=>g.ui.toggle(_t,1,e)),_o2,!0);_t[g.ap](_o1,_o2);_el[g.ap](_l,_t);return _el},
        
        g.ui.makedropdown=(l,o,d,e,tlt='')=>{var _el=g.div();var _id=g.ui.addelem(_el);var _dflt=g.ui.getlsstate(_id,d);_el[g.cn]=g.ui.se+'input-type_dropdown';_l=g.ui.makelbl(l,tlt);var _e=g.div();_e[g.cn]='settings-input-enum';_e[g.it]=o[_dflt];
            var _a=g.div();_a[g.cn]='settings-input-enum_arrow';_a[g.it]='▾';var _o=g.div();_o[g.cn]='settings-input-enum_options';_o.style.display='none';g.io.msedn(ev=>g.ui.cb(_el,e1=>g.ui.ddselect(_e,e1.target,e),ev),_o,!0);
            var _op=o.map(x=>((__o=g.div())[g.cn]=g.ui.eo,__o[g.it]=x,__o));_o[g.ap](..._op);g.io.mseov(_=>g.ui.opendd(_o),_e,!0);g.io.mseout(_=>g.ui.closedd(),_e,!0);_e[g.ap](_a,_o);_el[g.ap](_l,_e);return _el},

        g.ui.makesection=(l,els,d=!0)=>{var _el=g.div();var _id=g.ui.addelem(_el);var _dflt=g.ui.getlsstate(_id,d);_el[g.cn]=g.ui.se+'settings-input-list_section collapsible input-type_section';
            var _t=g.div();_t[g.cn]='collapsible-title';_t[g.it]=l;var _c=g.div();_c[g.cn]='collapsible-cross';
            g.io.mseclk(_=>g.ui.collapse(_el,_c),_el,!0);_c[g.it]='-';_el._els=els;_el[g.ap](_t,_c);!_dflt?gg.ui.collapse(_el,_c):0;return _el},
        
        g.ui.makeslider=(s,l,mn,mx,d,e,tlt='')=>{var _el=g.div();g.ui.addelem(_el);var _dflt=g.ui.getlsstate(_id,d);return _el},
        //-------------

        // add styling ui
        g.css.insertRule('.mod-entry.input-type_bttn:hover{background:#3b3b3b;}'),
        g.css.insertRule('.mod-entry.input-type_bttn{display:flex;align-items:center;justify-content:center;}'),
        g.css.insertRule(`.${g.hdit}{opacity:0 !important;overflow-y:hidden;height:0 !important;padding:0 !important;}`),

        //-------------------------------------------------------------------

        // Set up settings UI for mod
        // g.st={opt:[]},
        // g.st.menu=g.ui.geticon('config'),
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
        g.km.menu=g.ui.geticon('controls'),
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
        g.km.reset=_=>(g.km.stopedit(),g.km.todefault(),g.dc[g.qsa]('.settings-input-row.mod-entry .settings-input-signal').forEach((x,i)=>x[g.it]=g.km.default[g.km.order[g.km.order.length-i-1]]),g.ls.del(g.km.lsname)),
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
        g.hasdebugopen()?g.f3open=!0:(await g.io.fakekey(g.evroot,{"code":g.ls.keybind('ToggleDebug','F3')}),g.uidebug.classList.add(g.hdit),g.fpscnt.classList.add(g.hdit),g.f3open=!1),
        
        // Add proxy F3 menu key (F2)
        g.io.kydn(e=>e.code===g.km.b['Debug']?(_u=g.uidebug.classList,_f=g.fpscnt.classList,(g.f3open=!g.f3open)?(_u.remove(g.hdit),_f.remove(g.hdit)):(_u.add(g.hdit),_f.add(g.hdit))):0),

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
        rt={sd:g.D(),ds:g.dist(),lsn_hs:'modrt_hs',lsn_hsdist:'modrt_hsdist',reset:!1,started:!1,paused:!1,hidden:!0,saveddist:0,savedtime:0,resetoffroad:!1},
        rt.hs=g.ls.get(rt.lsn_hs)||0,
        rt.hsdist=g.ls.get(rt.lsn_hsdist)||0,


        rt.resetscore=async _=>(await g.io.fakekey(g.evroot,{'code':g.ls.keybind('Reset','KeyR')}),rt.hs=0,rt.hsdist=0,g.ls.del(rt.lsn_hs),g.ls.del(rt.lsn_hsdist),rt.updatehs('time',rt.hsdiv),rt.updatehs('distance',rt.dhsdiv)),
        rt.formattime=v=>v?`${(v-=(_hh=g.fl(v/36e5))*36e5),_hh}:${(v-=(_m=g.fl(v/6e4))*6e4),('0'+_m).slice(-2)}:${('0'+g.fl(v/1e3)).slice(-2)}`:'-',
        rt.formatdist=v=>v?v.toFixed(2)+'km':'-',
        rt.updatehs=(n,el,lsname,fs='-',score=0,lssync=!1)=>(el[g.it]=`Highscore ${n}: ${fs}`,lssync?g.ls.set(lsname,score):0),
        // Set up UI roadtime
        (rt.ui=g.div()).style=g.style+'left:50%;top:0;width:300px',
        // create div and add to container
        _ad=_=>(_x=g.div(),_x.style='padding:5px',rt.ui[g.ap](_x),_x),
        rt.tdiv=_ad(),
        rt.ddiv=_ad(),
        (rt.hsdiv=_ad())[g.it]=`Highscore time: ${rt.formattime(rt.hs)}`,
        (rt.dhsdiv=_ad())[g.it]=`Highscore distance: ${rt.formatdist(rt.hsdist)}`,
        g.ui.add(rt.ui),

        // Set up setting entries
        rt.st_resetoffroad=g.ui.maketoggle('Reset when off road','on','off',1,o=>rt.resetoffroad=!o,'Enabling this will reset the vehicle when it is driven off road.'),
        rt.st_resetscore=g.ui.makebttn('Reset highscores',_=>rt.resetscore(),'Reset the highscores of time and distance on road. Be careful as this cannot be undone.'),
        rt.test1=g.ui.makebttn('Test button',e=>g.io.log('Pressed button',e),'Test label'),
        rt.test2=g.ui.makedropdown('Test dd',['Opt 1','Opt 2','Opt 3'],0,e=>g.io.log('Selected dd option',e),'Test label'),
        rt.test3=g.ui.makesection('Test section',[rt.st_resetoffroad,rt.st_resetscore,rt.test1,rt.test2]),
        g.ui.addcomponent(rt.st_resetoffroad,'config'),
        g.ui.addcomponent(rt.st_resetscore,'config'),
        g.ui.addcomponent(rt.test1,'config'),
        g.ui.addcomponent(rt.test2,'config'),
        g.ui.addcomponent(rt.test3,'config'),

        rt.test4=g.ui.makebttn('Test button 2',e=>g.io.log('Pressed button',e),'Test label'),
        g.ui.addcomponent(rt.test4,'controls',g.ui.inputtypes[1],'controls'),

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
                        ?(rt.sd=g.D(),rt.ds=g.dist(),rt.saveddist=0,rt.savedtime=0,rt.ddiv[g.it]='Distance: -',
                        rt.tdiv[g.it]=rt.reset||!rt.started?
                            (rt.reset=!1,"RESETTING... Start driving to begin the timer.")
                            // vehicle is off road; reset vehicle if resetoffroad setting turned on
                            :(rt.resetoffroad?(g.io.fakekey(g.evroot,{'code':g.ls.keybind('Reset','KeyR')})):0,"OFF ROAD"))
                        :(rt.tdiv[g.it]=`Time on road: ${_fs}`,rt.ddiv[g.it]=`Distance: ${_fd}`,
                        _sc>rt.hs?(rt.hs=_sc,rt.updatehs('time',rt.hsdiv,rt.lsn_hs,_fs,_sc,!0)):0,
                        _dist>rt.hsdist?(rt.hsdist=_dist,rt.updatehs('distance',rt.dhsdiv,rt.lsn_hsdist,_fd,_dist,!0)):0)
        ))),16), //16 = 1000/60fps
        // catch the reset key press, and driving keys
        g.io.kydn(e=>(rt.reset=e.code===g.ls.keybind('Reset','KeyR'))?rt.started=!1:['ArrowUp','ArrowDown',g.ls.keybind('Forward','KeyW'),g.ls.keybind('Backward','KeyS')].includes(e.code)?rt.started=!0:0),
        // toggle visibility of ui with '1' key
        g.io.addtvis(g.km.b['Road Time Display'],rt.ui,s=>(rt.hidden=!s,rt.started=!1)),

        //---------------------------------------------------------------------------------
        // WHEEL DRIVE SWITCHER
        wd={wdst:'Drive Mode'},

        wd.parse=s=>s.includes('All')?0:s.includes('Front')?1:2,
        wd.getstate=_=>(_s=wd.parse(g.getst(g.openst('config',wd.wdst))),g.exitst(),_s),
        wd.switchstate=_=>(_s=g.getst(_x=g.openst('config',wd.wdst)),g.setst(_x,_v=_s.includes('All')?1:0),g.exitst(),_v),
        wd.disp=x=>!x?'AWD':x==1?'FWD':'RWD',
        wd.update=s=>wd.wddiv[g.it]=wd.disp(s),

        // add event listener when menu is opened
        wd.menu=g.ui.geticon('config'),
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