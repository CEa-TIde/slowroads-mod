// would be nice to have it as a module, but that is not possible :<



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
const __TIME_NOW = Date.now();
const IGNORE_STORAGE_ENTRY = {
    "number": __TIME_NOW,
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
        // NOTE: the following are set in keyboard, but not in gamepad: ToggleCinecam, ToggleDebug
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
        Pause: null,
        // NOTE: The following properties are not set in mouse settings (but are for keyboard)
        // Autodrive, ToggleHandbrake, StickySteer, ToggleUI, ToggleSpeedControl, ToggleCinecam, ToggleDebug
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


/**
 * Input handler class that parses all incoming input events, parses them, and passes them on to the callback.
 * @param {Element} hookElement DOM element to hook event listeners into
 * @param {Function} eventCallback event callback function that is called with the parsed input
 */
const InputHandler = class {

    /** DOM Element that all event listeners hook into
     */
    eventHook;

    /** function to call with the parsed input values
     */
    #eventCallback;
    /** list of connected gamepad indexes
     */
    gamepadsConnected = [];
    /** value returned by requestAnimationFrame for the gamepad poll loop
     */
    #pollRequestCode;

    static peripherals = ["keyboard", "mouse", "gamepad"];

    static inputBindings = [
        "Forward",
        "Backward",
        "Left",
        "Right",
        "Boost",
        "Reset",
        "CameraMode",
        "NextScene",
        "PrevScene",
        "Autodrive",
        "Handbrake",
        "ToggleHandbrake",
        "Headlights",
        "StickySteer",
        "IncSpeedControl",
        "DecSpeedControl",
        "Mute",
        "Pause",
        "ToggleUI",
        "ToggleSpeedControl",
        "ToggleCinecam",
        "ToggleDebug",
    ];

    #doubleBoostTimeoutCodes = {
        mouse: null,
        keyboard: null,
        gamepad: null,
    }
    
    constructor(hookElement, eventCallback) {
        if (!(hookElement && hookElement instanceof Element)) throw new TypeError("Expected DOM Element for the hook.");
        this.eventHook = hookElement;
        
        if (typeof eventCallback !== "function") throw new TypeError("Expected function for eventCallback");
        this.#eventCallback = eventCallback;

        this.#addEventListeners(this.eventHook);
    }

    
    static isValidPeripheral(peripheral) {
        return InputHandler.peripherals.includes(peripheral);
    }

    static isInvalidPeripheral(peripheral) {
        return !this.isValidPeripheral(peripheral);
    }

    /**
     * Throws TypeError if `peripheral` is not a valid peripheral
     * @param {String} peripheral peripheral to check
     * @throws TypeError if peripheral is invalid
     */
    static checkIsValidPeripheral(peripheral) {
        if (InputHandler.isInvalidPeripheral(peripheral)) throw new TypeError(`Not a valid peripheral: ${peripheral}`);
    }

    /**
     * Tracks the input state.
     */
    inputState = new class InputState {
        #states = {};

        #doubleBoostStates = {};

        /**
         * For every complement key pair, this map points to the keys to each other.
         */
        #linkedState = {
            Forward: "Backward",
            Backward: "Forward",
            Left: "Right",
            Right: "Left",
        }

        constructor() {
            let peripherals = InputHandler.peripherals;
            let bindings = InputHandler.inputBindings;

            //init double click/tap boost states.
            for (const p in peripherals) {
                this.#doubleBoostStates[p] = false;
            }

            //init input states for all the bindings.
            for (const key of bindings) {
                this.#states[key] = {};
                for (const p in peripherals) {
                    this.#states[key][p] = null;
                }
            }
        }



        /**
         * Bound a value to [-1 to 1] if key is part of a complement key pair (Forward/Backward, Left/Right).
         * Bound a value to [0 to 1] otherwise.
         * null is returned untouched.
         * @param {String} key the input map key
         * @param {Number | null} val the value to bound, or null
         * @returns the bounded value, or null
         */
        #boundValue(key, val) {
            // part of a complement key pair:
            // bound to range -1 to 1, (where the other key should be the opposite sign)
            // not part of a complement key pair:
            // bound to range 0 to 1
            if (null === val) return null;
            if (val < -1) val = -1;
            if (val > 1) val = 1;
            if (!this.#linkedState[key]) {
                // not part of a complement pair
                if (val < 0) val = 1;
            }
            return val;
        }
        /**
         * set the value for a certain key and peripheral
         * @param {String} key input map key (Forward, Backward, etc.)
         * @param {String} peripheral the peripheral device you're setting the value of
         * @param {Number | null} val value (0 to 1), or (-1 to 1) if there is a complement key associated with it (Forward/Backward, Left/Right)
         */
        set(key, peripheral, val) {
            this.#__set__(key, peripheral, val, false);
        }

        /**
         * Internal implementation for set(). See that method for more information.
         * @param {String} key -
         * @param {String} peripheral -
         * @param {Number | null} val -
         * @param {Boolean} isForLinked boolean if this is done for the linked state or not
         */
        #__set__(key, peripheral, val, isForLinked) {
            InputHandler.checkIsValidPeripheral(peripheral);
            if ((isNaN(val) || !(typeof val === "number")) && val !== null) throw new TypeError(`Value is not of type Number, or null: ${val}`);
            // initialise object if not done yet
            if (!this.#states[key]) {console.log(this.#states); throw new EvalError(`Input states for "${key}" were not initalised. Check if it has been added to "InputHandler.inputBindings".`);}

            val = this.#boundValue(key, val);
            this.#states[key][peripheral] = val;

            // if there is a linked state, set that to the opposite
            if (!isForLinked && this.#linkedState[key]) {
                if (null === val) this.#__set__(key, peripheral, null, true);
                else this.#__set__(key, peripheral, -val, true);
            }
        }

        /**
         * Reset the value of a key-peripheral pair back to null
         * @param {String} key input map key
         * @param {String} peripheral the peripheral device you're resetting
         */
        reset(key, peripheral) {
            this.set(key, peripheral, null);
        }

        /**
         * Set the double click/tap boosting state of one peripheral
         * @param {String} peripheral peripheral to set the state of
         * @param {Boolean} val boolean to set the state to
         */
        setDoubleBoostState(peripheral, val) {
            InputHandler.checkIsValidPeripheral(peripheral);
            this.#doubleBoostStates[peripheral] = val;
        }

        /**
         * Get the double click/tap boosting state of one or all peripherals.
         * @param {String | null} peripheral peripheral to get the state of, or null to get congregated state of all peripherals.
         * @returns true if the state of at least one peripheral (provided or not) is true.
         */
        getDoubleBoostState(peripheral = null) {
            if (null === peripheral) {
                // congregate state for all peripherals
                let isBoosting = false;
                let peripherals = InputHandler.peripherals;
                for (let p in peripherals) {
                    isBoosting ||= this.#doubleBoostStates[p];
                }
                return isBoosting;
            }
            InputHandler.checkIsValidPeripheral(peripheral);
            return this.#doubleBoostStates[peripheral];
        }

        /**
         * get the key-value of a peripheral
         * @param {String} key input map key
         * @param {String} peripheral the peripheral device you're getting the value of
         * @returns value associated with the key,peripheral pair
         */
        getOfPeripheral(key, peripheral) {
            InputHandler.checkIsValidPeripheral(peripheral);
            if (this.#states[key]) return this.#states[key][peripheral];
            return null;
        }

        /**
         * Get the average value of all *active* peripherals for a given key.
         * @param {String} key input map key
         * @returns the averaged value
         */
        getAverage(key) {
            if (!this.#states[key]) return null;
            // take average?
            const state = this.#states[key];
            let peripheralsActive = 0;
            let total = 0;
            const peripherals = InputHandler.peripherals;
            for (const p in peripherals) {
                if (state[p] === null) continue;
                total += state[p];
                peripheralsActive++;
            }
            return total / peripheralsActive;
        }
    }

    // inputState = {
    //     doubleBoostStates: {
    //         mouse: false,
    //         keyboard: false,
    //         gamepad: false,
    //     },

    //     Forward             : 0,
    //     Backward            : 0,
    //     Left                : 0,
    //     Right               : 0,
    //     Boost               : 0,
    //     Reset               : 0,
    //     CameraMode          : 0,
    //     NextScene           : 0,
    //     PrevScene           : 0,
    //     Autodrive           : 0,
    //     Handbrake           : 0,
    //     ToggleHandbrake     : 0,
    //     Headlights          : 0,
    //     StickySteer         : 0,
    //     IncSpeedControl     : 0,
    //     DecSpeedControl     : 0,
    //     Mute                : 0,
    //     Pause               : 0,
    //     ToggleUI            : 0,
    //     ToggleSpeedControl  : 0,
    //     ToggleCinecam       : 0,
    //     ToggleDebug         : 0,
    // }


    /**
     * Handle the logic for checking if double tap/click boost should (de)activate
     * @param {Boolean} isPressedDown is the button/key pressed down or lifted up?
     * @param {String} peripheral [mouse, keyboard, gamepad]; input device
     * @param {Number} timeoutDelay the max duration that is allowed for a double tap/click boost to activate.
     * @returns Boolean/Null. Boolean if boost state changes, null otherwise.
     */
    handleDoubleBoost(isPressedDown, peripheral, timeoutDelay) {
        InputHandler.checkIsValidPeripheral(peripheral);

        const timeoutCodes = this.#doubleBoostTimeoutCodes;

        /**
         * Cancel running timeout for peripheral
         * @returns true if timeout was successfully cancelled; false otherwise
         */
        const checkAndCancelTimeout = function() {
            if (!timeoutCodes[peripheral]) return false;
            clearTimeout(timeoutCodes[peripheral]);
            timeoutCodes[peripheral] = null;
            return true;
        };

        // button/key pressed down when the timeout was still running -> activate boost.
        if (isPressedDown) {
            if (checkAndCancelTimeout()) {
                this.inputState.setDoubleBoostState(peripheral, true);
                return true;
            }
            return null;
        }

        let retVal = null;
        // cancel the running timeout (if any)...
        if (checkAndCancelTimeout()) {
            //... turn off the boost...
            this.inputState.setDoubleBoostState(peripheral, false);
            retVal = false;
        }
        
        // ... and start a new timeout. timeout is active for that duration and then deactivates itself.
        // we only care if the timeout return code is set or not.
        timeoutCodes[peripheral] = setTimeout(function() {
            timeoutCodes[peripheral] = null;
        }, timeoutDelay);
        return retVal;
    }

    /**
     * multi-peripheral input class
     */
    static Input = class {
        /** peripheral independent event type: down, up, change (can we get away with just change and remove all together?)
         */
        type;
        /** Reference of the original event
         */
        ev;
        // 
        /** keyboard, mouse, or gamepad (maybe drawing device too? Does that require different events or is that translated to mouse events)
         */
        peripheral;

        DoubleTapClickBoost = null;

        // bindings
        Forward             = null;
        Backward            = null;
        Left                = null;
        Right               = null;
        Boost               = null;
        Reset               = null;
        CameraMode          = null;
        NextScene           = null;
        PrevScene           = null;
        Autodrive           = null;
        Handbrake           = null;
        ToggleHandbrake     = null;
        Headlights          = null;
        StickySteer         = null;
        IncSpeedControl     = null;
        DecSpeedControl     = null;
        Mute                = null;
        Pause               = null;
        ToggleUI            = null;
        ToggleSpeedControl  = null;
        ToggleCinecam       = null;
        ToggleDebug         = null;

        constructor() {}
    }

    /**
     * Checks if event type is keydown or keyup
     * @param {String} type event type
     * @returns boolean.
     */
    isKeyboardEvent(type) {
        return ["keyup", "keydown"].includes(type);
    }

    /**
     * Checks if event type is a mouse event
     * @param {String} type event type
     * @returns boolean.
     */
    isMouseEvent(type) {
        return this.isMouseButtonEvent(type) || this.isMouseMoveEvent(type);
    }

    /**
     * Checks if event type is a mouse button event (a mouse button is clicked, released, etc.)
     * One of: mousedown, mouseup, click, dblclick
     * @param {String} type event type
     * @returns boolean.
     */
    isMouseButtonEvent(type) {
        return ["mousedown", "mouseup", "click", "dblclick"].includes(type);
    }

    /**
     * Checks if event type is a mouse move event (the mouse is dragged in some way)
     * One of: mouseenter, mouseleave, mousemove, mouseout, mouseover
     * @param {String} type event type
     * @returns boolean.
     */
    isMouseMoveEvent(type) {
        return ["mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover"].includes(type);
    }


    /**
     * Input Handler. It is called when the user presses a key, uses a mouse, or other input.
     * It parses the input event and passes the result on to a callback.
     * @param {Event} ev input event
     * @throws EvalError if the event type is not expected.
     */
    #inputEventHandler(ev) {

        let input = new InputHandler.Input();
        // TODO: handle double click/double tap boost
        input.ev = ev;
        let hasEventMapping = false;
        if (this.isKeyboardEvent(ev.type)) {
            hasEventMapping = this.#keyboardEventHandler(input, ev);
        }

        else if (this.isMouseEvent(ev.type)) {
            hasEventMapping = this.#mouseEventHandler(input, ev);
        }

        if (hasEventMapping) this.#eventCallback(input);
    }

    /**
     * Handler to parse a keyboard event and store the action into the input object
     * @param {InputHandler.Input} input Input object that stores the result
     * @param {KeyboardEvent} ev keyboard event
     * @returns true if the keyboard event matches to one of the mappings; false otherwise
     */
    #keyboardEventHandler(input, ev) {
        let keyboardSettings = StorageHandler.getOrDefault("keyboard");

        input.peripheral = "keyboard";

        return this.#parseKeyboardEvent(input, ev, keyboardSettings);
    }

    /**
     * Parse the keyboard event and match it against which action it should take. Update Input State.
     * @param {InputHandler.Input} input Input object that stores the result
     * @param {Event} ev event
     * @param {Object} settings keyboard settings
     * @throws EvalError when unknown keyboard event is passed to the function
     * @returns true if ev code matches to one of the mappings; false otherwise
     */
    #parseKeyboardEvent(input, ev, settings) {
        const mapping = settings.mapping;

        // some mappings can be null/undefined.
        // Sanity check: exit out immediately if ev.code is one of these values.
        if (ev.code === null || ev.code === undefined) throw new TypeError(`Expected ev.code to be not null/undefined: ${ev.code}`);

        let newState, isPressedDown;
        if (ev.type === "keydown") {
            input.type = "activate";
            newState = 1;
            isPressedDown = true;
        }
        else if (ev.type === "keyup") {
            input.type = "release";
            newState = 0;
            isPressedDown = false;
        }
        else {
            throw new EvalError(`Unknown keyboard event: ${ev.type}`);
        }

        return this.#parseKeyboardCode(input, settings, ev.code, newState);
    }

    /**
     * 
     * @param {InputHandler.Input} input Input object that stores the result
     * @param {Object} settings keyboard settings
     * @param {String} evCode event code
     * @param {0 | 1} newState new keyboard state
     * @returns 
     */
    #parseKeyboardCode(input, settings, evCode, newState) {
        const mapping = settings.mapping;

        // special cases for arrow keys and Forward
        if (evCode === "ArrowUp" || evCode === mapping.Forward) {
            input.Forward = newState;
            this.inputState.set("Forward", input.peripheral, newState);
            // TODO: doubleTapInterval is not defined for keyboard. What does the game use then?
            // if (settings.doubleTapBoost) this.handleDoubleBoost(newState === 1, input.peripheral, settings.doubleClickInterval);
            return true;
        }
        if (evCode === "ArrowDown") {
            input.Backward = newState;
            this.inputState.set("Backward", input.peripheral, newState);
            return true;
        }
        if (evCode === "ArrowLeft") {
            input.Left = newState;
            this.inputState.set("Left", input.peripheral, newState);
            return true;
        }
        if (evCode === "ArrowRight") {
            input.Right = newState;
            this.inputState.set("Right", input.peripheral, newState);
            return true;
        }
        // otherwise loop over the whole mapping until a match is found
        for (const key in mapping) {
            // only write to keys that are defined in the InputHandler.Input class
            // inputState mirrors the same keys.
            if (mapping[key] === evCode && Object.hasOwn(input, key)) {
                input[key] = newState;
                this.inputState.set(key, input.peripheral, newState);
                return true; // keyboard events can only contain one key at a time.
            }
        }
        return false;
    }

    

    /**
     * Handler to parse the mouse event and store the action into the input object
     * @param {InputHandler.Input} input Input object that stores the result
     * @param {Event} ev mouse event
     * @returns true if event matches to one of the mappings; false otherwise
     */
    #mouseEventHandler(input, ev) {
        let mouseSettings = StorageHandler.getOrDefault("mouse");
        let useMouse = mouseSettings.useMouse;
        if (!useMouse) return false;
        input.peripheral = "mouse";

        return this.#parseMouseEvent(input, ev, mouseSettings);
    }

    /**
     * Parse a mouse event and store the action into the input object
     * @param {InputHandler.Input} input Input object that stores the result
     * @param {Event} ev mouse event
     * @param {Object} mouseSettings mouse settings fetched from storage
     * @returns true if mouse event matches one of the mappings; false otherwise
     */
    #parseMouseEvent(input, ev, mouseSettings) {
        if (this.isMouseButtonEvent(ev.type)) {
            // click events
            return this.#parseMouseClickEvents(input, ev, mouseSettings);

        } else {
            // move events
            return this.#parseMouseMoveEvents(input, ev, mouseSettings);
        }
    }

    /**
     * Parse a mouse click event and store the action into the input object
     * @param {InputHandler.Input} input Input object that stores the result
     * @param {Event} ev mouse click event
     * @param {Object} mouseSettings mouse settings fetched from storage
     * @returns true if mouse click event matches one of the mappings; false otherwise
     */
    #parseMouseClickEvents(input, ev, mouseSettings) {
        let button = ev.button;
        let mapping = mouseSettings.mapping;
        let newState;
        if (ev.type === "mousedown") {
            input.type = "activate";
            newState = 1;
        }
        else if (ev.type === "mouseup") {
            input.type = "release";
            newState = 0;
        }
        else {
            // click, dblclick
            throw new EvalError(`Unhandled mouse click event: ${type}`);
        }

        for (const key in mapping) {
            if (mapping[key] === button && Object.hasOwn(input, key)) {
                input[key] = newState;
                this.inputState.set(key, input.peripheral, newState);
                return true;
            }
        }
        return false;
    }

    #parseMouseMoveEvents(input, ev, mouseSettings) {

    }


    /**
     * Handler for gamepad events that adds or removes gamepads from the connected gamepads list
     * @param {GamepadEvent} ev gamepad event
     */
    #gamepadEventHandler(ev) {
        if (!ev.gamepad) throw new EvalError("Expected event.gamepad to exist for the gamepad Event Handler.");
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


    /**
     * setup function that hooks the event listeners into the provided DOM Element.
     * @param {Element} hookElement the DOM Element to hook all the event listeners into.
     */
    #addEventListeners(hookElement) {
        // NOTE: do not remove arrow callback function around inputEventHandler; it is required for the private functions to be captured in scope.
        const addEventListener = (type, options = undefined) => hookElement.addEventListener(type, ev => this.#inputEventHandler(ev), options);

        //keyboard
        addEventListener("keydown");
        addEventListener("keyup");

        //mouse
        // addEventListener("mousedown");
        // addEventListener("mouseup");
        // addEventListener("mousemove");
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






//---------------------------------------------
// START UI Handler
//-------------------------------------------


//--------------------------------------------
// END UI Handler
//-------------------------------------------


// return packed object so these variables can be used outside the eval() for debugging
new function() {
    this.InputHandler = InputHandler;
    this.StorageHandler = StorageHandler;
}
