(async _=>
    typeof __a=='undefined'?(
        // Setup global functions
        __a=0,
        g={it:'innerText',qs:'querySelector',qsa:'querySelectorAll',ap:'appendChild',de:'dispatchEvent',cn:'className',ael:'addEventListener',se:'settings-input-row mod-entry',D:_=>new Date(),ls:localStorage,fl:Math.floor,wait:t=>new Promise(r=>setTimeout(r,t))},
        g.l=(g.dc=document)[g.qs]("#upcoming-container polyline"),
        //function that returns coords of player: [x, y]
        g.p=_=>[(_x=g.dc[g.qs]("#ui-debug-position")[g.it].split("x"))[0],_x[1].split(" ")[2].split("z")[0]],
        //function that returns the distance travelled
        g.d=_=>parseInt(g.dc[g.qs]('#ui-debug-node')[g.it])/100,
        g.div=_=>g.dc.createElement("div"),
        g.addui=e=>(e.className='mod-ui',g.bd[g.ap](e)),
        g.bd=g.dc.body,
        g.aelb=(t,e)=>g.bd[g.ael](t,e),
        g.kydn=e=>g.aelb('keydown',e),
        g.kyup=e=>g.aelb('keyup',e),
        g.tvis=(k,el)=>g.kydn(e=>e.code===k?el.style.display=el.style.display=='none'?'block':'none':0),
        g.uivis=!0,
        g.uitoggle=!1,
        g.tvisall=_=>(g.uivis=!g.uivis,g.dc[g.qsa]('.mod-ui').forEach(x=>x.style.opacity=g.uivis?1:0)),
        g.paused=_=>g.dc[g.qs]('#game-paused').style.display=='block',
        g.keyev=(t,ko={bubbles:!0})=>new KeyboardEvent(t,ko),
        g.mouseev=(t,ko={bubbles:!0})=>new MouseEvent(t,ko),
        g.fakekey=async(ko,el)=>(el[g.de](g.keyev('keydown',ko)),el[g.de](g.keyev('keypress',ko)),await g.wait(1),el[g.de](g.keyev('keyup',ko))),
        g.fakemseev=(t,el,ko)=>el[g.de](g.mouseev(t,ko)),
        g.fakemseover=(el,ko)=>g.fakemseev('mouseover',el,ko),
        g.fakeclk=(el,ko)=>g.fakemseev('mousedown',el,ko),
        g.m_unlocked=!1,
        g.menulock=s=>g.m_unlocked=g.dc[g.qs]('#menu-bar-right').style.opacity=s?0:1,
        g.getmenu=m=>g.dc[g.qsa]('#menu-bar-right>.menu-item')[m],
        g.getstoption=s=>g.dc[g.qs](`.settings-input-list :not(.mod-entry):nth-child(${s}) .settings-input-enum`),
        g.openst=(m,s)=>(g.menulock(1),g.fakemseover(g.getmenu(m)),g.fakemseover(_x=g.getstoption(s)),_x),
        g.exitst=_=>(g.fakeclk(g.dc[g.qs]('#input-blocker')),g.menulock(0)),
        // only works with dropdowns
        // get value of setting passed in m
        g.getst=m=>m.firstChild.nodeValue,
        // set the value of setting passed in m
        g.setst=(m,o)=>g.fakeclk(m[g.qs]('.settings-input-enum_options').children[o]),

        g.lsget=k=>JSON.parse(g.ls.getItem(k)),
        g.lsset=(k,v)=>g.ls.setItem(k,JSON.stringify(v)),
        g.evroot=g.dc[g.qs]('#game-main'),
        g.uidebug=g.dc[g.qs]('#ui-debug'),
        g.fpscnt=Array.from(g.dc[g.qsa]('body>div')).filter(x=>!x.id&&x.style['z-index']==1e4)[0],

        g.lsdflt=(n,k,d)=>(g.lsget(n)||{})[k]||d,
        g.keybind=(k,d)=>g.lsdflt('controls_keys',k,d),
        g.boosttoggled=_=>g.lsdflt('controls_keys_settings','toggleBoost',!1),

        g.css=g.dc.head[g.qs]('link[rel="stylesheet"]').sheet,


        // Set up settings UI for mod
        // g.st={opt:[]},
        // g.st.menu=g.getmenu(3),
        // g.st.add=(n,o,d)=>0,
        // g.st.makesection=(s,n)=>((_d=g.div())[g.cn]=g.se+' settings-input-list_section collapsible',(_t=g.div())[g.cn]='collapsible-title',_t[g.it]=n,(_c=g.div())[g.cn]='collapsible-cross',_c[g.it]='-',_d[g.ap](_t),_d[g.ap](_c),s.prepend(_d),_d),
        // g.st.makeentry=(s,n,o,d)=>((_d=g.div())[g.cn]=g.se,s.prepend(_d),_d),
        // g.st.draw=_=>(_s=g.dc[g.qs]('.settings-input-list')),
        
        // Set up keybinds settings for mod
        // instead save when settings change + reset button
        // g.lsset('modkeybinds',g.km.b),
        g.km={lsname:'modkeybinds',default:{'Road Time Display':'Digit1','Drive Switch Display':'Digit2','Switch Drive':'KeyO','Boost Display':'Digit3','Debug':'F2'}},
        (g.km.todefault=_=>g.km.b=g.lsget(g.km.lsname)||(_x={},Object.entries(g.km.default).forEach(x=>_x[x[0]]=x[1]),_x))(),
        // The order that the properties are displayed in the settings (reversed because it is added in reverse order)
        g.km.order=['Road Time Display','Drive Switch Display','Boost Display','Switch Drive','Debug'].reverse(),
        // Select the keybinds menu icon
        g.km.menu=g.getmenu(3),
        // Set a keybind and sync to local storage
        g.km.setkey=(k,v)=>(g.km.b[k]=v,g.lsset(g.km.lsname,g.km.b)),
        // stores the label and field of the field being edited
        g.km.ed=['',null],
        g.km.stopedit=_=>(_l=g.km.ed[0])!=''?((_f=g.km.ed[1])[g.it]=g.km.b[_l],_f.classList.remove('settings-input-signal-reset'),g.km.ed=['',null]):0,
        // Start editing the selected field; if the field was already being edited, stop editing instead. If another field is already being edited, stop editing that first.
        g.km.beginedit=(l,f)=>g.km.ed[0]!=l[g.it]?(g.km.stopedit(),f[g.it]='press any key...',f.classList.add('settings-input-signal-reset'),f.focus(),g.km.ed=[l[g.it],f]):g.km.stopedit(),
        g.km.aelbeginedit=(l,f)=>f[g.ael]('mousedown',e=>g.km.beginedit(l,f)),
        g.km.edit=e=>g.km.ed[1]?(console.log(e.code),g.km.setkey(e.code),g.km.ed[1][g.it]=e.code,g.km.stopedit()):0,
        g.km.aeledit=f=>f[g.ael]('keydown',g.km.edit),
        // Add listener for clear button
        g.km.aelclear=(c,l,f)=>c[g.ael]('mousedown',e=>(g.km.stopedit(),f[g.it]='',g.km.setkey(l[g.it],''))),
        // Create entry with a name and value, and prepend to settings
        g.km.makeentry=(s,n,v)=>((_e=g.div())[g.cn]=g.se,(_l=g.div())[g.cn]='settings-input-label',_l[g.it]=n,(_c=g.div())[g.cn]='settings-input-signal-clear',_c[g.it]='x',(_i=g.div())[g.cn]='settings-input-signal',_i.title='Click to remap',_i[g.it]=v,
            _i.tabIndex=-1,g.km.aelclear(_c,_l,_i),g.km.aelbeginedit(_l,_i),g.km.aeledit(_i),_e[g.ap](_l),_e[g.ap](_c),_e[g.ap](_i),s.prepend(_e),_e),
        // Reset all keybinds to default values and delete the local storage entry
        g.km.reset=_=>(g.km.stopedit(),g.km.todefault(),g.dc[g.qsa]('.settings-input-row.mod-entry .settings-input-signal').forEach((x,i)=>x[g.it]=g.km.default[g.km.order[g.km.order.length-i-1]]),g.ls.removeItem(g.km.lsname)),
        // Create reset button, and prepend to settings
        g.km.resetbttn=s=>((_e=g.div())[g.cn]=g.se,_e.id='resetbttn',_e[g.it]='Reset mod keybinds',_e[g.ael]('mousedown',e=>g.km.reset()),s.prepend(_e),_e),
        // add styling for the reset button
        g.css.insertRule('#resetbttn:hover{background:#3b3b3b;}'),
        g.css.insertRule('#resetbttn{display:flex;align-items:center;justify-content:center;}'),
        // TODO add event listeners
        // Draw all keybind options for the mod
        g.km.draw=_=>(_s=g.dc[g.qs]('.settings-input-list'),_r=g.km.resetbttn(_s),g.km.order.forEach(x=>g.km.makeentry(_s,x,g.km.default[x])),0),

        // Add event listeners to test for opening keybinds menu and swapping of tabs
        //
        // Check if in both the correct tab and the correct input type (keyboard), and check if the elements aren't already present
        // Also add an event listener to the tab and input type switch while the menu is open
        g.km.chkupdate=async _=>(await g.wait(10),(_o=g.bd[g.qs]('.settings-sidebar_options'))&&_o[g.ael]('mousedown',g.km.chkupdate),(_t=g.bd[g.qs]('.settings-sidebar_tabs'))&&_t[g.ael]('mousedown',g.km.chkupdate),
            g.dc[g.qs]('.settings-sidebar_tab.option-selected:first-child')&&g.dc[g.qs]('.settings-sidebar_option.option-selected:first-child')&&!g.dc[g.qs]('#resetbttn')?g.km.draw():0),
        g.km.menu[g.ael]('mousedown',g.km.chkupdate),
        g.km.menu[g.ael]('mouseover',g.km.chkupdate),


        //open and hide debug menus
        await g.fakekey({"code":g.keybind('ToggleDebug','F3')},g.evroot),
        g.uidebug.style.opacity=0,
        g.fpscnt.style.opacity=0,
        g.f3open=!1,
        // Add proxy F3 menu key (F2)
        g.kydn(e=>e.code===g.km.b['Debug']?(g.uidebug.style.opacity=g.fpscnt.style.opacity=(g.f3open=!g.f3open)?1:0):0),

        // Toggle ui visibility when pressing hide/show ui button (default: U)
        g.kydn(e=>e.code==g.keybind('ToggleUI','KeyU')&&!g.uitoggle?(g.uitoggle=!0,g.tvisall()):0),
        g.kyup(e=>e.code==g.keybind('ToggleUI','KeyU')?g.uitoggle=!1:0),

        // Display hidden ms counter
        g.fpscnt.children[1].style.display='block',

        // Add ui for error messages
        g.style='display:none;position:absolute;z-index:999;backdrop-filter:blur(10px);background:#66666666;color:white;',
        (g.errdiv=g.div()).style=g.style+'left:0;top:50%;max-width:300px;padding:5px',
        g.addui(g.errdiv),
        g.errtocode=0,
        // Function that displays an error for a certain time  (or until another error overrides it)
        g.err=(e,t=1500)=>(clearTimeout(g.errtocode),g.errdiv[g.it]=e,g.errdiv.style.display='block',g.errtocode=setTimeout(_=>g.errdiv.style.display='none',t)),

        // wait a hot second to let engine catch up (otherwise the F3 menu isn't open yet)
        await g.wait(1000),

        // ROADTIME
        rt={sd:g.D(),ds:g.d(),hs:g.lsget('modrt_hs')||0,hsdist:g.lsget('modrt_hsdist')||0,reset:0,started:!1,paused:!1,saveddist:0,savedtime:0},
        // rt={sd:g.D(),ds:g.d(),hs:0,hsdist:0,reset:0,started:!1,paused:!1,saveddist:0,savedtime:0},

        // Set up UI roadtime
        (rt.ui=g.div()).style=g.style+'left:50%;top:0;width:300px',
        // create div and add to container
        _ad=_=>(_x=g.div(),_x.style='padding:5px',rt.ui[g.ap](_x),_x),
        rt.tdiv=_ad(),
        rt.ddiv=_ad(),
        (rt.hsdiv=_ad())[g.it]='Highscore time: -',
        (rt.dhsdiv=_ad())[g.it]='Highscore distance: -',
        g.addui(rt.ui),

        // Start loop roadtime
        setInterval(_=>(
            // check if debug menu is open
            g.uidebug.style.display=='none'?g.err(`Debug menu needs to be open for the script to properly work. Please press ${g.keybind('ToggleDebug','F3')} once to open it. You can toggle the visibility with ${g.km.b['Debug']}.`):0,
            // calculate distance to road line
            _p=g.p(),
            _r=g.l.points,
            _a=-_r[0].y+_r[1].y,
            _b=_r[0].x-_r[1].x,
            _d=Math.abs(_a*_p[0]+_b*_p[1]-_a*_r[0].x-_b*_r[0].y)/Math.sqrt(_a*_a+_b*_b),
            // Calculate distance and time on road
            _dist=rt.saveddist+Math.round((g.d()-rt.ds)*100)/100,
            _sc=g.D()-rt.sd+rt.savedtime,
            // Save the distance and time on pause, and keep dist+time frozen during pause
            g.paused()?(!rt.paused?(rt.saveddist=_dist,rt.savedtime=_sc,rt.paused=!0):0,rt.sd=g.D(),rt.ds=g.d(),_dist=rt.saveddist,_sc=rt.savedtime):rt.paused=!1,
            // parse time
            _s=`${(_v=_sc,_v-=(_hh=g.fl(_v/36e5))*36e5),_hh}:${(_v-=(_m=g.fl(_v/6e4))*6e4),('0'+_m).slice(-2)}:${('0'+g.fl(_v/1e3)).slice(-2)}`,
            // write output
            rt.reset||_d>3.2||!rt.started
                ?(rt.sd=g.D(),rt.ds=g.d(),rt.saveddist=0,rt.savedtime=0,rt.ddiv[g.it]='Distance: -',rt.tdiv[g.it]=rt.reset||!rt.started?(rt.reset=0,"RESETTING... Start driving to begin the timer."):"OFF ROAD")
                :(rt.tdiv[g.it]=`Time on road: ${_s}`,rt.ddiv[g.it]=`Distance: ${_dist.toFixed(2)}km`,
                _sc>rt.hs?(rt.hs=_sc,rt.hsdiv[g.it]=`Highscore time: ${_s}`,g.lsset('modrt_hs',_s)):0,
                _dist>rt.hsdist?(rt.hsdist=_dist,rt.dhsdiv[g.it]=`Highscore distance: ${_dist.toFixed(2)}km`,g.lsset('modrs_hsdist',_dist)):0)
        ),16), //16 = 1000/60fps
        // catch the reset key press, and driving keys
        g.kydn(e=>(rt.reset=e.code===g.keybind('Reset','KeyR'))?rt.started=!1:['ArrowUp','ArrowDown',g.keybind('Forward','KeyW'),g.keybind('Backward','KeyS')].includes(e.code)?rt.started=!0:0),
        // toggle visibility of ui with '1' key
        g.tvis(g.km.b['Road Time Display'],rt.ui),

        // WHEEL DRIVE SWITCHER
        wd={},

        wd.parse=s=>s.includes('All')?0:s.includes('Front')?1:2,
        wd.getstate=_=>(_s=wd.parse(g.getst(g.openst(4,12))),g.exitst(),_s),
        wd.switchstate=_=>(_s=g.getst(_x=g.openst(4,12)),g.setst(_x,_v=_s.includes('All')?1:0),g.exitst(),_v),
        wd.disp=x=>!x?'AWD':x==1?'FWD':'RWD',
        wd.update=s=>wd.wddiv[g.it]=wd.disp(s),

        // add event listener when menu is opened
        wd.menu=g.getmenu(4),
        wd.updatelistener=async _=>g.m_unlocked?(await g.wait(100),(wd.entry=g.getstoption(12))&&wd.entry[g.ael](
            'mousedown',async _=>(await g.wait(10),wd.update(wd.parse(g.getst(wd.entry))))
        )):0,
        wd.menu[g.ael]('mouseover',wd.updatelistener),
        wd.menu[g.ael]('mousedown',wd.updatelistener),

        // Set up UI wheel drive
        (wd.ui=g.div()).style=g.style+'top:0;right:80px',
        (wd.wddiv=g.div()).style='padding:5px',
        wd.wddiv[g.it]=wd.disp(wd.getstate()),
        wd.ui[g.ap](wd.wddiv),
        g.bd[g.ap](wd.ui),
        g.addui(wd.ui),

        // toggle between awd and fwd
        g.kydn(e=>e.code==g.km.b['Switch Drive']?wd.update(wd.switchstate()):0),

        g.tvis(g.km.b['Drive Switch Display'],wd.ui),

        // BOOST STATE DISPLAY
        bs={state:!1,kydn:!1,tmode:!1},
        (bs.ui=g.div()).style=g.style+'top:0;right:115px;padding:5px',
        g.addui(bs.ui),
        bs.ui[g.it]='BOOST OFF',

        g.kydn(e=>((_m=g.boosttoggled())!=bs.tmode?(bs.state=!1,bs.tmode=_m):0,e.code==g.keybind('Boost','ShiftLeft')?_m?!bs.kydn?bs.ui[g.it]=(bs.kydn=!0,bs.state=!bs.state)?'BOOST ON':'BOOST OFF':0:bs.ui[g.it]='BOOST ON':0)),
        g.kyup(e=>e.code==g.keybind('Boost','ShiftLeft')?g.boosttoggled()?bs.kydn=!1:bs.ui[g.it]='BOOST OFF':0),
        // g.kydn(e=>e.code===g.keybind('Reset','KeyR')&&bs.tmode?(bs.state=!1,bs.div[g.it]='BOOST OFF'):0),

        g.tvis(g.km.b['Boost Display'],bs.ui),

        await g.wait(100),
        g.err('SCRIPT READY',2e3)
        
):undefined)()