/**
 * @license Copyright 2019 DENSO
 * 
 * react-utility
 * 
 */

'use strict';

const PASSIVE_EVENTS = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel'];

const checkType = (type, options) => {
    if (!PASSIVE_EVENTS.includes(type)) return null;

    var modOptions = {
        boolean: {
            capture: options,
            passive: false,
        },
        object: {
            passive: false,
        },
    };

    if (typeof options === 'object' && options) {
        for (const key of Object.keys(options)) {
            modOptions.object[key] = options[key];
        }
    }

    return modOptions[typeof options];
};

const addEventListener = document.addEventListener.bind();
document.addEventListener = (type, listener, options, wantsUntrusted) => (
    addEventListener(type, listener, checkType(type, options) || options, wantsUntrusted)
);

const removeEventListener = document.removeEventListener.bind();
document.removeEventListener = (type, listener, options) => (
    removeEventListener(type, listener, checkType(type, options) || options)
);