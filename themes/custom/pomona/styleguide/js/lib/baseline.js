'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * Baseline.js 1.1
 *
 * Copyright 2013, Daniel Eden http://daneden.me
 * Released under the WTFPL license
 * http://sam.zoy.org/wtfpl/
 *
 * Date: 2014-06-20
 */

(function (window, $) {

    'use strict';

    var _baseline = function () {
        var cssAttr = 'data-baseline';

        /** insert
         *
         * @copyright https://github.com/Mr0grog/element-query/blob/master/LICENSE
         *
         * @param {HTMLElement} element
         * @param {*} value
         * @returns {*}
         */
        function getEmSize(element) {
            if (!element) {
                element = document.documentElement;
            }
            var fontSize = window.getComputedStyle(element, null).fontSize;
            return parseFloat(fontSize) || 16;
        }

        function convertToPx(element, value) {
            var numbers = value.split(/\d/);
            var units = numbers[numbers.length - 1];
            value = parseFloat(value);
            switch (units) {
                case "px":
                    return value;
                case "em":
                    return value * getEmSize(element);
                case "rem":
                    return value * getEmSize();
                case "vw":
                    return value * document.documentElement.clientWidth / 100;
                case "vh":
                    return value * document.documentElement.clientHeight / 100;
                case "vmin":
                case "vmax":
                    var vw = document.documentElement.clientWidth / 100;
                    var vh = document.documentElement.clientHeight / 100;
                    var chooser = Math[units === "vmin" ? "min" : "max"];
                    return value * chooser(vw, vh);
                default:
                    return value;
                // for now, not supporting physical units (since they are just a set number of px)
                // or ex/ch (getting accurate measurements is hard)
            }
        }
        /* end */

        /* extract CSS rules ... */
        /**
         * @param {String} css
         */
        function extractQuery(css) {
            css = css.replace(/'/g, '"');
            var q = {
                sel: '',
                val: null
            };
            var r = new RegExp(['\\[\s?', cssAttr, '\s?'].join(''), 'i');
            var a = css.split(r);
            var b = a[1].split(/](.+)?/);
            a[1] = b.shift().replace('=', '').replace(/"/g, '');
            q.sel = a[0] += b.join('').trim();
            q.val = convertToPx(false, a[1].trim());
            return q;
        }
        /**
         * @param {CssRule[]|String} rules
         */
        function readRules(rules) {
            var allQueries = [];
            var selector = '';
            var cssR = new RegExp(['\\[(?:\s\s+)?', cssAttr, '(?:\s\s+)?='].join(''), 'i');
            if (!rules) return;
            if (typeof rules === 'string') {
                if (rules.search(cssR) != -1) {
                    allQueries.push(extractQuery(rules));
                }
            } else {
                for (var i = 0, j = rules.length; i < j; i++) {
                    if (1 === rules[i].type) {
                        selector = rules[i].selectorText || rules[i].cssText;
                        if (selector.search(cssR) != -1) {
                            allQueries.push(extractQuery(selector));
                        }
                    } else if (4 === rules[i].type) {
                        readRules(rules[i].cssRules || rules[i].rules);
                    }
                }
            }
            return allQueries;
        }

        /**
         * `_base` will later hold the value for the current baseline that matches
         * the given breakpoint. `_breakpoints` will hold a reference to all
         * breakpoints given to the baseline call.
         */
        var _base = 0,
            _breakpoints = {},
            _dynamicBase;

        /**
         * @name     _setBase
         *
         * Set the correct margin-bottom on the given element to get back to the
         * baseline.
         *
         * @param    {Element}  element
         *
         * @private
         */

        function _setBase(element) {
            var rect = element.getBoundingClientRect();
            var height = rect.hasOwnProperty('height') ? rect.height : element.offsetHeight,
                current,
                old;

            if (_dynamicBase) {

                /**
                 * Compute the _base through a user defined function on each execution.
                 * This could be used to get the current grid size for different breakpoints
                 * from an actual element property instead of defining those breakpoints in the options.
                 */
                _base = _dynamicBase();
            } else {

                /**
                 * In this step we loop through all the breakpoints, if any were given.
                 * If the baseline call received a number from the beginning, this loop
                 * is simply ignored.
                 */

                for (var key in _breakpoints) {
                    current = key;

                    if (document.body.clientWidth > current && current >= old) {
                        _base = _breakpoints[key];
                        old = current;
                    }
                }
            }

            /**
             * We set the element's margin-bottom style to a number that pushes the
             * adjacent element down far enough to get back onto the baseline.
             */

            element.style.marginBottom = _base - height % _base + 'px';
        }

        /**
         * @name     _init
         *
         * Call `_setBase()` on the given element and add an event listener to the
         * window to reset the baseline on resize.
         *
         * @param    {Element}  element
         *
         * @private
         */

        function _init(element) {
            _setBase(element);
            element.setAttribute(cssAttr, _base);
            if ('addEventListener' in window) {
                window.addEventListener('resize', function () {
                    _setBase(element);
                }, false);
            } else if ('attachEvent' in window) {
                window.attachEvent('resize', function () {
                    _setBase(element);
                });
            }
        }

        /**
         * Searches all css rules and setups the event listener to all elements with element query rules..
         */
        function cssBaselineRules() {
            var targets = [];
            for (var i = 0, j = document.styleSheets.length; i < j; i++) {
                try {
                    targets = targets.concat(readRules(document.styleSheets[i].cssRules || document.styleSheets[i].rules || document.styleSheets[i].cssText));
                } catch (e) {
                    if (e.name !== 'SecurityError') {
                        throw e;
                    }
                }
            }
            return targets;
        };

        /**
         * @name     baseline
         *
         * Gets the correct elements and attaches the baseline behaviour to them.
         *
         * @param    {String/Element/NodeList}  elements
         * @param    {Number/Object}            options
         */

        function baseline(elements, options) {
            if (!elements) {
                /**
                 * No elements = parse CSS for [cssAttr]
                 */
                var rootBaseline = window.getComputedStyle(document.createElement('p'), null).lineHeight;
                cssBaselineRules().forEach(function (q) {
                    baseline(q.sel, q.val || (typeof options === 'number' ? options : rootBaseline));
                });
                return false;
            }
            /**
             * Accept a NodeList or a selector string and set `targets` to the
             * relevant elements.
             */
            var targets = typeof elements === 'string' ? document.querySelectorAll(elements) : elements,
                len = targets.length;

            /**
             * Decide whether to set the `_breakpoints` or `_dynamicBase` variables or not.
             * This will be relevant in the `_setBase()` function.
             */

            if (typeof options === 'number') {
                _base = parseFloat(options, 10);
            } else if (typeof options === 'function') {
                _dynamicBase = options;
            } else if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
                var em = parseFloat(getComputedStyle(document.body, null).getPropertyValue('font-size'), 10);

                for (var point in _breakpoints) {
                    var unitless = /\d+em/.test(point) ? parseFloat(point, 10) * em : /\d+px/.test(point) ? parseFloat(point, 10) : point;
                    _breakpoints[unitless] = parseFloat(_breakpoints[point], 10);
                }
            }

            /**
             * If we have multiple elements, loop through them, otherwise just
             * initialise the functionality on the single element.
             */

            if (len > 1) {
                while (len--) {
                    _init(targets[len]);
                }
            } else {
                _init(targets[0]);
            }
        };

        // parse CSS ...
        // To support elder browsers (IE8) ...
        var stateCheck = setInterval(function () {
            if (document.readyState === 'complete') {
                clearInterval(stateCheck);
                baseline();
                /* NOTE : some browsers are not pixel perfect now, e.g.
                // if there is absolute ::before or ::after ... CSS, so:
                */
                setTimeout(baseline, 200);
            }
        }, 100);

        return baseline;
    }();
    /**
     * Export baseline as a jQuery or Zepto plugin if any of them are loaded,
     * otherwise export as a browser global.
     */

    if (typeof $ !== "undefined") {
        $.extend($.fn, {
            baseline: function baseline(options) {
                return _baseline(this, options);
            }
        });
    } else {
        window.baseline = _baseline;
    }
})(window, window.jQuery || window.Zepto || undefined);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9iYXNlbGluZS5qcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCIkIiwiYmFzZWxpbmUiLCJjc3NBdHRyIiwiZ2V0RW1TaXplIiwiZWxlbWVudCIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiZm9udFNpemUiLCJnZXRDb21wdXRlZFN0eWxlIiwicGFyc2VGbG9hdCIsImNvbnZlcnRUb1B4IiwidmFsdWUiLCJudW1iZXJzIiwic3BsaXQiLCJ1bml0cyIsImxlbmd0aCIsImNsaWVudFdpZHRoIiwiY2xpZW50SGVpZ2h0IiwidnciLCJ2aCIsImNob29zZXIiLCJNYXRoIiwiZXh0cmFjdFF1ZXJ5IiwiY3NzIiwicmVwbGFjZSIsInEiLCJzZWwiLCJ2YWwiLCJyIiwiUmVnRXhwIiwiam9pbiIsImEiLCJiIiwic2hpZnQiLCJ0cmltIiwicmVhZFJ1bGVzIiwicnVsZXMiLCJhbGxRdWVyaWVzIiwic2VsZWN0b3IiLCJjc3NSIiwic2VhcmNoIiwicHVzaCIsImkiLCJqIiwidHlwZSIsInNlbGVjdG9yVGV4dCIsImNzc1RleHQiLCJjc3NSdWxlcyIsIl9iYXNlIiwiX2JyZWFrcG9pbnRzIiwiX2R5bmFtaWNCYXNlIiwiX3NldEJhc2UiLCJyZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiaGVpZ2h0IiwiaGFzT3duUHJvcGVydHkiLCJvZmZzZXRIZWlnaHQiLCJjdXJyZW50Iiwib2xkIiwia2V5IiwiYm9keSIsInN0eWxlIiwibWFyZ2luQm90dG9tIiwiX2luaXQiLCJzZXRBdHRyaWJ1dGUiLCJhZGRFdmVudExpc3RlbmVyIiwiYXR0YWNoRXZlbnQiLCJjc3NCYXNlbGluZVJ1bGVzIiwidGFyZ2V0cyIsInN0eWxlU2hlZXRzIiwiY29uY2F0IiwiZSIsIm5hbWUiLCJlbGVtZW50cyIsIm9wdGlvbnMiLCJyb290QmFzZWxpbmUiLCJjcmVhdGVFbGVtZW50IiwibGluZUhlaWdodCIsImZvckVhY2giLCJxdWVyeVNlbGVjdG9yQWxsIiwibGVuIiwiZW0iLCJnZXRQcm9wZXJ0eVZhbHVlIiwicG9pbnQiLCJ1bml0bGVzcyIsInRlc3QiLCJzdGF0ZUNoZWNrIiwic2V0SW50ZXJ2YWwiLCJyZWFkeVN0YXRlIiwiY2xlYXJJbnRlcnZhbCIsInNldFRpbWVvdXQiLCJleHRlbmQiLCJmbiIsImpRdWVyeSIsIlplcHRvIiwidW5kZWZpbmVkIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7Ozs7QUFVQyxXQUFVQSxNQUFWLEVBQWtCQyxDQUFsQixFQUFxQjs7QUFFbEI7O0FBRUEsUUFBSUMsWUFBWSxZQUFZO0FBQ3hCLFlBQUlDLFVBQVUsZUFBZDs7QUFFQTs7Ozs7Ozs7QUFRQSxpQkFBU0MsU0FBVCxDQUFtQkMsT0FBbkIsRUFBNEI7QUFDeEIsZ0JBQUksQ0FBQ0EsT0FBTCxFQUFjO0FBQ1ZBLDBCQUFVQyxTQUFTQyxlQUFuQjtBQUNIO0FBQ0QsZ0JBQUlDLFdBQVdSLE9BQU9TLGdCQUFQLENBQXdCSixPQUF4QixFQUFpQyxJQUFqQyxFQUF1Q0csUUFBdEQ7QUFDQSxtQkFBT0UsV0FBV0YsUUFBWCxLQUF3QixFQUEvQjtBQUNIOztBQUVELGlCQUFTRyxXQUFULENBQXFCTixPQUFyQixFQUE4Qk8sS0FBOUIsRUFBcUM7QUFDakMsZ0JBQUlDLFVBQVVELE1BQU1FLEtBQU4sQ0FBWSxJQUFaLENBQWQ7QUFDQSxnQkFBSUMsUUFBUUYsUUFBUUEsUUFBUUcsTUFBUixHQUFpQixDQUF6QixDQUFaO0FBQ0FKLG9CQUFRRixXQUFXRSxLQUFYLENBQVI7QUFDQSxvQkFBUUcsS0FBUjtBQUNJLHFCQUFLLElBQUw7QUFDSSwyQkFBT0gsS0FBUDtBQUNKLHFCQUFLLElBQUw7QUFDSSwyQkFBT0EsUUFBUVIsVUFBVUMsT0FBVixDQUFmO0FBQ0oscUJBQUssS0FBTDtBQUNJLDJCQUFPTyxRQUFRUixXQUFmO0FBQ0oscUJBQUssSUFBTDtBQUNJLDJCQUFPUSxRQUFRTixTQUFTQyxlQUFULENBQXlCVSxXQUFqQyxHQUErQyxHQUF0RDtBQUNKLHFCQUFLLElBQUw7QUFDSSwyQkFBT0ws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QU0sQ0FBVixFQUFhO0FBQ1QsdUJBQU9BLEtBQVAsRUFBYztBQUNWakIsMEJBQU1LLFFBQVFZLEdBQVIsQ0FBTjtBQUNIO0FBQ0osYUFKRCxNQUlPO0FBQ0hqQixzQkFBTUssUUFBUSxDQUFSLENBQU47QUFDSDtBQUNKOztBQUVEO0FBQ0E7QUFDQSxZQUFJa0IsYUFBYUMsWUFBWSxZQUFZO0FBQ3JDLGdCQUFJbEYsU0FBU21GLFVBQVQsS0FBd0IsVUFBNUIsRUFBd0M7QUFDcENDLDhCQUFjSCxVQUFkO0FBQ0FyRjtBQUNBOzs7QUFHQXlGLDJCQUFXekYsUUFBWCxFQUFxQixHQUFyQjtBQUNIO0FBQ0osU0FUZ0IsRUFTZCxHQVRjLENBQWpCOztBQVdBLGVBQU9BLFFBQVA7QUFFSCxLQWhSZSxFQUFoQjtBQWlSQTs7Ozs7QUFLQSxRQUFJLE9BQU9ELENBQVAsS0FBYSxXQUFqQixFQUE4QjtBQUMxQkEsVUFBRTJGLE1BQUYsQ0FBUzNGLEVBQUU0RixFQUFYLEVBQWU7QUFDWDNGLHNCQUFVLGtCQUFVeUUsT0FBVixFQUFtQjtBQUN6Qix1QkFBT3pFLFVBQVMsSUFBVCxFQUFleUUsT0FBZixDQUFQO0FBQ0g7QUFIVSxTQUFmO0FBS0gsS0FORCxNQU1PO0FBQ0gzRSxlQUFPRSxRQUFQLEdBQWtCQSxTQUFsQjtBQUNIO0FBRUosQ0FwU0EsRUFvU0NGLE1BcFNELEVBb1NTQSxPQUFPOEYsTUFBUCxJQUFpQjlGLE9BQU8rRixLQUF4QixJQUFpQ0MsU0FwUzFDLENBQUQiLCJmaWxlIjoibGliL2Jhc2VsaW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBCYXNlbGluZS5qcyAxLjFcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMywgRGFuaWVsIEVkZW4gaHR0cDovL2RhbmVkZW4ubWVcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBXVEZQTCBsaWNlbnNlXG4gKiBodHRwOi8vc2FtLnpveS5vcmcvd3RmcGwvXG4gKlxuICogRGF0ZTogMjAxNC0wNi0yMFxuICovXG5cbihmdW5jdGlvbiAod2luZG93LCAkKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgYmFzZWxpbmUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY3NzQXR0ciA9ICdkYXRhLWJhc2VsaW5lJztcblxuICAgICAgICAvKiogaW5zZXJ0XG4gICAgICAgICAqXG4gICAgICAgICAqIEBjb3B5cmlnaHQgaHR0cHM6Ly9naXRodWIuY29tL01yMGdyb2cvZWxlbWVudC1xdWVyeS9ibG9iL21hc3Rlci9MSUNFTlNFXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgICAgICogQHBhcmFtIHsqfSB2YWx1ZVxuICAgICAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGdldEVtU2l6ZShlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGZvbnRTaXplID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCwgbnVsbCkuZm9udFNpemU7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChmb250U2l6ZSkgfHwgMTY7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjb252ZXJ0VG9QeChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIG51bWJlcnMgPSB2YWx1ZS5zcGxpdCgvXFxkLyk7XG4gICAgICAgICAgICB2YXIgdW5pdHMgPSBudW1iZXJzW251bWJlcnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgICAgICAgICAgc3dpdGNoICh1bml0cykge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJweFwiOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgY2FzZSBcImVtXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAqIGdldEVtU2l6ZShlbGVtZW50KTtcbiAgICAgICAgICAgICAgICBjYXNlIFwicmVtXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAqIGdldEVtU2l6ZSgpO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJ2d1wiOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgKiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggLyAxMDA7XG4gICAgICAgICAgICAgICAgY2FzZSBcInZoXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAqIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgLyAxMDA7XG4gICAgICAgICAgICAgICAgY2FzZSBcInZtaW5cIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwidm1heFwiOlxuICAgICAgICAgICAgICAgICAgICB2YXIgdncgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggLyAxMDA7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2aCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgLyAxMDA7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaG9vc2VyID0gTWF0aFt1bml0cyA9PT0gXCJ2bWluXCIgPyBcIm1pblwiIDogXCJtYXhcIl07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAqIGNob29zZXIodncsIHZoKTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBub3csIG5vdCBzdXBwb3J0aW5nIHBoeXNpY2FsIHVuaXRzIChzaW5jZSB0aGV5IGFyZSBqdXN0IGEgc2V0IG51bWJlciBvZiBweClcbiAgICAgICAgICAgICAgICAgICAgLy8gb3IgZXgvY2ggKGdldHRpbmcgYWNjdXJhdGUgbWVhc3VyZW1lbnRzIGlzIGhhcmQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLyogZW5kICovXG5cbiAgICAgICAgLyogZXh0cmFjdCBDU1MgcnVsZXMgLi4uICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY3NzXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBleHRyYWN0UXVlcnkoY3NzKSB7XG4gICAgICAgICAgICBjc3MgPSBjc3MucmVwbGFjZSgvJy9nLCAnXCInKTtcbiAgICAgICAgICAgIHZhciBxID0ge1xuICAgICAgICAgICAgICAgIHNlbDogJycsXG4gICAgICAgICAgICAgICAgdmFsOiBudWxsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHIgPSBuZXcgUmVnRXhwKFsnXFxcXFtcXHM/JywgY3NzQXR0ciwgJ1xccz8nXS5qb2luKCcnKSwgJ2knKTtcbiAgICAgICAgICAgIHZhciBhID0gY3NzLnNwbGl0KHIpO1xuICAgICAgICAgICAgdmFyIGIgPSBhWzFdLnNwbGl0KC9dKC4rKT8vKTtcbiAgICAgICAgICAgIGFbMV0gPSBiLnNoaWZ0KCkucmVwbGFjZSgnPScsICcnKS5yZXBsYWNlKC9cIi9nLCAnJyk7XG4gICAgICAgICAgICBxLnNlbCA9IGFbMF0gKz0gYi5qb2luKCcnKS50cmltKCk7XG4gICAgICAgICAgICBxLnZhbCA9IGNvbnZlcnRUb1B4KGZhbHNlLCBhWzFdLnRyaW0oKSk7XG4gICAgICAgICAgICByZXR1cm4gcTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtDc3NSdWxlW118U3RyaW5nfSBydWxlc1xuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gcmVhZFJ1bGVzKHJ1bGVzKSB7XG4gICAgICAgICAgICB2YXIgYWxsUXVlcmllcyA9IFtdO1xuICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gJyc7XG4gICAgICAgICAgICB2YXIgY3NzUiA9IG5ldyBSZWdFeHAoWydcXFxcWyg/Olxcc1xccyspPycsIGNzc0F0dHIsICcoPzpcXHNcXHMrKT89J10uam9pbignJyksICdpJyk7XG4gICAgICAgICAgICBpZiAoIXJ1bGVzKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJ1bGVzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmIChydWxlcy5zZWFyY2goY3NzUikgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxsUXVlcmllcy5wdXNoKGV4dHJhY3RRdWVyeShydWxlcykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBydWxlcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKDEgPT09IHJ1bGVzW2ldLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gcnVsZXNbaV0uc2VsZWN0b3JUZXh0IHx8IHJ1bGVzW2ldLmNzc1RleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0b3Iuc2VhcmNoKGNzc1IpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsUXVlcmllcy5wdXNoKGV4dHJhY3RRdWVyeShzZWxlY3RvcikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKDQgPT09IHJ1bGVzW2ldLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRSdWxlcyhydWxlc1tpXS5jc3NSdWxlcyB8fCBydWxlc1tpXS5ydWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWxsUXVlcmllcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBgX2Jhc2VgIHdpbGwgbGF0ZXIgaG9sZCB0aGUgdmFsdWUgZm9yIHRoZSBjdXJyZW50IGJhc2VsaW5lIHRoYXQgbWF0Y2hlc1xuICAgICAgICAgKiB0aGUgZ2l2ZW4gYnJlYWtwb2ludC4gYF9icmVha3BvaW50c2Agd2lsbCBob2xkIGEgcmVmZXJlbmNlIHRvIGFsbFxuICAgICAgICAgKiBicmVha3BvaW50cyBnaXZlbiB0byB0aGUgYmFzZWxpbmUgY2FsbC5cbiAgICAgICAgICovXG4gICAgICAgIHZhciBfYmFzZSA9IDAsXG4gICAgICAgICAgICBfYnJlYWtwb2ludHMgPSB7fSxcbiAgICAgICAgICAgIF9keW5hbWljQmFzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG5hbWUgICAgIF9zZXRCYXNlXG4gICAgICAgICAqXG4gICAgICAgICAqIFNldCB0aGUgY29ycmVjdCBtYXJnaW4tYm90dG9tIG9uIHRoZSBnaXZlbiBlbGVtZW50IHRvIGdldCBiYWNrIHRvIHRoZVxuICAgICAgICAgKiBiYXNlbGluZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtICAgIHtFbGVtZW50fSAgZWxlbWVudFxuICAgICAgICAgKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cblxuICAgICAgICBmdW5jdGlvbiBfc2V0QmFzZShlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gKChyZWN0Lmhhc093blByb3BlcnR5KCdoZWlnaHQnKSkgPyByZWN0LmhlaWdodCA6IGVsZW1lbnQub2Zmc2V0SGVpZ2h0KSxcbiAgICAgICAgICAgICAgICBjdXJyZW50LCBvbGQ7XG5cbiAgICAgICAgICAgIGlmIChfZHluYW1pY0Jhc2UpIHtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIENvbXB1dGUgdGhlIF9iYXNlIHRocm91Z2ggYSB1c2VyIGRlZmluZWQgZnVuY3Rpb24gb24gZWFjaCBleGVjdXRpb24uXG4gICAgICAgICAgICAgICAgICogVGhpcyBjb3VsZCBiZSB1c2VkIHRvIGdldCB0aGUgY3VycmVudCBncmlkIHNpemUgZm9yIGRpZmZlcmVudCBicmVha3BvaW50c1xuICAgICAgICAgICAgICAgICAqIGZyb20gYW4gYWN0dWFsIGVsZW1lbnQgcHJvcGVydHkgaW5zdGVhZCBvZiBkZWZpbmluZyB0aG9zZSBicmVha3BvaW50cyBpbiB0aGUgb3B0aW9ucy5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBfYmFzZSA9IF9keW5hbWljQmFzZSgpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogSW4gdGhpcyBzdGVwIHdlIGxvb3AgdGhyb3VnaCBhbGwgdGhlIGJyZWFrcG9pbnRzLCBpZiBhbnkgd2VyZSBnaXZlbi5cbiAgICAgICAgICAgICAgICAgKiBJZiB0aGUgYmFzZWxpbmUgY2FsbCByZWNlaXZlZCBhIG51bWJlciBmcm9tIHRoZSBiZWdpbm5pbmcsIHRoaXMgbG9vcFxuICAgICAgICAgICAgICAgICAqIGlzIHNpbXBseSBpZ25vcmVkLlxuICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIF9icmVha3BvaW50cykge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0ga2V5O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoID4gY3VycmVudCAmJiBjdXJyZW50ID49IG9sZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2Jhc2UgPSBfYnJlYWtwb2ludHNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZCA9IGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBXZSBzZXQgdGhlIGVsZW1lbnQncyBtYXJnaW4tYm90dG9tIHN0eWxlIHRvIGEgbnVtYmVyIHRoYXQgcHVzaGVzIHRoZVxuICAgICAgICAgICAgICogYWRqYWNlbnQgZWxlbWVudCBkb3duIGZhciBlbm91Z2ggdG8gZ2V0IGJhY2sgb250byB0aGUgYmFzZWxpbmUuXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5tYXJnaW5Cb3R0b20gPSBfYmFzZSAtIChoZWlnaHQgJSBfYmFzZSkgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBuYW1lICAgICBfaW5pdFxuICAgICAgICAgKlxuICAgICAgICAgKiBDYWxsIGBfc2V0QmFzZSgpYCBvbiB0aGUgZ2l2ZW4gZWxlbWVudCBhbmQgYWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoZVxuICAgICAgICAgKiB3aW5kb3cgdG8gcmVzZXQgdGhlIGJhc2VsaW5lIG9uIHJlc2l6ZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtICAgIHtFbGVtZW50fSAgZWxlbWVudFxuICAgICAgICAgKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cblxuICAgICAgICBmdW5jdGlvbiBfaW5pdChlbGVtZW50KSB7XG4gICAgICAgICAgICBfc2V0QmFzZShlbGVtZW50KTtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGNzc0F0dHIsIF9iYXNlKTtcbiAgICAgICAgICAgIGlmICgnYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93KSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3NldEJhc2UoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgnYXR0YWNoRXZlbnQnIGluIHdpbmRvdykge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5hdHRhY2hFdmVudCgncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfc2V0QmFzZShlbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZWFyY2hlcyBhbGwgY3NzIHJ1bGVzIGFuZCBzZXR1cHMgdGhlIGV2ZW50IGxpc3RlbmVyIHRvIGFsbCBlbGVtZW50cyB3aXRoIGVsZW1lbnQgcXVlcnkgcnVsZXMuLlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gY3NzQmFzZWxpbmVSdWxlcygpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGRvY3VtZW50LnN0eWxlU2hlZXRzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldHMgPSB0YXJnZXRzLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRSdWxlcyhkb2N1bWVudC5zdHlsZVNoZWV0c1tpXS5jc3NSdWxlcyB8fCBkb2N1bWVudC5zdHlsZVNoZWV0c1tpXS5ydWxlcyB8fCBkb2N1bWVudC5zdHlsZVNoZWV0c1tpXS5jc3NUZXh0KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUubmFtZSAhPT0gJ1NlY3VyaXR5RXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldHM7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBuYW1lICAgICBiYXNlbGluZVxuICAgICAgICAgKlxuICAgICAgICAgKiBHZXRzIHRoZSBjb3JyZWN0IGVsZW1lbnRzIGFuZCBhdHRhY2hlcyB0aGUgYmFzZWxpbmUgYmVoYXZpb3VyIHRvIHRoZW0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSAgICB7U3RyaW5nL0VsZW1lbnQvTm9kZUxpc3R9ICBlbGVtZW50c1xuICAgICAgICAgKiBAcGFyYW0gICAge051bWJlci9PYmplY3R9ICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgKi9cblxuICAgICAgICBmdW5jdGlvbiBiYXNlbGluZShlbGVtZW50cywgb3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKCFlbGVtZW50cykge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIE5vIGVsZW1lbnRzID0gcGFyc2UgQ1NTIGZvciBbY3NzQXR0cl1cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB2YXIgcm9vdEJhc2VsaW5lID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpLCBudWxsKS5saW5lSGVpZ2h0O1xuICAgICAgICAgICAgICAgIGNzc0Jhc2VsaW5lUnVsZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChxKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VsaW5lKHEuc2VsLCAocS52YWwgfHwgKCh0eXBlb2Ygb3B0aW9ucyA9PT0gJ251bWJlcicpID8gb3B0aW9ucyA6IHJvb3RCYXNlbGluZSkpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEFjY2VwdCBhIE5vZGVMaXN0IG9yIGEgc2VsZWN0b3Igc3RyaW5nIGFuZCBzZXQgYHRhcmdldHNgIHRvIHRoZVxuICAgICAgICAgICAgICogcmVsZXZhbnQgZWxlbWVudHMuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHZhciB0YXJnZXRzID0gdHlwZW9mIGVsZW1lbnRzID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZWxlbWVudHMpIDogZWxlbWVudHMsXG4gICAgICAgICAgICAgICAgbGVuID0gdGFyZ2V0cy5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRGVjaWRlIHdoZXRoZXIgdG8gc2V0IHRoZSBgX2JyZWFrcG9pbnRzYCBvciBgX2R5bmFtaWNCYXNlYCB2YXJpYWJsZXMgb3Igbm90LlxuICAgICAgICAgICAgICogVGhpcyB3aWxsIGJlIHJlbGV2YW50IGluIHRoZSBgX3NldEJhc2UoKWAgZnVuY3Rpb24uXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIF9iYXNlID0gcGFyc2VGbG9hdChvcHRpb25zLCAxMCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgX2R5bmFtaWNCYXNlID0gb3B0aW9ucztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVtID0gcGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHksIG51bGwpLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtc2l6ZScpLCAxMCk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwb2ludCBpbiBfYnJlYWtwb2ludHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVuaXRsZXNzID0gL1xcZCtlbS8udGVzdChwb2ludCkgPyBwYXJzZUZsb2F0KHBvaW50LCAxMCkgKiBlbSA6IC9cXGQrcHgvLnRlc3QocG9pbnQpID8gcGFyc2VGbG9hdChwb2ludCwgMTApIDogcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgIF9icmVha3BvaW50c1t1bml0bGVzc10gPSBwYXJzZUZsb2F0KF9icmVha3BvaW50c1twb2ludF0sIDEwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSWYgd2UgaGF2ZSBtdWx0aXBsZSBlbGVtZW50cywgbG9vcCB0aHJvdWdoIHRoZW0sIG90aGVyd2lzZSBqdXN0XG4gICAgICAgICAgICAgKiBpbml0aWFsaXNlIHRoZSBmdW5jdGlvbmFsaXR5IG9uIHRoZSBzaW5nbGUgZWxlbWVudC5cbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICBpZiAobGVuID4gMSkge1xuICAgICAgICAgICAgICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgICAgICAgICAgICAgICBfaW5pdCh0YXJnZXRzW2xlbl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2luaXQodGFyZ2V0c1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gcGFyc2UgQ1NTIC4uLlxuICAgICAgICAvLyBUbyBzdXBwb3J0IGVsZGVyIGJyb3dzZXJzIChJRTgpIC4uLlxuICAgICAgICB2YXIgc3RhdGVDaGVjayA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChzdGF0ZUNoZWNrKTtcbiAgICAgICAgICAgICAgICBiYXNlbGluZSgpO1xuICAgICAgICAgICAgICAgIC8qIE5PVEUgOiBzb21lIGJyb3dzZXJzIGFyZSBub3QgcGl4ZWwgcGVyZmVjdCBub3csIGUuZy5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhYnNvbHV0ZSA6OmJlZm9yZSBvciA6OmFmdGVyIC4uLiBDU1MsIHNvOlxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChiYXNlbGluZSwgMjAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwKTtcblxuICAgICAgICByZXR1cm4gYmFzZWxpbmU7XG5cbiAgICB9KCkpO1xuICAgIC8qKlxuICAgICAqIEV4cG9ydCBiYXNlbGluZSBhcyBhIGpRdWVyeSBvciBaZXB0byBwbHVnaW4gaWYgYW55IG9mIHRoZW0gYXJlIGxvYWRlZCxcbiAgICAgKiBvdGhlcndpc2UgZXhwb3J0IGFzIGEgYnJvd3NlciBnbG9iYWwuXG4gICAgICovXG5cbiAgICBpZiAodHlwZW9mICQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgJC5leHRlbmQoJC5mbiwge1xuICAgICAgICAgICAgYmFzZWxpbmU6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJhc2VsaW5lKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3cuYmFzZWxpbmUgPSBiYXNlbGluZTtcbiAgICB9XG5cbn0od2luZG93LCB3aW5kb3cualF1ZXJ5IHx8IHdpbmRvdy5aZXB0byB8fCB1bmRlZmluZWQpKTtcbiJdfQ==
