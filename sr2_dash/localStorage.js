
export const StorageHandler = {
    // local storage values
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

    // populated below.
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

    getOrDefault: function(objectKey) {
        if (this.values[key]) return this.values[key];
        if (this.defaults[key]) return this.defaults[key];
        throw new EvalError("No value or default value found for key: ", objectKey);
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
                console.warn(`This property (${key}) contains a volatile key name or value and may not be compared properly. Mark those entries with IGNORE_ENTRY.[type] and it should test if it is equal except for that property. Potential caveat: other data types?`);

            if (!object_equals(this.defaults[key], this.values[key])) {
                console.error(`For ${key} the objects aren't equal. Defaults / Values:`);
                console.log(this.defaults[key], this.values[key]);
                continue;
            }
            console.log(`No differences found for: ${ key }`);
        }
    },
};

// if a default value is equal to `IGNORE_ENTRY.[type]`, it should be ignored in the object comparison
const TIME_NOW = Date.now();
const IGNORE_ENTRY = {
    "number": TIME_NOW,
    "string": "IGNORE_309824309",
    "object": { "IGNORE": "this34509384503948" },
    "function": () => "IGNORE_34203498",
    "bigint": BigInt("2342394283409"),

    // special value for object keys so they are unique. Needs to be called before assigning.
    // index is automatically incremented due to scope magic
    __KEY_PREFIX__: "IGNORE_3223402_",
    "key": (function() {
        let idx = 0; // set initial value outside inner function (but the variable is inside scope of inner function)
        return function() {
            idx++;
            return `${ this.__KEY_PREFIX__ }${ idx })`;
        }
    })(),

    // no entries for undefined, boolean, and symbol
}

// adapted from: https://stackoverflow.com/a/6713782
function object_equals(x, y) {
    let hasIgnoreSetForKey = false;

    if (x === y) return true;
    // if both x and y are null or undefined and exactly the same

    if (!(x instanceof Object) || !(y instanceof Object)) return false;
    // if they are not strictly equal, they both need to be Objects

    if (x.constructor !== y.constructor) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

    for (var p in x) {
        if (!x.hasOwnProperty(p)) continue;
        // other properties were tested using x.constructor === y.constructor


        // ignore key if marked with IGNORE_ENTRY.key()
        if (typeof p !== "symbol" && p.startsWith(IGNORE_ENTRY.__KEY_PREFIX__)) {
            hasIgnoreSetForKey = true;
            console.warn(`Ignoring object key (and its value) marked with IGNORE_ENTRY.key: ${p}`);
            continue;
        }

        // ignore value if marked with an IGNORE_ENTRY.[TYPE]
        // unless undefined, symbol or boolean; as those cannot be compared without false positives (because real values could be plausibly the same)
        let type = typeof x[p];
        if (!["undefined", "boolean", "symbol"].includes(type) && x[p] === IGNORE_ENTRY[type]) {
            console.warn(`Ignoring entry marked with IGNORE_ENTRY.${type}: ${p}`);
            continue;
        }

        if (!y.hasOwnProperty(p)) return false;
        // allows to compare x[ p ] and y[ p ] when set to undefined

        if (x[p] === y[p]) continue;
        // if they have the same strict value or identity then they are equal

        if (typeof (x[p]) !== "object") return false;
        // Numbers, Strings, Functions, Booleans must be strictly equal

        if (!object_equals(x[p], y[p])) return false;
        // Objects and Arrays must be tested recursively
    }

    for (p in y) {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
            if (!hasIgnoreSetForKey) {
                console.warn(`Property (${p}) exists in values but not in defaults.`);
                return false;
            }
            console.log(`Property (${p}) exists in values but not in defaults. This is assumed to be fine because a key was set to IGNORE_ENTRY.key()`);
        }
    }
    // allows x[ p ] to be set to undefined

    return true;
}


// ----------------------------------------
// Populating default values:


// used to set the default for first time visit timestamps
// const TIME_NOW = Date.now();

StorageHandler.defaults.profile = {
    totalTime: 0,
    totalDist: 0,
    autodriveTime: 0,
    autodriveDist: 0,
    totalVisits: 1,
    firstVisit: IGNORE_ENTRY.number,
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
    seed: IGNORE_ENTRY.string, //this is a random value as this will be different every time
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
                [IGNORE_ENTRY.key()]: {
                    ts: IGNORE_ENTRY.number,
                    startNode: 0,
                    accumulatedDistance: 0,
                } 
            }
        }
    },
};

//-------------------------------------------