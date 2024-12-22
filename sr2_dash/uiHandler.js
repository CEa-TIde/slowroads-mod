
console.log('importing uiHandler.js');

//---------------------------------------------
// START UI Handler
//-------------------------------------------

class UIHandler {

    /**
     * Creates a UI box for the recorded inputs
     * @param {Element} hookElement the element to attach the UI box to.
     * @param {String | Number} widthValue css width value. Defaults to auto
     * @param {String | Number} top css top value. Defaults to null -> unset
     * @param {*} bottom css bottom value. Defaults to null -> unset
     * @param {*} left css left value. Defaults to null -> unset
     * @param {*} right css right value. Defaults to null -> unset
     */
    static InputUIBox = class InputUIBox {

        hookElement;
        elem;
        widthValue;

        offset = {
            top: null,
            right: null,
            bottom: null,
            left: null,
        }

        
        constructor(hookElement, top = null, right = null, bottom = null, left = null, widthValue = "auto") {
            if (!hookElement instanceof Element) throw new TypeError("Expected DOM Element");
            this.hookElement = hookElement;
            this.widthValue = widthValue;

            this.offset.top = top ?? 'unset';
            this.offset.right = right ?? 'unset';
            this.offset.bottom = bottom ?? 'unset';
            this.offset.left = left ?? 'unset';

            this.#attachBox();
        }

        #attachBox() {
            this.elem = document.createElement("div");
            this.elem.classList.add("sr2-dash-uibox");

            // set the inner html elements as defined below.
            this.elem.innerHTML = UIHandler.InputUIBox.#boxHTML;

            // Add position and width to inline css
            this.elem.style = `top: ${this.offset.top}; right: ${this.offset.right}; bottom: ${this.offset.bottom}; left: ${this.offset.left}; width: ${this.widthValue}`;
            this.hookElement.appendChild(this.elem);
        }



        static #boxHTML = `
            <input type="checkbox"/>
            <div class="sr2-dash-arrows-wrapper">
                <div class="sr2-dash-arrow sr2-dash-left">
                    <svg height="80" width="60" viewBox="0 0 20 20">
                        <polygon filter="url(#tri-fill-left)" points="20,0 0,10 20,20"></polygon>
                    </svg>
                </div>
                <div class="sr2-dash-vertical-arrows">
                    <div class="sr2-dash-arrow sr2-dash-up">
                        <svg height="40" width="40" viewBox="0 0 20 20">
                            <polygon filter="url(#tri-fill-up)" points="10,0 0,20 20,20"></polygon>
                        </svg>
                    </div>
                    <div class="sr2-dash-arrow sr2-dash-down">
                        <svg height="40" width="40" viewBox="0 0 20 20">
                            <polygon filter="url(#tri-fill-down)" points="0,0 20,0 10,20"></polygon>
                        </svg>
                    </div>
                </div>
                <div class="sr2-dash-arrow sr2-dash-right">
                    <svg height="80" width="60" viewBox="0 0 20 20">
                        <polygon filter="url(#tri-fill-right)" points="0,0 20,10 0,20"></polygon>
                    </svg>
                </div>
            </div>
            <div class="sr2-boost-brake-wrapper">
                <div class="sr2-dash-rectangle sr2-dash-boost">BOOST</div>
                <div class="sr2-dash-rectangle sr2-dash-handbrake">HANDBRAKE</div>
            </div>
        `;


        setInputValue(inputKey, val) {
            if (typeof val !== "number" || val < 0 || val > 1) throw new RangeError("Expected `val` to be a Number between 0 and 1");
            switch(inputKey) {
                case 'right':
                case 'down':
                    val *= -1;
                case 'up':
                case 'left':
                    let offset = UIHandler.svgOffsets[inputKey];
                    if (null === offset) throw new EvalError(`SVG offset not defined for: ${inputKey}`);
                    offset.baseVal = val;
                    break;
                case 'boost':
                    let boostRectElem = this.elem.querySelector(".sr2-dash-boost");
                    this.#toggleClassActive(boostRectElem, val);
                    break;
                case 'brake':
                    let brakeRectElem = this.elem.querySelector(".sr2-dash-brake");
                    this.#toggleClassActive(brakeRectElem, val);
                    break;
                default:
                    throw new RangeError(`Expected ${inputKey} to be a valid value out of: up/right/down/left/boost/brake`);
            }
        }

        #toggleClassActive(elem, val) {
            if (null === elem) throw new TypeError("Toggling class: expected elem to be not null");
            if (val) {
                elem.classList.add('sr2-dash-active');
            } else {
                elem.classList.remove('sr2-dash-active');
            }
        }
        // end class InputUIBox
    }

    


    static styleElem;
    static #attachStyleSheet() {
        UIHandler.styleElem = document.createElement("style");
        UIHandler.styleElem.classList.add("sr2-dash-style");

        UIHandler.styleElem.innerText = UIHandler.#style;

        document.head.appendChild(UIHandler.styleElem);
    }

    static svgDefsElem;
    static svgOffsets = {};
    /**
     * Attach hidden svg element that contains the filter definitions for the arrows
     */
    static #attachSvgDefs() {
        UIHandler.svgDefsElem = document.createElement("svg");
        UIHandler.svgDefsElem.width = "0";
        UIHandler.svgDefsElem.height = "0";
        UIHandler.svgDefsElem.innerHTML = UIHandler.#svgdefs;

        document.body.appendChild(UIHandler.svgDefsElem);

        let svgDefs = UIHandler.svgDefsElem;
        UIHandler.svgOffsets = {
            'up': svgDefs.querySelector(".tri-fill-up feOffset")?.dy,
            'right': svgDefs.querySelector(".tri-fill-right feOffset")?.dx,
            'down': svgDefs.querySelector(".tri-fill-down feOffset")?.dy,
            'left': svgDefs.querySelector(".tri-fill-left feOffset")?.dx,
        }
    }



    static __INIT_CALLED__ = false;
    /**
     * Initialise UIHandler and set up stylesheet. Does nothing if already called.
     */
    static init() {
        if (UIHandler.__INIT_CALLED__) return;
        UIHandler.__INIT_CALLED__ = true;
        UIHandler.#attachStyleSheet();
        UIHandler.#attachSvgDefs();
    }

    

    static #style = `
        .sr2-dash-uibox {
            opacity: 0.7;
            background: lightgray;
            position: absolute;
            /* top/bottom/left/right is set in inline style */
        }

        input:checked + .sr2-dash-arrows-wrapper {
            display: none;
        }

        .sr2-dash-arrows-wrapper > * {
            display: inline-block;
        }

        .sr2-dash-arrow polygon {
            fill: white;
            stroke: red;
        }

        .sr2-dash-rectangle {
            width: 100%;
            text-align: center;
            border: 1px solid black;
            background: transparent;
        }

        .sr2-dash-active {
            background: lime;
        }
    `;

    static #svgdefs = `
        <defs>
            <filter id="tri-fill-left" primitiveUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
                <feFlood x="0%" y="0%" width="100%" height="100%" flood-color="red"></feFlood>
                <feOffset dx="0.5"></feOffset>
                <feComposite operator="in" in2="SourceGraphic"></feComposite>
                <feComposite operator="over" in2="SourceGraphic"></feComposite>
            </filter>
            <filter id="tri-fill-right" primitiveUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
                <feFlood x="0%" y="0%" width="100%" height="100%" flood-color="red"></feFlood>
                <feOffset dx="-0.5"></feOffset>
                <feComposite operator="in" in2="SourceGraphic"></feComposite>
                <feComposite operator="over" in2="SourceGraphic"></feComposite>
            </filter>
            <filter id="tri-fill-up" primitiveUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
                <feFlood x="0%" y="0%" width="100%" height="100%" flood-color="red"></feFlood>
                <feOffset dy="0.5"></feOffset>
                <feComposite operator="in" in2="SourceGraphic"></feComposite>
                <feComposite operator="over" in2="SourceGraphic"></feComposite>
            </filter>
            <filter id="tri-fill-down" primitiveUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
                <feFlood x="0%" y="0%" width="100%" height="100%" flood-color="red"></feFlood>
                <feOffset dy="-0.5"></feOffset>
                <feComposite operator="in" in2="SourceGraphic"></feComposite>
                <feComposite operator="over" in2="SourceGraphic"></feComposite>
            </filter>
        </defs>
    `;
}


//--------------------------------------------
// END UI Handler
//-------------------------------------------
// return value of eval
UIHandler;