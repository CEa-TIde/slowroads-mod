// ------------------------------------------------------
// START local Storage Handler
// ------------------------------------------------------


const StorageHandler = {
    // local storage values. Populated after calling `fetchAllFromStorage()`
    values : {
        profile : null, // [...]
        audio : null, // [...]
        gamepad : null, // steerSmoothing, steerRange, linearity, deadzone, autoBoost, controllerIndex, mapping
        gameplay : null, // [...], touchscreen, [...]
        graphics : null, // [...]
        keyboard : null, // toggleBoost, doubleTapBoost, softSteer, steerSpeed, recenterSpeed, lockedSteerSpeed, mapping
        mouse : null, // useMouse, steerBarWidth, clickInputMode, [...], smoothing, linearity, doubleClickBoost, doubleClickInterval, currentSteer, mapping
        scene : null, // [...]
        touch : null, // touchStyle
        vehicle : null, // [...]
        world : null, // [...]
        worldHistory : null, // [...]
    },

    // defaults populated below.
    defaults : {},

    localStorageToObjectMap : {
        "profile": "profile",
        "settings_Audio": "audio",
        "settings_Gamepad": "gamepad",
        "settings_Gameplay": "gameplay",
        "settings_Graphics": "graphics",
        "settings_Keys": "keyboard",
        "settings_Mouse": "mouse",
        "settings_Scene": "scene",
        "settings_Touch": "touch",
        "settings_Vehicle": "vehicle",
        "settings_World": "world",
        "settings_WorldHistory": "worldHistory",
        // anything else returns undefined
    },

    /**
     * Fetch all values from local storage and store in `this.values`.
     * If no localstorage-to-object mapping is defined (see above), it skips over the entry.
     */
    fetchAllFromStorage : function() {
        for (let i = 0, len = localStorage.length; i < len; i++) {
            let storageKey = localStorage.key(i);
            let objectKey = this.localStorageToObjectMap[storageKey];
            if (!objectKey) {
                console.warn(`The localstorage key "${storageKey}" is not tracked.`);
                continue;
            }
            let val = this.getFromLocalStorage(storageKey);
            if (null === val) val = this.defaults[objectKey];
            if (val) this.values[objectKey] = val;
        }
    },

    getOrDefault: function(key) {
        if (this.values[key]) return this.values[key];
        if (this.defaults[key]) return this.defaults[key];
        throw new EvalError("No value or default value found for key: ", key);
    },

    /**
     * Fetch an object-string from Local Storage and parse it.
     * @param {*} key 
     * @returns 
     */
    getFromLocalStorage: function(key) {
        return JSON.parse(localStorage.getItem(key));
    },


    /**
     * Check what has been changed in the default values since the last time
     * 
     * ***MAKE SURE TO CLEAR STORAGE DATA FIRST BEFORE RUNNING***
     */
    checkDiffOnDefaults: function() {
        // fetch from local storage
        this.fetchAllFromStorage();
        let keys = Object.keys(this.values);
        console.log(keys);

        // loop over object keys and compare to defaults
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (!this.defaults[key]) {
                console.error(`Default for key is missing: ${key}`);
                continue;
            }

            if (null === this.values[key]) {
                console.warn(`values.${key} is null. Skipping comparison.`);
                continue;
            }
            if (["profile", "worldHistory", "world"].includes(key))
                console.warn(
                    `This property (${key}) contains a volatile key name or value and may not be compared properly. 
                    Mark those entries with IGNORE_STORAGE_ENTRY.[type] and it should test if it is equal except for that property. Potential caveat: other data types?`
                );

            if (!this.object_equals(this.defaults[key], this.values[key])) {
                console.error(`For ${key} the objects aren't equal. Defaults / Values:`);
                console.log(this.defaults[key], this.values[key]);
                continue;
            }
            console.log(`No differences found for: ${ key }`);
        }
    },

    // adapted from: https://stackoverflow.com/a/6713782
    object_equals: function(defaults, values) {
        let hasIgnoreSetForKey = false;

        if (defaults === values) return true;
        // if both x and y are null or undefined and exactly the same

        if (!(defaults instanceof Object) || !(values instanceof Object)) return false;
        // if they are not strictly equal, they both need to be Objects

        if (defaults.constructor !== values.constructor) return false;
        // they must have the exact same prototype chain, the closest we can do is
        // test there constructor.

        for (var p in defaults) {
            if (!defaults.hasOwnProperty(p)) continue;
            // other properties were tested using x.constructor === y.constructor


            // ignore key if marked with IGNORE_ENTRY.key()
            if (typeof p !== "symbol" && p.startsWith(IGNORE_STORAGE_ENTRY.__KEY_PREFIX__)) {
                hasIgnoreSetForKey = true;
                console.warn(`Ignoring object key (and its value) marked with IGNORE_STORAGE_ENTRY.key: ${p}`);
                continue;
            }

            // ignore value if marked with an IGNORE_ENTRY.[TYPE]
            // unless undefined, symbol or boolean; as those cannot be compared without false positives (because real values could be plausibly the same)
            let type = typeof defaults[p];
            if (!["undefined", "boolean", "symbol"].includes(type) && defaults[p] === IGNORE_STORAGE_ENTRY[type]) {
                console.warn(`Ignoring entry marked with IGNORE_STORAGE_ENTRY.${type}: ${p}`);
                continue;
            }

            if (!values.hasOwnProperty(p)) return false;
            // allows to compare x[ p ] and y[ p ] when set to undefined

            if (defaults[p] === values[p]) continue;
            // if they have the same strict value or identity then they are equal

            if (typeof (defaults[p]) !== "object") return false;
            // Numbers, Strings, Functions, Booleans must be strictly equal

            if (!object_equals(defaults[p], values[p])) return false;
            // Objects and Arrays must be tested recursively
        }

        for (p in values) {
            if (values.hasOwnProperty(p) && !defaults.hasOwnProperty(p)) {
                if (!hasIgnoreSetForKey) {
                    console.error(`Property (${p}) exists in values but not in defaults.`);
                    return false;
                }
                console.log(`Property (${p}) exists in values but not in defaults. This is assumed to be fine because a key was set to IGNORE_STORAGE_ENTRY.key()`);
            }
        }
        // allows x[ p ] to be set to undefined

        return true;
    },
};

// if a default value is equal to `IGNORE_ENTRY.[type]`, it should be ignored in the object comparison
const TIME_NOW = Date.now();
const IGNORE_STORAGE_ENTRY = {
    "number": TIME_NOW,
    "string": "IGNORE_309824309",
    "object": { "IGNORE": "this34509384503948" },
    "function": () => "IGNORE_34203498",
    "bigint": BigInt("2342394283409"),

    // special value for object keys so they are unique. Needs to be called before assigning.
    // index is automatically incremented due to scope magic
    __KEY_PREFIX__: "IGNORE_3223402",
    "key": (function() {
        let idx = 0; // set initial value outside inner function (but the variable is inside scope of inner function)
        return function() {
            idx++;
            return `${ this.__KEY_PREFIX__ }_${ idx })`;
        }
    })(),

    // no entries for undefined, boolean, and symbol
};




// ---------------------------------
// Populating default values:

StorageHandler.defaults.profile = {
    totalTime: 0,
    totalDist: 0,
    autodriveTime: 0,
    autodriveDist: 0,
    totalVisits: 1,
    firstVisit: IGNORE_STORAGE_ENTRY.number,
    longestDrive: 0,
    furthestDrive: 0,
    achievements: {},
    flags: {
        hasSeenSettings: false,
        hasSeenGraphicsWarning: false,
        hasSeenReset: false,
        hasSeenBoost: false,
    },
};

StorageHandler.defaults.audio = {
    master: 0.5,
    ambient: 1,
    wind: 1,
    engine: 1,
    brakes: 1,
    roll: 1,
    skid: 1,
    collisions: "1.00", // why the string?
};

StorageHandler.defaults.gamepad = {
    steerSmoothing: 0.7,
    steerRange: 0.9,
    linearity: 0.25,
    deadzone: 5,
    autoBoost: false,
    controllerIndex: 0,
    mapping: {
        Forward:         { type: 0, index:  7 },
        Backward:        { type: 0, index:  6 },
        Left:            { type: 1, index:  0, sign: -1, max: 1 },
        Right:           { type: 1, index:  0, sign:  1, max: 1 },
        Boost:           { type: 0, index:  1 },
        Reset:           { type: 0, index:  3 },
        CameraMode:      { type: 0, index: 12 },
        NextScene:       { type: 0, index: 15 },
        PrevScene:       { type: 0, index: 14 },
        Autodrive:       { type: 0, index:  0 },
        Handbrake:       { type: 0, index:  5 },
        ToggleHandbrake: { type: 0, index:  4 },
        Headlights:      { type: 0, index: 13 },
        IncSpeedControl: null,
        DecSpeedControl: null,
        Mute: null,
        Pause: null,
        ToggleUI: null,
        ToggleSpeedControl: null,
    }
};

StorageHandler.defaults.gameplay = {
    units: 0,
    driveLane: 0,
    roadWidth: 0,
    cameraMode: 0,
    pauseOnMenu: true,
    pauseOnUnfocus: false,
    touchscreen: false,
    showDebug: false,
    barriersDisabled: false,
    showUpcomingRoad: 1,
    hideUI: false,
    verticalFov: 68,
    steerSpeedFactor: 0.75,
    hudPosition: 0,
};

StorageHandler.defaults.graphics = {
    viewDistance: 2,
    detail: 2,
    renderScale: 2,
    verticalFov: 68,
    cameraSmoothing: 0.3,
};

StorageHandler.defaults.keyboard = {
    toggleBoost: 0,
    doubleTapBoost: true,
    softSteer: 1,
    steerSpeed: 1,
    recenterSpeed: 2,
    lockedSteerSpeed: 0.6,
    mapping: {
        Forward: "KeyW",
        Backward: "KeyS",
        Left: "KeyA",
        Right: "KeyD",
        Boost: "ShiftLeft",
        Reset: "KeyR",
        CameraMode: "KeyC",
        NextScene: "KeyE",
        PrevScene: "KeyQ",
        Autodrive: "KeyF",
        Handbrake: "Space",
        ToggleHandbrake: "KeyB",
        Headlights: "KeyH",
        StickySteer: "KeyV",
        IncSpeedControl: "KeyI",
        DecSpeedControl: "KeyK",
        Mute: "KeyM",
        Pause: "KeyP",
        ToggleUI: "KeyU",
        ToggleSpeedControl: "KeyZ",
        ToggleCinecam: "KeyT",
        ToggleDebug: "F4",
    }
};

StorageHandler.defaults.mouse = {
    useMouse: false,
    steerBarWidth: 0.5,
    clickInputMode: 0,
    showSteerIndicator: true,
    smoothing: 0.25,
    linearity: 0.35,
    doubleClickBoost: true,
    doubleClickInterval: 0.15,
    currentSteer: 0,
    mapping: {
        Forward: 0,
        Backward: 2,
        Left: null,
        Right: null,
        Boost: null,
        Reset: null,
        CameraMode: null,
        NextScene: null,
        PrevScene: null,
        Handbrake: null,
        Headlights: null,
        Mute: null,
        Pause: null
    }
};

StorageHandler.defaults.scene = {
    scene: 0,
    savedConfigs: {
        Hills: {
            season: "summer",
            time: "day",
            weather: "clear",
            preset: 0,
        },
        OffWorld: {
            preset: 0,
        },
        Scandi: {
            preset: 0,
        },
    },
};

StorageHandler.defaults.touch = {
    touchStyle: 0,
};

StorageHandler.defaults.vehicle = {
    type: 0,
    mode: 0,
    driverSide: 1,
    seat: 0,
    steerRotationIndex: 2,
    steerRotation: 450,
    gripFactor: 1,
    speedFactor: 1,
    showWheel: true,
    seatAdjustment: 0,
    seatHeight: 0,
    autodriveSide: -1,
    autodriveSideIndex: 0,
    steerSpeedFactor: 0.75,
};

// no reliable default possible; should not be used
StorageHandler.defaults.world = {
    seed: IGNORE_STORAGE_ENTRY.string, //this is a random value as this will be different every time
    scene: 0,
    roadStyle: 2,
    startNode: 0,
    accumulatedDistance: 0,
};

// no reliable default possible; should not be used
StorageHandler.defaults.worldHistory = {
    // will be different each time
    history: {
        0: {
            2: {
                [IGNORE_STORAGE_ENTRY.key()]: {
                    ts: IGNORE_STORAGE_ENTRY.number,
                    startNode: 0,
                    accumulatedDistance: 0,
                } 
            }
        }
    },
};

//-------------------------------------------
// END local Storage Handler
// ----------------------------------------




//---------------------------------------------
// START Input Handler
//--------------------------------------------


const InputHandler = class {

    // DOM Element that all event listeners hook into
    eventHook;
    // function to call with the parsed input values
    #eventCallback;
    // list of connected gamepad indexes
    gamepadsConnected = [];
    #pollRequestCode; // value returned by requestAnimationFrame


    constructor(hookElement, eventCallback) {
        if (!(hookElement && hookElement instanceof Element)) throw new TypeError("Expected DOM Element for the hook.");
        this.eventHook = hookElement;
        
        if (typeof eventCallback !== "function") throw new TypeError("Expected function for eventCallback");
        this.#eventCallback = eventCallback;

        this.#addEventListeners(this.eventHook);
    }

    /**
     * multi-peripheral input class with reduced input-binds (only relevant to dashboard)
     */
    static Input = class {
        type;
        evType;
        peripheral;

        Forward;
        Backward;
        Left;
        Right;
        Boost;
        Autodrive;
        HandBrake;
        ToggleHandbrake;
        StickySteer;
        IncSpeedControl;
        DecSpeedControl;
        Pause;
        ToggleUI;
        ToggleCinecam;

        constructor() {}
    }


    // called when the user presses a key, uses a mouse, or other input.
    #inputEventHandler(ev) {

        if (["keyup", "keydown"].includes(ev.type)) {
            this.#keyboardEventHandler(ev);
        }

        if (["mousedown", "mouseup", "mousemove", "click", "dblclick"].includes(ev.type)) {
            this.#mouseEventHandler(ev);
        }
    }

    #keyboardEventHandler(ev) {
        let keyboardSettings = StorageHandler.getOrDefault("keyboard");

        let input = new Input();
        this.#parseKeyboardCode(input, ev.code, keyboardSettings.mapping);
        input.peripheral = "keyboard";
        input.evType = ev.type;

        if (ev.type === "keydown") {
            input.type = "down";
        }
        else if (ev.type === "keyup") {
            input.type = "up";
        }
        else {
            throw new EvalError("Unknown keyboard event");
        }
        

        this.#eventCallback(input);
    }

    #parseKeyboardCode(input, evCode, mapping) {
        switch (evCode) {
            case mapping.Forward:
            case "ArrowUp":
                input.Forward = 1; // TODO: assuming value 0 to 1 for now; for keyboard only 0 or 1
                break;
            case mapping.Backward:
            case "ArrowDown":
                input.Backward = 1;
                break;
            case mapping.Left:
            case "ArrowLeft":
                input.Left = 1;
                break;
            case mapping.Right:
            case "ArrowRight":
                input.Right = 1;
                break;
            case mapping.Boost:
                input.Boost = 1;
                break;
            case mapping.Autodrive:
                input.Autodrive = 1;
                break;
            case mapping.Handbrake:
                input.HandBrake = 1;
                break;
            case mapping.ToggleHandbrake:
                input.ToggleHandbrake = 1;
                break;
            case mapping.StickySteer:
                input.StickySteer = 1;
                break;
            case mapping.IncSpeedControl:
                input.IncSpeedControl = 1;
                break;
            case mapping.DecSpeedControl:
                input.DecSpeedControl = 1;
                break;
            case mapping.Pause:
                input.Pause = 1;
                break;
            case mapping.ToggleUI:
                input.ToggleUI = 1;
                break;
            case mapping.ToggleCinecam:
                input.ToggleCinecam = 1;
                break;
        }
    }

    #mouseEventHandler(ev) {
        let mouseSettings = StorageHandler.getOrDefault("mouse");
        let useMouse = mouseSettings.useMouse;
        if (!useMouse) return;
        //TODO
    }

    // add or removes gamepads from the connected gamepads list
    #gamepadEventHandler(ev) {
        if (!ev.gamepad) return;
        const gamepad = ev.gamepad;

        if (ev.type === "gamepadconnected") {
            if (this.gamepadsConnected.includes(gamepad.index)) return;
            this.gamepadsConnected.push(gamepad.index);

            if (this.gamepadsConnected.length == 1) {
                // start polling loop
                this.#pollRequestCode = requestAnimationFrame(this.#pollGamepad);
            }
        }
        else if (ev.type === "gamepaddisconnected") {
            const idx = this.gamepadsConnected.indexOf(gamepad.index);
            if (idx === -1) return;
            this.gamepadsConnected.splice(idx, 1);

            if (this.gamepadsConnected.length == 0) {
                // end polling loop
                cancelAnimationFrame(this.#pollRequestCode);
            }
        }
    }


    #pollGamepad() {
        // TODO
        this.#pollRequestCode = requestAnimationFrame(this.#pollGamepad);
    }


    // setup function that hooks the event listeners into the provided DOM Element.
    #addEventListeners(hookElement) {
        // NOTE: do not remove arrow callback function around inputEventHandler; it is required for the private functions to be captured in scope.
        const addEventListener = (type, options = undefined) => hookElement.addEventListener(type, ev => this.#inputEventHandler(ev), options);

        //keyboard
        addEventListener("keydown");
        addEventListener("keyup");

        //mouse
        addEventListener("mousedown");
        addEventListener("mouseup");
        addEventListener("mousemove");
        // addEventListener("click");
        // addEventListener("dblclick");
        // addEventListener("scroll");
        // addEventListener("wheel", { passive: true }); // for performance reasons this event should not cancel if not absolutely necessary

        //gamepad
        hookElement.addEventListener("gamepadconnected", this.#gamepadEventHandler);
        hookElement.addEventListener("gamepaddisconnected", this.#gamepadEventHandler);

    }
};


//-----------------------------------------------
// END Input Handler
//-----------------------------------------------


// return packed object so these variables can be used outside the eval() for debugging
new function() {
    this.InputHandler = InputHandler;
    this.StorageHandler = StorageHandler;
}
