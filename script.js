(async _=>
    typeof __a=='undefined'?(
        // Setup global functions
        __a=0,
        g={it:'innerText',qs:'querySelector',qsa:'querySelectorAll',ap:'appendChild',de:'dispatchEvent',D:_=>new Date(),ls:localStorage,fl:Math.floor,wait:t=>new Promise(r=>setTimeout(r,t))},
        g.l=(g.dc=document)[g.qs]("#upcoming-container polyline"),
        //function that returns coords of player: [x, y]
        g.p=_=>[(_x=g.dc[g.qs]("#ui-debug-position")[g.it].split("x"))[0],_x[1].split(" ")[2].split("z")[0]],
        //function that returns the distance travelled
        g.d=_=>parseInt(g.dc[g.qs]('#ui-debug-node')[g.it])/100,
        g.div=_=>g.dc.createElement("div"),
        g.bd=g.dc.body,
        g.ael=(t,e)=>g.bd.addEventListener(t,e),
        g.kydn=e=>g.ael('keydown',e),
        g.kyup=e=>g.ael('keyup',e),
        g.tvis=(k,el)=>g.kydn(e=>e.code===k?el.style.display=el.style.display=='none'?'block':'none':0),
        g.paused=_=>g.dc[g.qs]('#game-paused').style.display=='block',
        g.keyev=(t,ko)=>new KeyboardEvent(t,ko),
        g.mouseev=(t,ko)=>new MouseEvent(t,ko),
        g.fakekey=async(ko,el)=>(el[g.de](g.keyev('keydown',ko)),el[g.de](g.keyev('keypress',ko)),await g.wait(1),el[g.de](g.keyev('keyup',ko))),
        // g.fakemouse=(ko,el)=>(1),
        g.fakemseover=(el,ko={bubbles:!0})=>(el[g.de](g.mouseev('mouseover',ko))),
        g.openmenu=async(m,o)=>(g.fakemseover(g.dc[g.qsa]('#menu-bar-right>.menu-item')[m]),await g.wait(1)),

        g.lsget=k=>JSON.parse(g.ls.getItem(k)),
        g.lsset=(k,v)=>g.ls.setItem(k,JSON.stringify(v)),
        g.evroot=g.dc[g.qs]('#game-main'),
        g.uidebug=g.dc[g.qs]('#ui-debug'),
        g.fpscnt=Array.from(g.dc[g.qsa]('body>div')).filter(x=>!x.id&&x.style['z-index']==1e4)[0],

        g.lsdflt=(n,k,d)=>(g.lsget(n)||{})[k]||d,
        g.keybind=(k,d)=>g.lsdflt('controls_keys',k,d),
        g.boosttoggled=_=>g.lsdflt('controls_keys_settings','toggleBoost',!1),
        g.kmap=g.lsget('modkeybinds')||{roadtime:'Digit1',wheelswitch:'Digit2',driveswitch:'KeyO',boostdisp:'Digit3',debug:'F2'},
        g.lsset('modkeybinds',g.kmap),

        //open and hide debug menus
        await g.fakekey({"code":g.keybind('ToggleDebug','F3')},g.evroot),
        g.uidebug.style.opacity=0,
        g.fpscnt.style.opacity=0,
        g.f3open=!1,
        // Add proxy F3 menu key (F2)
        g.kydn(e=>e.code===g.kmap.debug?(g.uidebug.style.opacity=g.fpscnt.style.opacity=(g.f3open=!g.f3open)?1:0):0),

        // Display hidden ms counter
        g.fpscnt.children[1].style.display='block',

        // Add ui for error messages
        g.style='display:none;position:absolute;z-index:20000;backdrop-filter:blur(10px);background:#66666666;color:white;',
        (g.errdiv=g.div()).style=g.style+'left:0;top:50%;max-width:300px;padding:5px',
        g.bd[g.ap](g.errdiv),
        g.errtocode=0,
        // Function that displays an error for a certain time  (or until another error overrides it)
        g.err=(e,t=1500)=>(clearTimeout(g.errtocode),g.errdiv[g.it]=e,g.errdiv.style.display='block',g.errtocode=setTimeout(_=>g.errdiv.style.display='none',t)),

        // wait a hot second to let engine catch up (otherwise the F3 menu isn't open yet)
        g.wait(1000),
        g.err('SCRIPT READY',2e3),

        // ROADTIME
        // rt={sd:g.D(),ds:g.d(),hs:g.lsget('modrt_hs')||0,hsdist:g.lsget('modrt_hsdist')||0,reset:0},
        rt={sd:g.D(),ds:g.d(),hs:0,hsdist:0,reset:0,started:!1,paused:!1,saveddist:0,savedtime:0},

        // Set up UI roadtime
        (rt.ui=g.div()).style=g.style+'left:50%;top:0;min-width:300px',
        // create div and add to container
        _ad=_=>(_x=g.div(),_x.style='padding:5px',rt.ui[g.ap](_x),_x),
        rt.tdiv=_ad(),
        rt.ddiv=_ad(),
        (rt.hsdiv=_ad())[g.it]='Highscore time: -',
        (rt.dhsdiv=_ad())[g.it]='Highscore distance: -',
        g.bd[g.ap](rt.ui),

        // Start loop roadtime
        setInterval(_=>(
            // check if debug menu is open
            g.uidebug.style.display=='none'?g.err(`Debug menu needs to be open for the script to properly work. Please press ${g.keybind('ToggleDebug','F3')} once to open it. You can toggle the visibility with ${g.kmap.debug}.`):0,
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
                ?(rt.sd=g.D(),rt.ds=g.d(),rt.saveddist=0,rt.savedtime=0,rt.ddiv[g.it]='Distance: -',rt.tdiv[g.it]=rt.reset||!rt.started?(rt.reset=0,"RESETTING"):"OFF ROAD")
                :(rt.tdiv[g.it]=`Time on road: ${_s}`,rt.ddiv[g.it]=`Distance: ${_dist.toFixed(2)}km`,
                _sc>rt.hs?(rt.hs=_sc,rt.hsdiv[g.it]=`Highscore time: ${_s}`):0,
                _dist>rt.hsdist?(rt.hsdist=_dist,rt.dhsdiv[g.it]=`Highscore distance: ${_dist.toFixed(2)}km`):0)
        ),16), //16 = 1000/60fps
        // catch the reset key press, and driving keys
        g.kydn(e=>(rt.reset=e.code===g.keybind('Reset','KeyR'))?rt.started=!1:['ArrowUp','ArrowDown',g.keybind('Forward','KeyW'),g.keybind('Backward','KeyS')].includes(e.code)?rt.started=!0:0),
        // toggle visibility of ui with '1' key
        g.tvis(g.kmap.roadtime,rt.ui),

        // WHEEL DRIVE SWITCHER
        wd={awd:0,in:null},

        // Set up UI wheel drive
        (wd.ui=g.div()).style=g.style+'top:0;right:80px',
        (wd.wddiv=g.div()).style='padding:5px',
        wd.wddiv[g.it]='AWD',
        wd.ui[g.ap](wd.wddiv),
        g.bd[g.ap](wd.ui),

        // toggle visibility of ui with '2' key
        g.tvis(g.kmap.wheelswitch,wd.ui),

        // toggle between awd and fwd
        g.kydn(e=>
            e.code===g.kmap.driveswitch?
                (console.log('key pressed'),wd.in=document.querySelector('.settings-input-list :nth-child(12)'),
                wd.in!==null?
                    (_x=wd.in.children[1].children,_x.length>1?
                        _x[1].children[/All/i.test(wd.in[g.it])?1:0].click() // Change to imitate event instead
                        :g.err('Menu is not open. Hover over the drive selection dropdown before trying again')
                ):0
            ):0
        ),
        // event needed to open a menu (as long as it is dispatched from the desired menu button)
        // x = new MouseEvent('mouseover',{bubbles:true})

        // BOOST STATE DISPLAY
        bs={state:!1,kydn:!1,tmode:!1},
        (bs.div=g.div()).style=g.style+'top:0;right:120px;padding:5px',
        g.bd[g.ap](bs.div),
        bs.div[g.it]='BOOST OFF',

        g.kydn(e=>((_m=g.boosttoggled())!=bs.tmode?(bs.state=!1,bs.tmode=_m):0,e.code==g.keybind('Boost','ShiftLeft')?_m?!bs.kydn?bs.div[g.it]=(bs.kydn=!0,bs.state=!bs.state)?'BOOST ON':'BOOST OFF':0:bs.div[g.it]='BOOST ON':0)),
        g.kyup(e=>e.code==g.keybind('Boost','ShiftLeft')?g.boosttoggled()?bs.kydn=!1:bs.div[g.it]='BOOST OFF':0),
        // g.kydn(e=>e.code===g.keybind('Reset','KeyR')&&bs.tmode?(bs.state=!1,bs.div[g.it]='BOOST OFF'):0),

        g.tvis(g.kmap.boostdisp,bs.div)
        
):undefined)()

// settingsicon.dispatchEvent(hover);
// wait(10);
// drive=document.querySelector('.settings-input-list :nth-child(12) .settings-input-enum');
// drive.dispatchEvent(hover);
// wait(10);
// option=drive.querySelector('.settings-input-enum_options').children[state=state>1?1:2];
// option.dispatchEvent(mousedown);
// wait(10);
// root.dispatchEvent(mousemove);


