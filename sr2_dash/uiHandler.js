
console.log('importing uihandler');

if (typeof __IMPORT_UIHANDLER__ !== 'undefined') return;
__IMPORT_UIHANDLER__ = true;

//---------------------------------------------
// START UI Handler
//-------------------------------------------

class UIHandler {

    /**
     * Creates a UI box
     * @param {Element} hookElement the element to attach the UI box to.
     * @param {String | Number} widthValue css width value. Defaults to auto
     * @param {String | Number} top css top value. Defaults to null -> unset
     * @param {*} bottom css bottom value. Defaults to null -> unset
     * @param {*} left css left value. Defaults to null -> unset
     * @param {*} right css right value. Defaults to null -> unset
     */
    static UIBox = class UIBox {

        hookElement;
        widthValue;

        offset = {
            top: null,
            bottom: null,
            left: null,
            right: null,
        }

        
        constructor(hookElement, top = null, bottom = null, left = null, right = null, widthValue = "auto") {
            if (!hookElement instanceof Element) throw new TypeError("Expected DOM Element");
            this.hookElement = hookElement;
            this.widthValue = widthValue;

            this.offset.top = top ?? 'unset';
            this.offset.bottom = bottom ?? 'unset';
            this.offset.left = left ?? 'unset';
            this.offset.right = right ?? 'unset';

            this.#createBox();
        }

        #createBox() {
            let elemBox = document.createElement("div");
            elemBox.classList.add("sr2-dash-uibox");
            // TODO: add other elements
            // TODO: add position and width to inline css
        }


  
    }


    static #createStyleSheet() {
        UIHandler.styleElem = document.createElement("style");
        UIHandler.styleElem.classList.add("sr2-dash-style");

        UIHandler.styleElem.innerText = UIHandler.#style;

        document.head.appendChild(UIHandler.styleElem);
    }

    static styleElem;
    static __INIT_CALLED__ = false;

    static #style = `
        .sr2-dash-uibox {
            opacity: 0.8;
            background: lightgray;
            position: absolute;
        }
        
        .sr2-dash-button {
        
        }

        .sr2-dash-lr-arrow {
        
        }
        .sr2-dash-lr-arrow.left {

        }
        .sr2-dash-lr-arrow.right {
        }

        .sr2-dash-output-rectangle {
        }

        .sr2-dash-active {
        }
    `;

    /**
     * Initialise UIHandler and set up stylesheet. Does nothing if already called.
     */
    static init() {
        if (UIHandler.__INIT_CALLED__) return;
        UIHandler.__INIT_CALLED__ = true;
        UIHandler.#createStyleSheet();
    }
}


//--------------------------------------------
// END UI Handler
//-------------------------------------------