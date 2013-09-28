define(["Element"], function($Element, _parseFragment, _forEach, _forOwn, _makeError) {
    "use strict";

    // SETTER
    // ------

    (function() {
        var hooks = {},
            processObjectParam = function(value, name) { this.set(name, value); };

        /**
         * Set property/attribute value
         * @param {String} [name] property/attribute name
         * @param {String} value property/attribute value
         * @return {$Element}
         * @example
         * // sets property href (and that action updates attribute value too)
         * link.set("href", "/some/path");
         * // sets attribute "data-attr" to "123"
         * link.set("data-attr", "123");
         * // sets innerHTML to "some text"
         * link.set("some text");
         */
        $Element.prototype.set = function(name, value) {
            var len = arguments.length,
                node = this._node,
                nameType = typeof name,
                hook;

            if (len === 1) {
                if (name == null) {
                    value = "";
                } else if (nameType === "object") {
                    _forOwn(name, processObjectParam, this);

                    return this;
                } else {
                    // handle numbers, booleans etc.
                    value = nameType === "function" ? name : String(name);
                }

                if (node.type && "value" in node) {
                    // for IE use innerText because it doesn't trigger onpropertychange
                    name = window.addEventListener ? "value" : "innerText";
                } else {
                    name = "innerHTML";
                }
            } else if (len > 2 || len === 0 || nameType !== "string") {
                throw _makeError("set", this);
            }

            if (typeof value === "function") {
                value = value.call(this, value.length ? this.get(name) : undefined);
            }

            if (hook = hooks[name]) {
                hook(node, value);
            } else if (value == null) {
                node.removeAttribute(name);
            } else if (name in node) {
                node[name] = value;
            } else {
                node.setAttribute(name, value);
            }

            return this;
        };

        if (document.attachEvent) {
            // fix NoScope elements in IE < 10
            hooks.innerHTML = function(node, value) {
                node.innerHTML = "";
                node.appendChild(_parseFragment(value));
            };

            // fix hidden attribute for IE < 10
            hooks.hidden = function(node, value) {
                if (typeof value !== "boolean") {
                    throw _makeError("set", this);
                }

                node.hidden = value;

                if (value) {
                    node.setAttribute("hidden", "hidden");
                } else {
                    node.removeAttribute("hidden");
                }

                // trigger redraw in IE
                node.style.zoom = value ? "1" : "0";
            };
        }
    })();
});