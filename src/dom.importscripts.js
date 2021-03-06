import _ from "./utils";
import DOM from "./dom";

/**
 * Import external scripts on the page and call optional callback when it will be done
 * @memberOf DOM
 * @param {...String} urls       script file urls
 * @param {Function}  [callback] callback that is triggered when all scripts are loaded
 */
DOM.importScripts = function(...urls) {
    var callback = function() {
        var arg = urls.shift(),
            argType = typeof arg,
            script;

        if (argType === "string") {
            script = document.createElement("script");
            script.src = arg;
            script.onload = callback;
            script.async = true;

            _.injectElement(script);
        } else if (argType === "function") {
            arg();
        } else if (arg) {
            throw _.makeError("importScripts", true);
        }
    };

    callback();
};
