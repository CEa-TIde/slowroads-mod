//((?<=(.|\n))\s*\/\/[^\n]*|\s*\n\s*)
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
        //function that returns the current seed
        g.getseed=_=>g.ls.getval('seed'),
        // function that returns the current topo
        g.gettopo=_=>g.ls.getval('config-scene-topography'),
        g.div=_=>g.dc.createElement("div"),
        // Add 'remove by value' function to Array
        Array.prototype.remove=function(el){_x=this.indexOf(el);_x!=-1?this.splice(_x,1):0;return this},
        g.css=g.dc.head[g.qs]('link[rel="stylesheet"]').sheet,
        g.inDOM=el=>g.bd.contains(el),

        //-----------------------------------------------------------------
        // io handler
        // All events are caught in #game-main, unless keybind is recorded, in which case the keypresses are recorded in the settings and bubbling is prevented
        // NOTE: variables in callback function should be local to avoid overwriting global variable before callback is called
        //--------
        // keys: all keys that are pressed at the moment
        // ev: a list of all attached event listeners for each event type
        g.io=new function(){
            this.keys=[];
            this.ev={};
            // Add an event listener to the list (type is added if not already present)
            this.add=(type,cb,tgt=null,persistent=false)=>typeof cb!=='function'?console.error('callback specified is not a function: ',cb):(!this.ev[type]?this.ev[type]=[]:0,this.ev[type].push({callback:cb,target:tgt,persistent:persistent}));
            // Fire the event for all listeners of that type (since there are some custom types, `evtype` is used to denote the type instead)
            // If target is set, the target of the event must be equal to or child of the registered target.
            // Also checks if the targets still exist in DOM, and if not remove them from the event list (to prevent mem leak)
            this.fireev=(t,ev)=>(ev.evtype=t,_del=[],this.ev[t]?.filter(x=>(x.target!=null&&!g.inDOM(x.target)&&!x.persistent?_del.push(x):0,x.target==null||x.target.contains(ev.target))).forEach(x=>x.callback(ev)),_del.forEach(x=>this.ev[t].remove(x)));
            // Check for the keypress event (fired when a key is pressed down for the first time, until it is lifted up again)
            this.chkpress=(t,ev)=>(in__code=ev.code,in__key=this.keys.includes(in__code),t=='keydown'&&!in__key?(this.keys.push(in__code),this.fireev('keypress',ev)):t=='keyup'&&in__key?this.keys.remove(in__code):0);
            // Handler for all event types; checks type and calls the respective attached callback methods
            this.handler=ev=>(in__type=ev.type,this.fireev(in__type,ev),this.chkpress(in__type,ev));
            this.ael=(t,e,el)=>(el||g.evroot)[g.ael](t,e||this.handler);

            // Register all event listeners to default handler
            this.inputtypes=['mousedown','mouseup','mouseover',/*'mouseleave',*/'mouseout','mousemove','click','keydown','keyup','padbttndown','padbttnup','padbttnpressure','padaxistilt'];
            this.inputtypes.forEach(x=>this.ael(x));

            this.kydn=(e,el,p)=>this.add('keydown',e,el,p);
            this.kyup=(e,el,p)=>this.add('keyup',e,el,p);
            this.kyprs=(e,el,p)=>this.add('keypress',e,el,p); // Custom event different from the built-in deprecated keypress event 
            
            this.msedn=(e,el,p)=>this.add('mousedown',e,el,p);
            this.mseup=(e,el,p)=>this.add('mouseup',e,el,p);
            this.mseov=(e,el,p)=>this.add('mouseover',e,el,p);
            this.mselv=(e,el)=>this.ael('mouseleave',e,el); // special case: Event is not handled by event handler but cb is directly called.
            this.mseout=(e,el,p)=>this.add('mouseout',e,el,p);
            this.mseclk=(e,el,p)=>this.add('click',e,el,p);
            this.msemv=(e,el,p)=>this.add('mousemove',e,el,p);
            // Custom events triggered by gamepad polling loop
            this.padbtndn=(e,el,p)=>this.add('padbttndown',e,el,p);
            this.padbtnup=(e,el,p)=>this.add('padbttnup',e,el,p);
            this.padbtnpressure=(e,el,p)=>this.add('padbttnpressure',e,el,p);
            this.padaxistlt=(e,el,p)=>this.add('padaxistilt',e,el,p);

            // Default log function. Should be used for debug output.
            this.log=console.log;
            // List of attached hooks. Format: [{cb: <callback function>, enabled: <bool>},...]
            this.loghooks=[];
            // Attach hook. Passed value should be stored first so that the `enabled` flag can be manipulated.
            this.addloghook=x=>typeof x.cb==='function'?this.loghooks.push(x):this.log('Callback is not set. Format: {cb: <callback function>, enabled: <bool>}');
            // Call all attached hooks with the passed arguments.
            this.loghook=v=>this.loghooks.forEach(x=>x.enabled?x.cb(v):0);
            // Overwrite console.log function with hook so that the output can be read. Argument array is passed to the hooks.
            console.log=(t=>function(...args){t.log(...args);t.loghook(args)})(this);

            // Toggle mod ui
            this.tvis=(el,cb=null)=>(el.style.display=(_s=el.style.display=='none')?'block':'none',cb?.(_s));

            // Toggle all mod ui
            this.uivis=!0;
            this.tvisall=_=>(this.uivis=!this.uivis,g.dc[g.qsa]('.mod-ui').forEach(x=>this.uivis?x.classList.remove(g.hdit):x.classList.add(g.hdit)));


            // Handler for recording inputbinds
            // Is attached to the settings menu, and stops bubbling to prevent keystrokes from affecting the game when remapping input, if recording keypress and result callback is true.
            this.handlerinputbind=(ss,cb)=>this.inputtypes.forEach(x=>this.ael(x,ev=>g.ui.km.current?(_res=cb(ev),_res?ev.stopPropagation():0):0,ss));



            // Faking of events
            this.keyev=(t,ko={bubbles:!0})=>new KeyboardEvent(t,ko);
            this.mouseev=(t,ko={bubbles:!0})=>new MouseEvent(t,ko);
            // Fake keypress by pressing it for 1 ms and releasing it then
            this.fakekey=async(el,ko)=>(el[g.de](this.keyev('keydown',ko)),el[g.de](this.keyev('keypress',ko)),await g.wait(1),el[g.de](this.keyev('keyup',ko)));

            this.fakemseev=(t,el,ko)=>el[g.de](this.mouseev(t,ko));
            // Fake all mouse event types
            this.fakemsedn=(el,ko)=>this.fakemseev('mousedown',el,ko);
            this.fakemseup=(el,ko)=>this.fakemseev('mouseup',el,ko);
            this.fakemseov=(el,ko)=>this.fakemseev('mouseover',el,ko);
            this.fakemselv=(el,ko)=>this.fakemseev('mouseleave',el,ko);
            this.fakemseout=(el,ko)=>this.fakemseev('mouseout',el,ko);
            this.fakemseclk=(el,ko)=>this.fakemseev('click',el,ko);
            this.fakemsemv=(el,ko)=>this.fakemseev('mousemove',el,ko);
        }(),
        // END g.io


        //---------------------------------------------------------------------
        // Local storage management
        g.ls=new function(){
            this.ls=localStorage;
            this.getval=k=>this.ls.getItem(k);
            this.get=k=>JSON.parse(this.getval(k));
            this.set=(k,v)=>this.ls.setItem(k,JSON.stringify(v));
            this.del=k=>this.ls.removeItem(k);
            // Get value from key object in ls, or default if doesn't exist. Should only be used for objects containing keys, not single-value variables; use g.ls.get/g.ls.getval then instead.
            this.getwdflt=(n,k,d)=>(_v=(this.get(n)||{})[k])!==undefined?_v:d;
            // Set value of  key object in ls. Object is created if it didn't exist yet.
            this.setkey=(n,k,v)=>(_s=this.get(n)||{},_s[k]=v,this.set(n,_s));
            this.keybind=(k,d)=>this.getwdflt('controls_keys',k,d);
            this.boosttoggled=_=>this.getwdflt('controls_keys_settings','toggleBoost',!1);
        }(),
        // END g.ls
        



        //-----------------------------------------------------------------
        // functions responsible for managing ui in the menus
        g.ui=new function(){
            this.f=null;
            this.elslist={};
            this.els=[];
            this.uid=0;
            this.lsn_ststates='mod-ststates';
            this.se='settings-input-row mod-entry ';
            this.lbl='settings-input-label';
            this.eo='settings-input-enum_option';
            this.menubar=g.dc[g.qs]('#menu-bar');

            // ids of all menu icons (part of the menu icon src). Divider is a special case for the divide line.
            this.iconnames=['kofi','vol','controls','config','divider','circle'];
            // all ids of icon that have a menu attached to it.
            this.menunames=['controls','config'];
            // All icons that don't close the current menu when hovered over (because they don't have one of their own)
            this.noclosemenu=['kofi','divider','circle'];
            // ids of input types (part of the icon src)
            this.inputtypes=['controls','controls_mouse_icon','controls_controller','all'];

            this.geticon=m=>m=='divider'?g.dc[g.qs]('#menu-bar-right>.menu-bar-vertical-divider'):(_m=[...g.dc[g.qsa]('#menu-bar-right>.menu-item')].filter(x=>this.iconnames.includes(m)&&x.firstChild.src.includes(m))).length?_m[0]:null;
            this.settinglist=_=>g.dc[g.qs]('#menu-bar-right>.settings-input-list');

            
            // Update value of element to state stored in ls (or default if not present)
            this.getlsstate=(id,d)=>g.ls.getwdflt(this.lsn_ststates,id,d);
            // Save state to ls
            this.setlsstate=(id,v)=>g.ls.setkey(this.lsn_ststates,id,v);

            //------------------------------------------------------------------------------------------------------
            // get and set settings values
            //

            // check if setting is a certain type
            this.istoggle=el=>el[g.qs]('.settings-input-bool')!==null;
            this.isdd=el=>el[g.qs]('.settings-input-enum')!==null;
            this.iskeybind=el=>el[g.qs]('.settings-input-signal')!==null;
            this.issection=el=>el?.[g.cn].includes('settings-input-list_section')||!1;
            this.isbttn=el=>el?.[g.cn].includes('input-type_bttn')||!1;
            this.isslider=el=>el[g.qs]('.settings-input-range')!==null;

            // Get value of first (text) node
            // Only used for dropdown
            this.getstrval=el=>el?.firstChild.nodeValue;
            // Get value of each type of setting that allows one
            this.getvaltoggle=el=>(_op=el[g.qs]('.settings-input-bool'),_v=el[g.qs]('.settings-input-bool_option.bool_selected'),_op?+(_op.lastChild===_v):null);
            // DOESN"T WORK: mouseover needed to open options. Instead return string value instead and let the caller figure out the index if needed.
            // this.getvaldd=el=>(_nv=el[g.qs]('.settings-input-enum'),_ops=[...el[g.qsa]('.settings-input-enum_option')],_op=_ops.filter(x=>_nv!==null&&this.getstrval(x)==this.getstrval(_nv)),g.io.log(_nv,_ops,_op),
            //     _op.length&&_ops?_ops.indexOf(_op[0]):null);
            this.getvaldd=el=>this.getstrval(el[g.qs]('.settings-input-enum'));
            this.getvalkeybind=el=>el[g.qs]('.settings-input-range_value:not(.settings-input-range-reset)')?.[g.it]||null; // will return null if keybind is being edited
            this.getvalsection=el=>el[g.qs]('.collapsible-cross')[g.it]=='-'; // returns true if open
            this.getvalslider=el=>el[g.qs]('.settings-input-range_value')[g.it];

            // Get value of an element (if applicable), or return null otherwise
            this.getvalue=el=>!el?(g.io.log('Element is null. Could not get value',el),null)
                :this.istoggle(el)?this.getvaltoggle(el)
                :this.isdd(el)?this.getvaldd(el)
                :this.iskeybind(el)?this.getvalkeybind(el)
                :this.issection(el)?this.getvalsection(el)
                :this.isslider(el)?this.getvalslider(el)
                :null;
            

            // Set value of each type of setting that allows one
            this.setvaltoggle=(el,v)=>(_ops=el[g.qsa]('.settings-input-bool_option'),_ops.length>1?g.io.fakemsedn(_ops[v]):0);
            // v is index of option to be selected
            this.setvaldd=async(el,v)=>(_dd=el[g.qs]('.settings-input-enum'),g.io.fakemseov(_dd),await g.wait(1),_ops=el[g.qs]('.settings-input-enum_options'),_ops?(g.io.fakemsedn(_ops.children[v]),g.io.fakemseout(_ops),await g.wait(1)):0);
            this.setvalkeybind=(el,v)=>0; //TODO
            this.setvalsection=(el,v)=>(_open=el[g.qs]('collapsible-cross')[g.it]=='-',_open!=v?g.io.fakemsedn(el):0); // 1 is open, 0 is closed
            this.setvalslider=async(el,v)=>(_s=el[g.qs]('.settings-input-range_bar'),_s?(_rect=_s.getBoundingClientRect(),_p=_rect.x+v*_rect.width,g.io.fakemsedn(_s,{bubbles:true,clientX:_p}),await g.wait(1),g.io.fakemseup(_s)):0);

            // Set value of an element (if applicable)
            this.setvalue=async(el,v)=>await(!el||!g.inDOM(el)?(g.io.log('Element is null or not in DOM. Could not set value.',el,v),null):
                this.istoggle(el)?this.setvaltoggle(el,v)
                :this.isdd(el)?this.setvaldd(el,v)
                :this.iskeybind(el)?this.setvalkeybind(el,v)
                :this.issection(el)?this.setvalsection(el,v)
                :this.isslider(el)?this.setvalslider(el,v)
                :null);
            

            // get name of passed input type element from parsing the image src; file name up to the first dot
            this.getinputname=el=>el.firstChild.src.split('/media/')[1].split('.')[0];
            // Get name of current input type or null if not present (name is part of the img src)
            this.getinputtype=ss=>(_it=ss[g.qs]('.settings-sidebar_option.option-selected'),_it?this.getinputname(_it):null);
            // Get name of current tab or null if not present
            this.gettab=ss=>(_tab=ss[g.qs]('.settings-sidebar_tab.option-selected'))?_tab[g.it]:null;

            // Get element of input type with specific name (or null if not found)
            this.getinputel=(ss,n)=>(_it=[...ss[g.qsa]('.settings-sidebar_option')].filter(x=>this.getinputname(x)===n),_it.length?_it[0]:null);
            // Get element of tab with specific name (or null if not found)
            this.gettabel=(ss,n)=>(_tab=[...ss[g.qsa]('.settings-sidebar_tab')].filter(x=>x[g.it]===n),_tab.length?_tab[0]:null);


            // Set current input type based on name. Will do nothing if not present.
            this.setinputtype=(ss,n)=>g.inDOM(ss)?(_it=this.getinputel(ss,n),_it?g.io.fakemsedn(_it):0):g.io.log('Setting window not in DOM. Input type cannot be set to '+n);
            // Set current tab based on name. Will do nothing if not present.
            this.settab=(ss,n)=>g.inDOM(ss)?(_tab=this.gettabel(ss,n),_tab?g.io.fakemsedn(_tab):0):g.io.log('Setting window not in DOM. Tab cannot be set to '+n);
            
            // Lock/unlock menu bar when automatically opening menu.
            this.m_unlocked=!1;
            this.menulock=s=>this.m_unlocked=g.dc[g.qs]('#menu-bar').style.opacity=s?0:1;
            // Stores information about the current menu lock state (menu name, settings div, input type, tab)
            this.curmlock={m:null,ss:null,it:null};

            // Open a menu icon
            this.openicon=m=>(_m=this.geticon(m),_m?(g.io.fakemseov(_m),!0):(console.error(`Invalid menu name: ${m}`),!1));
            // Save current input state
            this.savetabstate=(m,ss=null)=>(this.curmlock.m=m,ss&&this.menunames.includes(m)?(g.io.log('saving tabstate...'),this.curmlock.ss=ss,this.curmlock.it=this.getinputtype(ss)):0);
            // Load back input state (and reset save)
            this.loadtabstate=async _=>(g.inDOM(this.curmlock.ss)?
                (g.io.log('loading tabstate...'),_lock=this.curmlock,_lock.it?(this.setinputtype(_lock.ss,_lock.it),await g.wait(1)):0)
                :g.io.log('Loading failed. Settings window not in DOM.',this.curmlock.ss),
                this.curmlock={m:null,ss:null,it:null});

            // Automatically open the menu to the correct input type and tab
            // If settings tab didn't open, unlock menu again.
            // First save input type before changing tabs.
            // returns true if menu opened successfully.
            this.openmenu=async(m,it=null,tab=null)=>(this.out.resetmenu(),this.menulock(1),_opened=this.openicon(m),await g.wait(1),_ss=g.dc[g.qs]('.settings-sidebar'),
                _opened&&_ss?(this.savetabstate(m,_ss),it?(this.setinputtype(_ss,it),await g.wait(1)):0,tab?this.settab(_ss,tab):0,await g.wait(1),!0):(this.menulock(0),!1));

            // Close menu by clicking on the input blocker, or if that doesn't exist, fake mouseout the icon. If applicable, first revert to original tab.
            this.closemenu=async _=>(_m=this.curmlock.m,await this.loadtabstate(),
                _ib=g.dc[g.qs]('#input-blocker'),_ib?g.io.fakemsedn(_ib):g.fakemseout(this.geticon(_m)),this.menulock(0));

            // Open menu, manipulate settings as set by callback function, close menu
            this.changemenu=async(e,m,it=null,tab=null)=>{var _open=await this.openmenu(m,it,tab);if(_open){var _v=await e();await this.closemenu();return _v}return null};
            
            // Get a setting in the currently open setting menu + input type + tab (sections can also be selected)
            this.getsetting=n=>(_o=[...g.dc[g.qsa]('.settings-input-list .settings-input-row')].filter(
                x=>(x[g.cn].includes('collapsible')?x[g.qs]('.collapsible-title')?.[g.it].toLowerCase()==n.toLowerCase():x[g.qs]('.settings-input-label')?.[g.it].toLowerCase()==n.toLowerCase())
            )).length?_o[0]:null;

            
            //-----------------------------------------------------------------------------------------------------
            // Handles drawing ui to menu when open, and menu states
            this.out=new function(){

                this.menu={m:null,icon:null,ss:null,focus:!1,it:null,tab:null};
                this.callbacks=[];

                this.resetstate=_=>this.menu={m:null,icon:null,ss:null,focus:!1,it:null,tab:null};

                // handle focus and unfocus settings window for recording keypresses
                this.focusready=s=>s.tabIndex=-1;
                this.focus=_=>(this.menu.ss.focus(),g.io.log('focusing...'));
                this.unfocus=_=>(g.evroot.focus(),g.io.log('stopping focus...'));


                // Draw elements to open menu
                this.drawcomponent=(s,el,menu)=>(el.__cb?.(menu),s.prepend(el),g.io.log('drawing...'));
                this.draw=(s,m,it,tab)=>g.ui.els.filter(x=>x.m==m&&(x.it==it||x.it=='all')&&(it!==g.ui.inputtypes[2]||g.ui.km.gp.connected)&&(x.tab==tab||x.tab=='all')).forEach(x=>this.drawcomponent(s,g.ui.elslist[x.id],{m:m,it:it,tab:tab}));

                // Draw current open menu (also updates the current stored input type and tab names)
                this.drawcurrent=(ss,m)=>ss?(this.menu.it=g.ui.getinputtype(ss),this.menu.tab=g.ui.gettab(ss),_s=ss[g.qs]('.settings-input-list'),g.io.log('drawing ',m,'... it: ',this.menu.it,' tab: ',this.menu.tab,_s,g.ui.inputtypes[2],g.ui.km.gp.connected),
                    _s?this.draw(_s,m,this.menu.it,this.menu.tab):0):0;
                this.drawmenu=m=>this.drawcurrent(this.menu.ss,m);

                // Add callback for when specific menu (+ optionally input type and tab) is opened
                this.addcallback=(cb,m,it=null,tab=null)=>this.callbacks.push({cb:cb,m:m,it:it,tab:tab});
                // Trigger all callbacks that are attached to the opened menu + it + tab combination.
                this.menucbhandler=_=>this.callbacks.forEach(x=>(_m=this.menu,g.ui.m_unlocked&&x.m==_m.m&&(x.it==null||x.it==_m.it)&&(x.tab==null||x.tab==_m.tab)?x.cb(_m.m,_m.it,_m.tab):0));

                // Return focus if keybind was being edited and close menu
                this.resetmenu=(clk=!0,t=null)=>this.menu.icon&&(!t||this.menu.icon!=t)&&(clk||!this.menu.focus)
                    ?(g.io.log('closing menu...',this.menu.icon,t),g.ui.stopsliding(),g.ui.km.stoprecording(),this.resetstate()):0;
                // Handle currently active menu + add ev listeners for closing menu
                // Only handle if not already handled
                this.handlemenu=(m,clk,icon)=>async _=>g.ui.m_unlocked&&(!this.menu.focus||!g.ui.noclosemenu.includes(m))?(
                    // If clicked on icon and menu is already active, toggle focus
                    clk&&this.menu.icon==icon?this.menu.focus=!this.menu.focus:0,
                    this.menu.icon!=icon?(
                        this.resetmenu(!0,icon),await g.wait(1),g.io.log('opening menu...',m,clk),
                        !g.ui.menunames.includes(m)?(this.resetstate())
                        // if current menu icon has a menu associated with it, and menu isn't already handled, activate menu
                        :!g.dc[g.qs]('.settings-input-row.mod-entry')?(
                            this.menu.m=m,this.menu.icon=icon,this.menu.focus=clk,
                            _ib=g.dc[g.qs]('#input-blocker'),this.menu.ss=g.dc[g.qs]('.settings-sidebar'),
                            // draw custom menu entries if menu exists
                            this.drawcurrent(this.menu.ss,m),
                            // Trigger callbacks for current menu
                            this.menucbhandler(),

                            _ib&&this.menu.ss?(
                                // Add event listeners for closing menu when clicking/hovering outside menu (depending if focus there or not)
                                g.io.msedn(_=>(g.io.log('clk on ib'),this.resetmenu(!0)),_ib),
                                g.io.mselv(e=>(g.io.log('hover out setting'),this.resetmenu(!1,e.relatedTarget)),this.menu.ss),
                                // Add event listener for clicking in menu as that focuses the menu
                                g.io.mseclk(_=>this.menu.focus=!0,this.menu.ss),

                                // Allow focus of settings window for keypress recording purposes
                                this.focusready(this.menu.ss),

                                // Add event listener for capturing all input without influencing the game state. Only prevents propagation when inputbind is being recorded.
                                g.io.handlerinputbind(this.menu.ss,ev=>g.ui.km.handleinput(ev))
                            ):0,

                            // Add event listeners for switching input types and tabs
                            // Menu should be redrawn in that case
                            _it=g.dc[g.qs]('.settings-sidebar_options'),_tab=g.dc[g.qs]('.settings-sidebar_tabs'),
                            _e=async _=>(await g.wait(1),this.drawmenu(m),this.menucbhandler()),
                            _it?g.io.msedn(_e,_it):0,
                            _tab?g.io.msedn(_e,_tab):0
                        ):0
                    ):0,
                    g.io.log('current state: ',this.menu.focus)
                ):0;

            }();
            // END g.ui.out

            // Add event listeners for opening menu (by click and by hover; former starts focus)
            this.iconnames.forEach(m=>(_e=this.out.handlemenu,_icon=this.geticon(m),_icon?(g.io.mseov(_e(m,!1,_icon),_icon),g.io.msedn(_e(m,!0,_icon),_icon)):0));

            // Close menu if mouse leaves screen (and setting isn't focused)
            g.io.mselv(_=>this.out.resetmenu(!1),g.evroot);

            //------------------------------------------------------------------------------------------------------


            // Responsible for recording of keybind
            this.km=new function(){
                this.inputbinds={};
                this.nameidmap={};

                // Set initial input bind. Not synced with local storage here, as it is the default.
                this.initbind=(id,n,e,key=null,mouse=null,pad=null)=>(this.nameidmap[n]=id,this.inputbinds[id]={key:key,mouse:mouse,pad:pad},this.startlistening(id,n,e));
                // Add event listeners for keybind (only listens when inputbind is added to a menu)
                this.startlistening=(id,name,e)=>{
                    var _handler=ev=>g.ui.addedcomponents.includes(id)&&this.checkbind(name,ev)?e(ev,name):0;
                    g.io.kydn(_handler);
                    g.io.msedn(_handler);
                    g.io.padbtndn(_handler);
                    g.io.padaxistlt(_handler);
                };


                // convert input type to respective value in [key, mouse, pad]
                this.parsebindtype=it=>['key','mouse','pad'].includes(it)?it:it===g.ui.inputtypes[0]?'key':it===g.ui.inputtypes[1]?'mouse':it===g.ui.inputtypes[2]?'pad':'unknown';
                // set bind and sync with local storage
                this.setbind=(n,it,v)=>(_id=this.nameidmap[n],this.inputbinds[_id][this.parsebindtype(it)]=v,g.ui.setlsstate(_id,this.inputbinds[_id]));
                //,g.ls.setkey(g.ui.lsn_ststates,_id,this.inputbinds[_id])
                // get bind
                this.getbind=(n,it='key')=>(_id=this.nameidmap[n],this.inputbinds[_id][this.parsebindtype(it)]);
                
                this.iskeyev=type=>['keydown','keypress','keyup'].includes(type);
                this.ismouseev=type=>['mousedown','mouseup','mousemove','mouseleave','mouseout','mouseover','click'].includes(type);
                this.ispadev=type=>['padbttndown','padbttnup','padbttnpressure','padaxistilt'].includes(type);
                // Check if bind is activated.
                this.checkbind=(n,ev)=>
                    this.iskeyev(ev.type)?ev.code===this.getbind(n,'key')
                    :this.ismouseev(ev.type)?ev.buttons&this.getbind(n,'mouse')
                    :this.ispadev(ev.type)?(
                        _bind=this.getbind(n,'pad'),
                        // Check if bind is correct pad input type (button or axis) and check if input index is the same.
                        ev.type=='padbttndown'&&_bind?.type=='bttn'&&_bind?.value==ev.detail.index||ev.type=='padaxistilt'&&_bind?.type=='axis'&&_bind?.value==ev.detail.index
                    ):!1;
                
                this.iscorrecttype=(evtype,bindtype)=>(
                    _bt=this.parsebindtype(bindtype),
                    this.iskeyev(evtype)&&_bt=='key'||this.ismouseev(evtype)&&_bt=='mouse'||this.ispadev(evtype)&&_bt=='pad'
                );
                
                // Convert event to display value and code
                // If a letter in the alphabet, convert `Key(letter)` to just `letter` (E.g. KeyW -> W)
                this.parseevent=ev=>
                    this.iskeyev(ev.type)?this.parsekey(ev.code)
                    :this.ismouseev(ev.type)?this.parsemouse(ev.buttons)
                    :this.ispadev(ev.type)?this.parsepad(ev.detail)
                    :(console.error('Unknown input type; value cannot be displayed.'),{t:null,v:null,s:'Unknown'});
                
                // Convert code to string value
                this.parsecode=(type,code)=>
                    code===null?''
                    :type=='key'?this.parsekey(code).s
                    :type=='mouse'?this.parsemouse(code).s
                    :type=='pad'?this.parsepad(code).s
                    :'Unknown';
                
                this.parsekey=code=>/Key[a-z]/i.test(code)?{t:'key',v:code,s:code.slice(-1)}:{t:'key',v:code,s:code},
                this.parsemouse=bttn=>bttn&1?{t:'mouse',v:1,s:'Left Click'}:bttn&2?{t:'mouse',v:2,s:'Right Click'}:bttn&4?{t:'mouse',v:4,s:'Middle Click'}:{t:'mouse',v:null,s:'Unknown'},
                this.parsepad=detail=>
                    detail.type=='padbttndown'?({t:'pad',v:{type:'bttn',value:detail.index},s:`Pad Button ${detail.index}`})
                    :detail.type=='padaxistilt'?({t:'pad',v:{type:'axis',value:detail.index},s:`Pad Axis ${detail.index}`})
                    :({t:'pad',v:null,s:'unknown'});

                this.current=null;
                this.currstrval=null;
                this.currcode=null;
                this.resetting=!1;

                this.getinputfield=el=>el[g.qs]('.settings-input-signal');
                this.getclearbttn=el=>el[g.qs]('.settings-input-signal-clear');

                this.recordinput=ev=>(_i=this.getinputfield(this.current),ev.type!=='mousedown'||_i&&_i.contains(ev.target)?(
                    ev.preventDefault(),
                    _input=this.parseevent(ev),
                    this.currstrval=_input.s,
                    this.currcode=_input.v,
                    g.io.log('recording input: ',ev.type),
                    this.ismouseev(ev.type)?this.resetting=!0:0,
                    this.stoprecording(!0)
                ):0);

                // Sets the value of the input field and optionally sets the edit state (if not null). The old value is returned.
                this.setvalue=(el,str,editstate=null,writeres=!0)=>(
                    _field=this.getinputfield(el),
                    _old=_field[g.it],
                    writeres?_field[g.it]=str!==null?str:'':0,
                    editstate!==null?_field.classList[editstate?'add':'remove']('settings-input-signal-reset'):0,
                    _old
                );

                // Clear value of the element
                this.clearbind=el=>(g.io.log('clearing input',el),this.setvalue(el,null),this.setbind(el.__cname,el.__it,null)),

                this.handlemenuclk=(ev,tgt=null,ismod=!0,istabswitching=!1)=>this.resetting?(this.resetting=!1)
                    :(
                        this.current&&(!tgt||!ismod||this.current==tgt)?(
                            _i=this.getinputfield(this.current),
                            _i&&!_i.contains(ev.target)?(
                                g.io.log('cancel recording'),
                                this.stoprecording(!1,!istabswitching),
                                ismod?!0:!1
                            )
                            :_i&&_i.contains(ev.target)?!0:!1
                        )
                        :tgt?(this.startrecording(tgt),!0):!1
                    );

                // Find keybind setting that has target as the input field
                this.findsetting=(ss,el)=>(_s=[...ss[g.qsa]('.settings-input-row')].filter(x=>g.ui.iskeybind(x)&&this.getinputfield(x)?.contains(el)),_s.length?_s[0]:null);

                this.isswitchingtab=(ss,tgt)=>(_tabs=ss[g.qs]('.settings-sidebar_tabs'),_it=ss[g.qs]('.settings-sidebar_options'),_tabs&&_tabs.contains(tgt)||_it&&_it.contains(tgt));

                // Handle all input events inside settings window when recording
                this.handleinput=ev=>(
                    _el=this.findsetting(g.ui.out.menu.ss,ev.target),
                    _ismod=_el&&_el.classList.contains('mod-entry')||!1,
                    _isswitching=this.isswitchingtab(g.ui.out.menu.ss,ev.target),
                    // _ismod?_el=null:0,
                    ev.type==='click'?(
                        // Set focus to window (mirrored from other input handler)
                        g.ui.out.menu.focus=!0,
                        _res=this.handlemenuclk(ev,_el,_ismod,_isswitching),
                        _res
                    )
                    :['keydown','mousedown'].includes(ev.type)&&this.current?(
                        // Record input
                        this.iscorrecttype(ev.type,g.ui.out.menu.it)?this.recordinput(ev):0,
                        _isswitching?!1:!0
                    ):!1
                );

                // Set focus to settings window and start recording keybind
                this.startrecording=el=>(g.ui.out.focus(),g.io.log('starting recording...'),this.setuprecording(el));
                // Stop recording of keybind and return focus to evroot
                this.stoprecording=(savebind=!1,writeres=!0)=>(g.ui.out.unfocus(),this.finishrecording(this.current,savebind,writeres));

                // Stop current keyrecordings (also regular keybind setting)
                this.stopcurrentrecording=_=>(this.current?(this.finishrecording(this.current)):0,[...g.ui.out.menu.ss[g.qsa]('.settings-input-row:not(.mod-entry) .settings-input-signal-reset')].forEach(x=>g.io.fakemseclk(x)));

                // Get editing text depending on input type.
                this.geteditingtext=it=>!it||it===g.ui.inputtypes[0]?'press a key...':it===g.ui.inputtypes[1]?'click a button...':it===g.ui.inputtypes[2]?'press a button...':'enter input...';

                this.setuprecording=el=>el?(this.stopcurrentrecording(),this.currstrval=this.setvalue(el,this.geteditingtext(el.__it),!0),this.current=el):0;
                this.finishrecording=(el,savebind=!1,writeres=!0)=>el?(this.setvalue(el,this.currstrval,!1,writeres),savebind&&this.setbind(el.__cname,el.__it,this.currcode),this.current=null):0;

                //--------------------------
                // Tracking game pad

                this.gp=new function(){

                    this.connected=!1;
                    this.connectedids=[];
                    this.intervalid=0;
                    this.pressed={};
                    this.bttnpressure={};
                    this.axisvalues={};

                    this.connect=ev=>(this.connectedids.push(ev.gamepad.index),!this.connected?(this.connected=!0,this.intervalid=setInterval(this.pollgamepad,16)):0);
                    this.disconnect=ev=>(this.connectedids.remove(ev.gamepad.index),this.connectedids.length<1?(this.connected=!1,this.intervalid?clearInterval(this.intervalid):0):0);

                    g.io.ael('gamepadconnected',ev=>this.connect(ev),window);
                    g.io.ael('gamepaddisconnected',ev=>this.disconnect(ev),window);

                    // Loop for polling gamepad for input.
                    this.pollgamepad=_=>this.connected?(
                        g.io.log('polling gamepad...'),
                        _gamepads=navigator.getGamepads(),
                        _gamepads&&_gamepads.length>0?(
                            g.io.log('gamepad(s) found. Checking if connected...'),
                            this.connectedids.forEach(id=>(
                                _pad=_gamepads[id],
                                // Fire events for game pad object if any buttons are pressed
                                g.io.log('firing events for ',id),
                                this.fireevents(pad)
                            ))
                        ):0
                    ):0;

                    this.setpressed=(padidx,bttnidx,val)=>(
                        _pressed=this.pressed,
                        _pressed[padidx]=_pressed[padidx]||{},
                        _pressed[padidx][bttnidx]=val
                    );
                    this.checkpressed=(padidx,bttnidx)=>this.pressed[padidx]?.[bttnidx]||!1;

                    this.setbttnpressure=(padidx,bttnidx,val)=>(
                        _bttnpressure=this.bttnpressure,
                        _bttnpressure[padidx]=_bttnpressure[padidx]||{},
                        _bttnpressure[padidx][bttnidx]=val
                    );

                    this.getbttnpressure=(padidx,bttnidx)=>this.bttnpressure[padidx]?.[bttnidx]||!1;

                    this.setaxisvalue=(padidx,axisidx,val)=>(
                        _axisvalues=this.axisvalues,
                        _axisvalues[padidx]=_axisvalues[padidx]||{},
                        _axisvalues[padidx][axisidx]=val
                    );

                    this.getaxisvalue=(padidx,axisidx)=>this.axisvalues[padidx]?.[axisidx]||!1;

                    this.fireevents=pad=>(
                        pad.buttons.forEach((bttn,bttnidx)=>(
                            bttn.pressed?(
                                this.fireevent('padbttndown',pad,bttn,bttnidx),
                                this.setpressed(pad.index,bttnidx,!0)
                            )
                            :this.checkpressed(pad.index,bttnidx)?(
                                this.fireevent('padbttnup',pad,bttn,bttnidx),
                                this.setpressed(pad.index,bttnidx,!1)
                            ):0,
                            bttn.value!==this.getbttnpressure(pad.index,bttnidx)?(
                                this.fireevent('padbttnpressure',pad,bttn,bttnidx),
                                this.setbttnpressure(pad.index,bttnidx,bttn.value)
                            ):0
                            

                        )),
                        pad.axes.forEach((val,axisidx)=>(
                            // Tilting of axes controller.
                            val!==this.getaxisvalue(pad.index,axisidx)?(
                                this.fireevent('padaxistilt',pad,val,axisidx),
                                this.setaxisvalue(pad.index,axisidx,val)
                            ):0
                        ))
                    );

                    this.fireevent=(type,pad,val,inputidx)=>(
                        g.io.log('fired event for',pad,val),
                        _evdetails={type:type,pad:pad,value:val,index:inputidx},
                        _ev=new CustomEvent(type,{detail:_evdetails,bubbles:!0}),
                        g.dc.activeElement[g.de](_ev)

                    );

                    g.io.padbtndn(ev=>g.io.log(ev));
                    g.io.padbtnup(ev=>g.io.log(ev));
                    g.io.padbtnpressure(ev=>g.io.log(ev));
                    g.io.padaxistlt(ev=>g.io.log(ev));
                }();
                // END g.ui.km.gp
                
            }();
            // END g.ui.km

            //-----------------------------------------------------------------------------------------------------



            this.deselect=el=>(_x=el[g.cn]).includes('input-type_dropdown')||_x.includes('input-type_keybind')?('close the dropdown or stop keybind'):0;

            this.addui=el=>(el[g.cn]='mod-ui',g.bd[g.ap](el));

            // change toggle to clicked state, and call callback function with either 0 or 1 given the new state (not checked if state changed)
            this.toggle=(t,o,e)=>(t.children[+!o].classList.remove('bool_selected'),t.children[o].classList.add('bool_selected'),e(o));
            // toggle collapse section (elements in section are stored in _els variable of element)
            this.collapse=(sc,crs)=>(_t=crs[g.it]=='-',sc._els.forEach(x=>x.style.display=_t?'none':'flex'),crs[g.it]=_t?'+':'-');

            this.ddopen=null;
            // Open or close dropdown
            this.opendd=o=>o?(o.style.display='flex',this.ddopen=o):0;
            this.closedd=_=>this.ddopen?(this.ddopen.style.display='none',this.ddopen=null):0;
            // Select option dropdown
            this.ddselect=(d,o,e)=>o[g.cn]==this.eo?(_o=o[g.it],d.firstChild.nodeValue=_o,e(_o)):0;

            // Get percentage between min and max (0-1) of slider value
            this.getprcntcustomslider=(el,x)=>(_rect=el.getBoundingClientRect(),(x-_rect.left)/(_rect.right-_rect.left));
            // Sets value for custom-defined slider settings. Value is percentage between min and max values (0 to 1).
            this.setprcntcustomslider=(el,prcnt)=>el&&el.__mn&&el.__mx?(
                prcnt=Math.max(0,Math.min(1,prcnt)),
                _v=el.__mn+prcnt*(el.__mx-el.__mn),
                _rv=el[g.qs]('.settings-input-range_value'),_rv?_rv[g.it]=_v.toFixed(this.getprecisionslider(el)):0,
                _h=el[g.qs]('.settings-input-range_handle'),_h?_h.style.left=`${prcnt*100}%`:0
            ):console.error('Slider, min-, or max value not defined',el);
            // Get precision of slider value. If '__precision' property not set, it takes the length of string after dot.
            this.getprecisionslider=el=>el?(el.__precision?el.__precision:(_v=el[g.qs]('.settings-input-range_value'),_dec=_v[g.it].split('.'),_prscn=_dec.length>1?_dec[1].length:0,el.__precision=_prscn,_prscn)):null;

            this.editingslider=null;
            this.startsliding=(el,ev)=>(this.editingslider=el,this.updatesliding(ev));
            this.updatesliding=ev=>this.editingslider?(_bar=this.editingslider[g.qs]('.settings-input-range_bar'),this.setprcntcustomslider(this.editingslider,this.getprcntcustomslider(_bar,ev.clientX))):0;
            this.stopsliding=_=>this.editingslider?(this.editingslider=null):0;

            // Event listeners for sliders (except for starting sliding)
            g.io.mseup(_=>this.stopsliding(),g.evroot);

            //------------
            // creation of ui components
            //

            this.addedcomponents=[];

            // Assigns unique id to element and adds id to element list. Returns assigned id.
            this.addelem=el=>(el.__id=this.uid++,this.elslist[el.__id]=el,el.__id);
            // Triggers callback function and after that updates the localstorage value based on the new state.
            this.cb=(el,e,ev)=>(e(ev),(_v=this.getvalue(el))!==null?this.setlsstate(el.__id,_v):0);

            // Insert element in element array preserving order and priority.
            this.insertelem=obj=>{
                for(var i=0;i<this.els.length;i++){
                    if(this.els[i].priority>obj.priority){
                        this.els.splice(i,0,obj);
                        return;
                    }
                }
                this.els.push(obj);
            };

            // Add component to menu under a(n optional) input type in a(n optional) tab. 
            // If an optional is not specified, it is added to all of those menu tabs (e.g. if the input type is not specified, it is added to keyboard, mouse, and controller tabs).
            // input type is a string of one of the input types specified in `this.inputtypes`. If it is null, it is added to all input types.
            // tab is the name that specifies which tab it should be added to. If it is null, it is added to all tabs.
            this.addcomponent=(el,priority,m,it=null,tab=null)=>this.menunames.includes(m)?
                (this.addedcomponents.push(el.__id),this.insertelem({id:el.__id,m:m,it:it||'all',tab:tab||'all',priority:priority}))
                :g.io.log(`${m} is not a valid menu id; the icon needs to have an associated menu. All valid ids are listed in 'this.menunames'. Failed to add element: `,el);

            this.makelbl=(l,tlt)=>((_l=g.div())[g.cn]='settings-input-label'+(tlt?' help':''),_l.title=tlt,_l[g.it]=l,_l);

            this.makebttn=(l,e,tlt='')=>{
                var _el=g.div();
                var _id=this.addelem(_el);
                _el[g.cn]=this.se+'input-type_bttn'+(tlt?' help':'');
                _el.title=tlt;
                _el[g.it]=l;
                g.io.mseclk(e,_el,!0);
                return _el
            };

            this.makeinputbind=(l,cname,d,e,tlt='')=>{
                var _el=g.div();
                var _id=this.addelem(_el);
                var _dflt=this.getlsstate(_id,d);
                _el[g.cn]=this.se;
                _el.__dflt=_dflt;
                _el.__cname=cname;
                this.km.initbind(_id,cname,e,_dflt.key,_dflt.mouse,_dflt.pad);
                // Set up when adding inputbind to settings window. 
                _el.__cb=menu=>(
                    _el.__it=menu.it,
                    _type=this.km.parsebindtype(menu.it),
                    _val=this.km.getbind(cname,menu.it),
                    _i[g.it]=this.km.parsecode(_type,_val)
                );

                var _l=this.makelbl(l,tlt);

                var _c=g.div();
                _c[g.cn]='settings-input-signal-clear';
                _c[g.it]='x';

                var _i=g.div();
                _i[g.cn]='settings-input-signal';
                _i.title='Click to remap';

                // Start recording when clicking on edit field
                g.io.mseclk(ev=>this.km.handlemenuclk(ev,_el),_i,!0);

                // Clear input when clicking on X. Is ignored when editing inputbind (cancels edit instead)
                g.io.msedn(ev=>this.km.clearbind(_el),_c,!0);

                _el[g.ap](_l,_c,_i);
                return _el
            };
            
            this.maketoggle=(l,o1,o2,d,e,tlt='')=>{
                var _el=g.div();
                var _id=this.addelem(_el);
                var _dflt=this.getlsstate(_id,d);
                _el[g.cn]=this.se+'input-type_toggle';
                _el.__dflt=_dflt;

                _l=this.makelbl(l,tlt);

                var _t=g.div();
                _t[g.cn]='settings-input-bool';

                var _o1=g.div();
                var _o2=g.div();
                _o1[g.cn]=_o2[g.cn]='settings-input-bool_option';
                _o1[g.it]=o1;
                _o2[g.it]=o2;
                (_dflt?_o2:_o1).classList.add('bool_selected');

                g.io.msedn(_=>this.cb(_el,_=>this.toggle(_t,0,e)),_o1,!0);
                g.io.msedn(_=>this.cb(_el,_=>this.toggle(_t,1,e)),_o2,!0);

                _t[g.ap](_o1,_o2);
                _el[g.ap](_l,_t);
                return _el
            };
            
            this.makedropdown=(l,o,d,e,tlt='')=>{
                var _el=g.div();
                var _id=this.addelem(_el);
                var _dflt=this.getlsstate(_id,o[d]);
                !o.includes(_dflt)?_dflt=o[d]:0;
                _el[g.cn]=this.se+'input-type_dropdown';
                _el.__dflt=_dflt;

                var _l=this.makelbl(l,tlt);

                var _e=g.div();
                _e[g.cn]='settings-input-enum';
                _e[g.it]=_dflt;

                var _a=g.div();
                _a[g.cn]='settings-input-enum_arrow';
                _a[g.it]='▾';

                var _o=g.div();
                _o[g.cn]='settings-input-enum_options';
                _o.style.display='none';

                var _op=o.map(x=>((__o=g.div())[g.cn]=this.eo,__o[g.it]=x,__o));
                
                g.io.msedn(ev=>this.cb(_el,e1=>this.ddselect(_e,e1.target,e),ev),_o,!0);
                g.io.mseov(_=>this.opendd(_o),_e,!0);
                g.io.mseout(_=>this.closedd(),_e,!0);

                _o[g.ap](..._op);
                _e[g.ap](_a,_o);
                _el[g.ap](_l,_e);
                return _el
            };

            this.makesection=(l,els,d=!0)=>{
                var _el=g.div();
                var _id=this.addelem(_el);
                var _dflt=this.getlsstate(_id,d);
                _el[g.cn]=this.se+'settings-input-list_section collapsible input-type_section';
                _el._els=els;
                _el.__dflt=_dflt;

                var _t=g.div();
                _t[g.cn]='collapsible-title';
                _t[g.it]=l;

                var _c=g.div();
                _c[g.cn]='collapsible-cross';
                _c[g.it]='-';

                // g.io.mseclk(_=>this.collapse(_el,_c),_el,!0);
                g.io.mseclk(_=>this.cb(_el,_=>this.collapse(_el,_c)),_el,!0);

                _el[g.ap](_t,_c);
                !_dflt?this.collapse(_el,_c):0;
                return _el
            };
            
            this.makeslider=(l,mn,mx,d,prscn,e,tlt='')=>{
                var _el=g.div();
                var _id=this.addelem(_el);
                var _dflt=this.getlsstate(_id,d);
                _el.__mn=mn;
                _el.__mx=mx;
                _el.__precision=prscn;
                _el.__dflt=_dflt;
                _el[g.cn]=this.se+'input-type_slider';

                var _l=this.makelbl(l,tlt);

                var _r=g.div();
                _r[g.cn]='settings-input-range';
                var _v=g.div();
                _v[g.cn]='settings-input-range_value';
                var _b=g.div();
                _b[g.cn]='settings-input-range_bar';
                var _h=g.div();
                _h[g.cn]='settings-input-range_handle';

                g.io.msedn(ev=>this.cb(_el,ev1=>(this.startsliding(_el,ev1),e(ev1)),ev),_b,!0);
                g.io.msemv(ev=>this.editingslider?this.cb(_el,ev1=>(this.updatesliding(ev1),e(ev1)),ev):0,g.evroot);

                _b[g.ap](_h);
                _r[g.ap](_v,_b);
                _el[g.ap](_l,_r);

                this.setprcntcustomslider(_el,(_dflt-mn)/(mx-mn));
                return _el
            };
            //-------------

            // add styling ui
            g.css.insertRule('.mod-entry.input-type_bttn:hover{background:#3b3b3b;}');
            g.css.insertRule('.mod-entry.input-type_bttn{display:flex;align-items:center;justify-content:center;}');
            g.css.insertRule(`.${g.hdit}{opacity:0 !important;overflow-y:hidden;height:0 !important;padding:0 !important;}`);
        }(),
        // END g.ui

        //--------------

        // Add global input binds

        g.toggledebug=_=>(_u=g.uidebug.classList,_f=g.fpscnt.classList,(g.f3open=!g.f3open)?(_u.remove(g.hdit),_f.remove(g.hdit)):(_u.add(g.hdit),_f.add(g.hdit))),
        // Add proxy F3 menu key (F2 by default)
        g.ui.kb_debug=g.ui.makeinputbind('Toggle debug menu (alt)','debug',{key:'F2',mouse:null,pad:null},
            (ev,name)=>g.toggledebug(),
            'Toggle the visibility of the debug menu. This needs to be a different inputbind than the normal debug menu hotkey, for this mod to work'),
        g.ui.addcomponent(g.ui.kb_debug,0,'controls',null,'controls'),

        //-------------------------------------------------------------------


        //open and hide debug menus
        g.hasdebugopen()?g.f3open=!0:(await g.io.fakekey(g.evroot,{"code":g.ls.keybind('ToggleDebug','F3')}),g.uidebug.classList.add(g.hdit),g.fpscnt.classList.add(g.hdit),g.f3open=!1),

        // Toggle ui visibility when pressing hide/show ui button (default: U)
        g.io.kyprs(e=>e.code==g.ls.keybind('ToggleUI','KeyU')?g.io.tvisall():0),

        // Display hidden ms counter
        g.fpscnt.children[1].style.display='block',

        // Prevent text selection on debug menu
        g.css.insertRule('#ui-debug{-webkit-user-select:none;-ms-user-select:none;user-select:none;}'),

        // Add ui for error messages
        g.style='display:none;position:absolute;z-index:999;backdrop-filter:blur(10px);background:#66666666;color:white;',
        (g.errdiv=g.div()).style=g.style+'left:0;top:50%;max-width:300px;padding:5px',
        g.ui.addui(g.errdiv),
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
        g.ui.addui(rt.ui),

        // Set up setting entries
        rt.st_resetoffroad=g.ui.maketoggle('Reset when off road','on','off',1,o=>rt.resetoffroad=!o,'Enabling this will reset the vehicle when it is driven off road.'),
        rt.st_resetscore=g.ui.makebttn('Reset highscores',_=>rt.resetscore(),'Reset the highscores of time and distance on road. Be careful as this cannot be undone.'),
        rt.kb_toggleui=g.ui.makeinputbind('Road Time Display','rt_display',{key:'Digit1',mouse:null,pad:null},
            (ev,name)=>g.io.tvis(rt.ui,s=>(rt.hidden=!s,rt.started=!1)),
            'Toggle the visibility of the Road Time Display.'),

        // rt.test1=g.ui.makebttn('Test button',e=>g.io.log('Pressed button',e),'Test label'),
        // rt.test2=g.ui.makedropdown('Test dd',['Opt 1','Opt 2','Opt 3'],0,e=>g.io.log('Selected dd option',e),'Test label'),
        // rt.test3=g.ui.makesection('Test section',[rt.st_resetoffroad,rt.st_resetscore,rt.test1,rt.test2]),
        // rt.test4=g.ui.makeslider('Test slider',40,80,60,1,e=>g.io.log(e),'Test label'),
        // rt.test5=g.ui.makeinputbind('Test keybind','test1',{key:'KeyB',mouse:null,pad:null},
        //     (ev,name)=>g.io.log('Test. Pressed test 1 keybind'),
        //     'Test label'),
        // rt.test6=g.ui.makeinputbind('Test keybind 2','test2',{key:'KeyC',mouse:null,pad:null},
        //     (ev,name)=>g.io.log('Test. Pressed test 2 keybind'),
        //     'Test label 2'),

        g.ui.addcomponent(rt.st_resetoffroad,10,'config'),
        g.ui.addcomponent(rt.st_resetscore,11,'config'),
        g.ui.addcomponent(rt.kb_toggleui,101,'controls',null,'controls'),

        // g.ui.addcomponent(rt.test1,'config'),
        // g.ui.addcomponent(rt.test2,'config'),
        // g.ui.addcomponent(rt.test3,'config'),
        // g.ui.addcomponent(rt.test4,'config'),
        // g.ui.addcomponent(rt.test5,'controls','controls','controls'),
        // g.ui.addcomponent(rt.test6,'controls',null,'controls'),

        // rt.test4=g.ui.makebttn('Test button 2',e=>g.io.log('Pressed button',e),'Test label'),
        // g.ui.addcomponent(rt.test4,'controls',g.ui.inputtypes[1],'controls'),

        // Start loop roadtime
        setInterval(_=>(
            // check if ui is hidden
            rt.hidden?0:(
                // check if debug menu is open
                !g.hasdebugopen()?g.err(`Debug menu needs to be open for the script to properly work. Please press ${g.ls.keybind('ToggleDebug','F3')} once to open it. 
                    You can toggle the visibility with ${g.ui.km.getbind('debug')}.`)
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

        //---------------------------------------------------------------------------------
        // WHEEL DRIVE SWITCHER
        wd={wdst:'Drive Mode',menu:'config'},

        wd.getstate=async _=>await g.ui.changemenu(_=>wd.parse(g.ui.getvalue(g.ui.getsetting(wd.wdst))),wd.menu),
        wd.switchstate=async _=>await g.ui.changemenu(async _=>{var _s=g.ui.getsetting(wd.wdst);var _v=wd.parse(g.ui.getvalue(_s))?0:1;await g.ui.setvalue(_s,_v);return _v},wd.menu),
        wd.parse=v=>v.includes('All')?0:v.includes('Front')?1:2,
        wd.disp=x=>!x?'AWD':x==1?'FWD':'RWD',
        wd.update=v=>(wd.wddiv[g.it]=wd.disp(v),g.io.log('Updated! ',v,wd.disp(v))),

        // add event listener when menu is opened
        wd.updatelistener=async _=>g.ui.m_unlocked?(
            wd.entry=g.ui.getsetting(wd.wdst),
            wd.entry&&g.io.msedn(async _=>(g.io.log('Wheel drive changed! Syncing...',wd.entry,g.ui.getvalue(wd.entry)),await g.wait(1),wd.update(wd.parse(g.ui.getvalue(wd.entry)))),wd.entry)
        ):0,
        g.ui.out.addcallback(wd.updatelistener,wd.menu),

        // Set up UI wheel drive
        (wd.ui=g.div()).style=g.style+'top:0;right:80px',
        (wd.wddiv=g.div()).style='padding:5px',
        wd.update(await wd.getstate()),
        wd.ui[g.ap](wd.wddiv),
        g.bd[g.ap](wd.ui),
        g.ui.addui(wd.ui),

        wd.kb_toggleui=g.ui.makeinputbind('Wheel Drive Display','wd_display',{key:'Digit2',mouse:null,pad:null},
            (ev,name)=>g.io.tvis(wd.ui),
            'Toggle the visiblity of the Wheel Drive Display.'),
        wd.kb_switchdrive=g.ui.makeinputbind('Switch Drive','switch_drive',{key:'KeyO',mouse:null,pad:null},
            async(ev,name)=>wd.update(await wd.switchstate()),
            'Switch between drive settings. Toggles between AWD and FWD'),

        g.ui.addcomponent(wd.kb_switchdrive,20,'controls',null,'controls'),
        g.ui.addcomponent(wd.kb_toggleui,102,'controls',null,'controls'),

        //----------------------------------------------------------------------------------
        // BOOST STATE DISPLAY
        bs={state:!1,kydn:!1,tmode:!1},

        // Set up UI Boost state display
        (bs.ui=g.div()).style=g.style+'top:0;right:115px;padding:5px',
        g.ui.addui(bs.ui),
        bs.ui[g.it]='BOOST OFF',

        bs.kb_toggleui=g.ui.makeinputbind('Boost State Display','bs_display',{key:'Digit3',mouse:null,pad:null},
            (ev,name)=>g.io.tvis(bs.ui),
            'Toggle the visibility of the Boost State Display.'),
        g.ui.addcomponent(bs.kb_toggleui,103,'controls',null,'controls'),
        


        g.io.kydn(e=>((_m=g.ls.boosttoggled())!=bs.tmode?(bs.state=!1,bs.tmode=_m):0,e.code==g.ls.keybind('Boost','ShiftLeft')?_m?!bs.kydn?bs.ui[g.it]=(bs.kydn=!0,bs.state=!bs.state)?'BOOST ON':'BOOST OFF':0:bs.ui[g.it]='BOOST ON':0)),
        g.io.kyup(e=>e.code==g.ls.keybind('Boost','ShiftLeft')?g.ls.boosttoggled()?bs.kydn=!1:bs.ui[g.it]='BOOST OFF':0),
        // g.io.kydn(e=>e.code===g.ls.keybind('Reset','KeyR')&&bs.tmode?(bs.state=!1,bs.div[g.it]='BOOST OFF'):0),

        await g.wait(100),
        g.err('SCRIPT READY',2e3)
        
):undefined)()