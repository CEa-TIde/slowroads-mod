import { StorageHandler } from "./localStorage";

export const InputHandler = class {

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
        if (typeof this.#eventCallback !== "function") throw new TypeError("Expected function for eventCallback");
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
        const addEventListener = (type, options = undefined) => hookElement.addEventListener(type, this.#inputEventHandler, options);

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
}