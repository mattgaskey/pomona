'use strict';

/*
 * jQuery Accessible Accordion system, using ARIA
 * @version v2.5.2
 * Website: https://a11y.nicolas-hoffmann.net/accordion/
 * License MIT: https://github.com/nico3333fr/jquery-accessible-accordion-aria/blob/master/LICENSE
 */
(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(window.jQuery);
    }
})(function ($) {
    'use strict';

    var defaultConfig = {
        headersSelector: '.js-accordion__header',
        panelsSelector: '.js-accordion__panel',
        buttonsSelector: 'button.js-accordion__header',
        buttonsGeneratedContent: 'text',
        button: $('<button></button>', {
            class: 'js-accordion__header',
            type: 'button'
        }),
        buttonSuffixId: '_tab',
        multiselectable: true,
        prefixClass: 'accordion',
        headerSuffixClass: '__title',
        buttonSuffixClass: '__header',
        panelSuffixClass: '__panel',
        direction: 'ltr',
        accordionPrefixId: 'accordion'
    };

    var Accordion = function Accordion($el, options) {
        this.options = $.extend({}, defaultConfig, options);

        this.$wrapper = $el;
        this.$panels = $(this.options.panelsSelector, this.$wrapper);

        this.initAttributes();
        this.initEvents();
    };

    Accordion.prototype.initAttributes = function () {
        this.$wrapper.attr({
            'role': 'tablist',
            'aria-multiselectable': this.options.multiselectable.toString()
        }).addClass(this.options.prefixClass);

        // id generated if not present
        if (!this.$wrapper.attr('id')) {
            var index_lisible = Math.random().toString(32).slice(2, 12);
            this.$wrapper.attr('id', this.options.accordionPrefixId + '-' + index_lisible);
        }

        this.$panels.each($.proxy(function (index, el) {
            var $panel = $(el);
            var $header = $(this.options.headersSelector, $panel);
            var $button = this.options.buttonsGeneratedContent === 'html' ? this.options.button.clone().html($header.html()) : this.options.button.clone().text($header.text());

            $header.attr('tabindex', '0').addClass(this.options.prefixClass + this.options.headerSuffixClass);
            $panel.before($button);

            var panelId = $panel.attr('id') || this.$wrapper.attr('id') + '-' + index;
            var buttonId = panelId + this.options.buttonSuffixId;

            $button.attr({
                'aria-controls': panelId,
                'aria-expanded': 'false',
                'role': 'tab',
                'id': buttonId,
                'tabindex': '-1',
                'aria-selected': 'false'
            }).addClass(this.options.prefixClass + this.options.buttonSuffixClass);

            $panel.attr({
                'aria-labelledby': buttonId,
                'role': 'tabpanel',
                'id': panelId,
                'aria-hidden': 'true'
            }).addClass(this.options.prefixClass + this.options.panelSuffixClass);

            // if opened by default
            if ($panel.attr('data-accordion-opened') === 'true') {
                $button.attr({
                    'aria-expanded': 'true',
                    'data-accordion-opened': null
                });

                $panel.attr({
                    'aria-hidden': 'false'
                });
            }

            // init first one focusable
            if (index === 0) {
                $button.removeAttr('tabindex');
            }
        }, this));

        this.$buttons = $(this.options.buttonsSelector, this.$wrapper);
    };

    Accordion.prototype.initEvents = function () {
        this.$wrapper.on('focus', this.options.buttonsSelector, $.proxy(this.focusButtonEventHandler, this));

        this.$wrapper.on('click', this.options.buttonsSelector, $.proxy(this.clickButtonEventHandler, this));

        this.$wrapper.on('keydown', this.options.buttonsSelector, $.proxy(this.keydownButtonEventHandler, this));

        this.$wrapper.on('keydown', this.options.panelsSelector, $.proxy(this.keydownPanelEventHandler, this));
    };

    Accordion.prototype.focusButtonEventHandler = function (e) {
        var $target = $(e.target);
        var $button = $target.is('button') ? $target : $target.closest('button');

        $(this.options.buttonsSelector, this.$wrapper).attr({
            'tabindex': '-1',
            'aria-selected': 'false'
        });

        $button.attr({
            'aria-selected': 'true',
            'tabindex': null
        });
    };

    Accordion.prototype.clickButtonEventHandler = function (e) {
        var $target = $(e.target);
        var $button = $target.is('button') ? $target : $target.closest('button');
        var $panel = $('#' + $button.attr('aria-controls'));

        this.$buttons.attr('aria-selected', 'false');
        $button.attr('aria-selected', 'true');

        // opened or closed?
        if ($button.attr('aria-expanded') === 'false') {
            // closed
            $button.attr('aria-expanded', 'true');
            $panel.attr('aria-hidden', 'false');
        } else {
            // opened
            $button.attr('aria-expanded', 'false');
            $panel.attr('aria-hidden', 'true');
        }

        if (this.options.multiselectable === false) {
            this.$panels.not($panel).attr('aria-hidden', 'true');
            this.$buttons.not($button).attr('aria-expanded', 'false');
        }

        setTimeout(function () {
            $button.focus();
        }, 0);

        e.stopPropagation();
        e.preventDefault();
    };

    Accordion.prototype.keydownButtonEventHandler = function (e) {
        var $target = $(e.target);
        var $button = $target.is('button') ? $target : $target.closest('button');
        var $firstButton = this.$buttons.first();
        var $lastButton = this.$buttons.last();
        var index = this.$buttons.index($button);

        $target = null;

        var k = this.options.direction === 'ltr' ? {
            prev: [38, 37], // up & left
            next: [40, 39], // down & right
            first: 36, // home
            last: 35 // end
        } : {
            prev: [38, 39], // up & left
            next: [40, 37], // down & right
            first: 36, // home
            last: 35 // end
        };

        var allKeyCode = [].concat(k.prev, k.next, k.first, k.last);

        if ($.inArray(e.keyCode, allKeyCode) >= 0 && !e.ctrlKey) {
            this.$buttons.attr({
                'tabindex': '-1',
                'aria-selected': 'false'
            });

            if (e.keyCode === 36) {
                $target = $firstButton;
            }
            // strike end in the tab => last tab
            else if (e.keyCode === 35) {
                    $target = $lastButton;
                }
                // strike up or left in the tab => previous tab
                else if ($.inArray(e.keyCode, k.prev) >= 0) {
                        // if we are on first one, activate last
                        $target = $button.is($firstButton) ? $lastButton : this.$buttons.eq(index - 1);
                    }
                    // strike down or right in the tab => next tab
                    else if ($.inArray(e.keyCode, k.next) >= 0) {
                            // if we are on last one, activate first
                            $target = $button.is($lastButton) ? $firstButton : this.$buttons.eq(index + 1);
                        }

            if ($target !== null) {
                this.goToHeader($target);
            }

            e.preventDefault();
        }
    };

    Accordion.prototype.keydownPanelEventHandler = function (e) {
        var $panel = $(e.target).closest(this.options.panelsSelector);
        var $button = $('#' + $panel.attr('aria-labelledby'));
        var $firstButton = this.$buttons.first();
        var $lastButton = this.$buttons.last();
        var index = this.$buttons.index($button);
        var $target = null;

        // strike up + ctrl => go to header
        if (e.keyCode === 38 && e.ctrlKey) {
            $target = $button;
        }
        // strike pageup + ctrl => go to prev header
        else if (e.keyCode === 33 && e.ctrlKey) {
                $target = $button.is($firstButton) ? $lastButton : this.$buttons.eq(index - 1);
            }
            // strike pagedown + ctrl => go to next header
            else if (e.keyCode === 34 && e.ctrlKey) {
                    $target = $button.is($lastButton) ? $firstButton : this.$buttons.eq(index + 1);
                }

        if ($target !== null) {
            this.goToHeader($target);
            e.preventDefault();
        }
    };

    Accordion.prototype.goToHeader = function ($target) {
        if ($target.length !== 1) {
            return;
        }

        $target.attr({
            'aria-selected': 'true',
            'tabindex': null
        });

        setTimeout(function () {
            $target.focus();
        }, 0);
    };

    var PLUGIN = 'accordion';

    $.fn[PLUGIN] = function (params) {
        var options = $.extend({}, $.fn[PLUGIN].defaults, params);

        return this.each(function () {
            var $el = $(this);

            var specificOptions = {
                multiselectable: $el.attr('data-accordion-multiselectable') === 'none' ? false : options.multiselectable,
                prefixClass: typeof $el.attr('data-accordion-prefix-classes') !== 'undefined' ? $el.attr('data-accordion-prefix-classes') : options.prefixClass,
                buttonsGeneratedContent: typeof $el.attr('data-accordion-button-generated-content') !== 'undefined' ? $el.attr('data-accordion-button-generated-content') : options.buttonsGeneratedContent,
                direction: $el.closest('[dir="rtl"]').length > 0 ? 'rtl' : options.direction
            };
            specificOptions = $.extend({}, options, specificOptions);

            $el.data[PLUGIN] = new Accordion($el, specificOptions);
        });
    };

    $.fn[PLUGIN].defaults = defaultConfig;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qcXVlcnktYWNjZXNzaWJsZS1hY2NvcmRpb24uanMiXSwibmFtZXMiOlsiZmFjdG9yeSIsImRlZmluZSIsImFtZCIsImV4cG9ydHMiLCJtb2R1bGUiLCJyZXF1aXJlIiwid2luZG93IiwialF1ZXJ5IiwiJCIsImRlZmF1bHRDb25maWciLCJoZWFkZXJzU2VsZWN0b3IiLCJwYW5lbHNTZWxlY3RvciIsImJ1dHRvbnNTZWxlY3RvciIsImJ1dHRvbnNHZW5lcmF0ZWRDb250ZW50IiwiYnV0dG9uIiwiY2xhc3MiLCJ0eXBlIiwiYnV0dG9uU3VmZml4SWQiLCJtdWx0aXNlbGVjdGFibGUiLCJwcmVmaXhDbGFzcyIsImhlYWRlclN1ZmZpeENsYXNzIiwiYnV0dG9uU3VmZml4Q2xhc3MiLCJwYW5lbFN1ZmZpeENsYXNzIiwiZGlyZWN0aW9uIiwiYWNjb3JkaW9uUHJlZml4SWQiLCJBY2NvcmRpb24iLCIkZWwiLCJvcHRpb25zIiwiZXh0ZW5kIiwiJHdyYXBwZXIiLCIkcGFuZWxzIiwiaW5pdEF0dHJpYnV0ZXMiLCJpbml0RXZlbnRzIiwicHJvdG90eXBlIiwiYXR0ciIsInRvU3RyaW5nIiwiYWRkQ2xhc3MiLCJpbmRleF9saXNpYmxlIiwiTWF0aCIsInJhbmRvbSIsInNsaWNlIiwiZWFjaCIsInByb3h5IiwiaW5kZXgiLCJlbCIsIiRwYW5lbCIsIiRoZWFkZXIiLCIkYnV0dG9uIiwiY2xvbmUiLCJodG1sIiwidGV4dCIsImJlZm9yZSIsInBhbmVsSWQiLCJidXR0b25JZCIsInJlbW92ZUF0dHIiLCIkYnV0dG9ucyIsIm9uIiwiZm9jdXNCdXR0b25FdmVudEhhbmRsZXIiLCJjbGlja0J1dHRvbkV2ZW50SGFuZGxlciIsImtleWRvd25CdXR0b25FdmVudEhhbmRsZXIiLCJrZXlkb3duUGFuZWxFdmVudEhhbmRsZXIiLCJlIiwiJHRhcmdldCIsInRhcmdldCIsImlzIiwiY2xvc2VzdCIsIm5vdCIsInNldFRpbWVvdXQiLCJmb2N1cyIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiJGZpcnN0QnV0dG9uIiwiZmlyc3QiLCIkbGFzdEJ1dHRvbiIsImxhc3QiLCJrIiwicHJldiIsIm5leHQiLCJhbGxLZXlDb2RlIiwiY29uY2F0IiwiaW5BcnJheSIsImtleUNvZGUiLCJjdHJsS2V5IiwiZXEiLCJnb1RvSGVhZGVyIiwibGVuZ3RoIiwiUExVR0lOIiwiZm4iLCJwYXJhbXMiLCJkZWZhdWx0cyIsInNwZWNpZmljT3B0aW9ucyIsImRhdGEiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztBQU1DLFdBQVNBLE9BQVQsRUFBa0I7QUFDZjs7QUFDQSxRQUFJLE9BQU9DLE1BQVAsS0FBa0IsVUFBbEIsSUFBZ0NBLE9BQU9DLEdBQTNDLEVBQWdEO0FBQzVDRCxlQUFPLENBQUMsUUFBRCxDQUFQLEVBQW1CRCxPQUFuQjtBQUNILEtBRkQsTUFFTyxJQUFJLE9BQU9HLE9BQVAsS0FBbUIsV0FBdkIsRUFBb0M7QUFDdkNDLGVBQU9ELE9BQVAsR0FBaUJILFFBQVFLLFFBQVEsUUFBUixDQUFSLENBQWpCO0FBQ0gsS0FGTSxNQUVBO0FBQ0hMLGdCQUFRTSxPQUFPQyxNQUFmO0FBQ0g7QUFDSixDQVRBLEVBU0MsVUFBU0MsQ0FBVCxFQUFZO0FBQ1Y7O0FBRUEsUUFBSUMsZ0JBQWdCO0FBQ2hCQyx5QkFBaUIsdUJBREQ7QUFFaEJDLHdCQUFnQixzQkFGQTtBQUdoQkMseUJBQWlCLDZCQUhEO0FBSWhCQyxpQ0FBeUIsTUFKVDtBQUtoQkMsZ0JBQVFOLEVBQUUsbUJBQUYsRUFBdUI7QUFDM0JPLG1CQUFPLHNCQURvQjtBQUUzQkMsa0JBQU07QUFGcUIsU0FBdkIsQ0FMUTtBQVNoQkMsd0JBQWdCLE1BVEE7QUFVaEJDLHlCQUFpQixJQVZEO0FBV2hCQyxxQkFBYSxXQVhHO0FBWWhCQywyQkFBbUIsU0FaSDtBQWFoQkMsMkJBQW1CLFVBYkg7QUFjaEJDLDBCQUFrQixTQWRGO0FBZWhCQyxtQkFBVyxLQWZLO0FBZ0JoQkMsMkJBQW1CO0FBaEJILEtBQXBCOztBQW1CQSxRQUFJ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LElBQUlRLElBQUosQ0FBUywrQkFBVCxDQUFQLEtBQXNELFdBQXRELEdBQW9FUixJQUFJUSxJQUFKLENBQVMsK0JBQVQsQ0FBcEUsR0FBZ0hQLFFBQVFSLFdBRm5IO0FBR2xCTix5Q0FBeUIsT0FBT2EsSUFBSVEsSUFBSixDQUFTLHlDQUFULENBQVAsS0FBZ0UsV0FBaEUsR0FBOEVSLElBQUlRLElBQUosQ0FBUyx5Q0FBVCxDQUE5RSxHQUFvSVAsUUFBUWQsdUJBSG5KO0FBSWxCVSwyQkFBV0csSUFBSXVDLE9BQUosQ0FBWSxhQUFaLEVBQTJCb0IsTUFBM0IsR0FBb0MsQ0FBcEMsR0FBd0MsS0FBeEMsR0FBZ0QxRCxRQUFRSjtBQUpqRCxhQUF0QjtBQU1BbUUsOEJBQWtCbEYsRUFBRW9CLE1BQUYsQ0FBUyxFQUFULEVBQWFELE9BQWIsRUFBc0IrRCxlQUF0QixDQUFsQjs7QUFFQWhFLGdCQUFJaUUsSUFBSixDQUFTTCxNQUFULElBQW1CLElBQUk3RCxTQUFKLENBQWNDLEdBQWQsRUFBbUJnRSxlQUFuQixDQUFuQjtBQUNILFNBWk0sQ0FBUDtBQWFILEtBakJEOztBQW1CQWxGLE1BQUUrRSxFQUFGLENBQUtELE1BQUwsRUFBYUcsUUFBYixHQUF3QmhGLGFBQXhCO0FBRUgsQ0F0UkEsQ0FBRCIsImZpbGUiOiJsaWIvanF1ZXJ5LWFjY2Vzc2libGUtYWNjb3JkaW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIGpRdWVyeSBBY2Nlc3NpYmxlIEFjY29yZGlvbiBzeXN0ZW0sIHVzaW5nIEFSSUFcbiAqIEB2ZXJzaW9uIHYyLjUuMlxuICogV2Vic2l0ZTogaHR0cHM6Ly9hMTF5Lm5pY29sYXMtaG9mZm1hbm4ubmV0L2FjY29yZGlvbi9cbiAqIExpY2Vuc2UgTUlUOiBodHRwczovL2dpdGh1Yi5jb20vbmljbzMzMzNmci9qcXVlcnktYWNjZXNzaWJsZS1hY2NvcmRpb24tYXJpYS9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKi9cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmFjdG9yeSh3aW5kb3cualF1ZXJ5KTtcbiAgICB9XG59KGZ1bmN0aW9uKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgICAgICAgaGVhZGVyc1NlbGVjdG9yOiAnLmpzLWFjY29yZGlvbl9faGVhZGVyJyxcbiAgICAgICAgcGFuZWxzU2VsZWN0b3I6ICcuanMtYWNjb3JkaW9uX19wYW5lbCcsXG4gICAgICAgIGJ1dHRvbnNTZWxlY3RvcjogJ2J1dHRvbi5qcy1hY2NvcmRpb25fX2hlYWRlcicsXG4gICAgICAgIGJ1dHRvbnNHZW5lcmF0ZWRDb250ZW50OiAndGV4dCcsXG4gICAgICAgIGJ1dHRvbjogJCgnPGJ1dHRvbj48L2J1dHRvbj4nLCB7XG4gICAgICAgICAgICBjbGFzczogJ2pzLWFjY29yZGlvbl9faGVhZGVyJyxcbiAgICAgICAgICAgIHR5cGU6ICdidXR0b24nXG4gICAgICAgIH0pLFxuICAgICAgICBidXR0b25TdWZmaXhJZDogJ190YWInLFxuICAgICAgICBtdWx0aXNlbGVjdGFibGU6IHRydWUsXG4gICAgICAgIHByZWZpeENsYXNzOiAnYWNjb3JkaW9uJyxcbiAgICAgICAgaGVhZGVyU3VmZml4Q2xhc3M6ICdfX3RpdGxlJyxcbiAgICAgICAgYnV0dG9uU3VmZml4Q2xhc3M6ICdfX2hlYWRlcicsXG4gICAgICAgIHBhbmVsU3VmZml4Q2xhc3M6ICdfX3BhbmVsJyxcbiAgICAgICAgZGlyZWN0aW9uOiAnbHRyJyxcbiAgICAgICAgYWNjb3JkaW9uUHJlZml4SWQ6ICdhY2NvcmRpb24nXG4gICAgfTtcblxuICAgIHZhciBBY2NvcmRpb24gPSBmdW5jdGlvbigkZWwsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRDb25maWcsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuJHdyYXBwZXIgPSAkZWw7XG4gICAgICAgIHRoaXMuJHBhbmVscyA9ICQodGhpcy5vcHRpb25zLnBhbmVsc1NlbGVjdG9yLCB0aGlzLiR3cmFwcGVyKTtcblxuICAgICAgICB0aGlzLmluaXRBdHRyaWJ1dGVzKCk7XG4gICAgICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICAgIH07XG5cbiAgICBBY2NvcmRpb24ucHJvdG90eXBlLmluaXRBdHRyaWJ1dGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHdyYXBwZXIuYXR0cih7XG4gICAgICAgICAgICAncm9sZSc6ICd0YWJsaXN0JyxcbiAgICAgICAgICAgICdhcmlhLW11bHRpc2VsZWN0YWJsZSc6IHRoaXMub3B0aW9ucy5tdWx0aXNlbGVjdGFibGUudG9TdHJpbmcoKVxuICAgICAgICB9KS5hZGRDbGFzcyh0aGlzLm9wdGlvbnMucHJlZml4Q2xhc3MpO1xuXG4gICAgICAgIC8vIGlkIGdlbmVyYXRlZCBpZiBub3QgcHJlc2VudFxuICAgICAgICBpZiAoIXRoaXMuJHdyYXBwZXIuYXR0cignaWQnKSkge1xuICAgICAgICAgICAgdmFyIGluZGV4X2xpc2libGUgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDMyKS5zbGljZSgyLCAxMik7XG4gICAgICAgICAgICB0aGlzLiR3cmFwcGVyLmF0dHIoJ2lkJywgdGhpcy5vcHRpb25zLmFjY29yZGlvblByZWZpeElkICsgJy0nICsgaW5kZXhfbGlzaWJsZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLiRwYW5lbHMuZWFjaCgkLnByb3h5KGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQoZWwpO1xuICAgICAgICAgICAgdmFyICRoZWFkZXIgPSAkKHRoaXMub3B0aW9ucy5oZWFkZXJzU2VsZWN0b3IsICRwYW5lbCk7XG4gICAgICAgICAgICB2YXIgJGJ1dHRvbiA9IHRoaXMub3B0aW9ucy5idXR0b25zR2VuZXJhdGVkQ29udGVudCA9PT0gJ2h0bWwnID8gdGhpcy5vcHRpb25zLmJ1dHRvbi5jbG9uZSgpLmh0bWwoJGhlYWRlci5odG1sKCkpIDogdGhpcy5vcHRpb25zLmJ1dHRvbi5jbG9uZSgpLnRleHQoJGhlYWRlci50ZXh0KCkpO1xuXG4gICAgICAgICAgICAkaGVhZGVyLmF0dHIoJ3RhYmluZGV4JywgJzAnKS5hZGRDbGFzcyh0aGlzLm9wdGlvbnMucHJlZml4Q2xhc3MgKyB0aGlzLm9wdGlvbnMuaGVhZGVyU3VmZml4Q2xhc3MpO1xuICAgICAgICAgICAgJHBhbmVsLmJlZm9yZSgkYnV0dG9uKTtcblxuICAgICAgICAgICAgdmFyIHBhbmVsSWQgPSAkcGFuZWwuYXR0cignaWQnKSB8fCB0aGlzLiR3cmFwcGVyLmF0dHIoJ2lkJykgKyAnLScgKyBpbmRleDtcbiAgICAgICAgICAgIHZhciBidXR0b25JZCA9IHBhbmVsSWQgKyB0aGlzLm9wdGlvbnMuYnV0dG9uU3VmZml4SWQ7XG5cbiAgICAgICAgICAgICRidXR0b24uYXR0cih7XG4gICAgICAgICAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBwYW5lbElkLFxuICAgICAgICAgICAgICAgICdhcmlhLWV4cGFuZGVkJzogJ2ZhbHNlJyxcbiAgICAgICAgICAgICAgICAncm9sZSc6ICd0YWInLFxuICAgICAgICAgICAgICAgICdpZCc6IGJ1dHRvbklkLFxuICAgICAgICAgICAgICAgICd0YWJpbmRleCc6ICctMScsXG4gICAgICAgICAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiAnZmFsc2UnXG4gICAgICAgICAgICB9KS5hZGRDbGFzcyh0aGlzLm9wdGlvbnMucHJlZml4Q2xhc3MgKyB0aGlzLm9wdGlvbnMuYnV0dG9uU3VmZml4Q2xhc3MpO1xuXG4gICAgICAgICAgICAkcGFuZWwuYXR0cih7XG4gICAgICAgICAgICAgICAgJ2FyaWEtbGFiZWxsZWRieSc6IGJ1dHRvbklkLFxuICAgICAgICAgICAgICAgICdyb2xlJzogJ3RhYnBhbmVsJyxcbiAgICAgICAgICAgICAgICAnaWQnOiBwYW5lbElkLFxuICAgICAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJ1xuICAgICAgICAgICAgfSkuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnByZWZpeENsYXNzICsgdGhpcy5vcHRpb25zLnBhbmVsU3VmZml4Q2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBpZiBvcGVuZWQgYnkgZGVmYXVsdFxuICAgICAgICAgICAgaWYgKCRwYW5lbC5hdHRyKCdkYXRhLWFjY29yZGlvbi1vcGVuZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgICAgJGJ1dHRvbi5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiAndHJ1ZScsXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLWFjY29yZGlvbi1vcGVuZWQnOiBudWxsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAkcGFuZWwuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICdmYWxzZSdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaW5pdCBmaXJzdCBvbmUgZm9jdXNhYmxlXG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAkYnV0dG9uLnJlbW92ZUF0dHIoJ3RhYmluZGV4Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgICB0aGlzLiRidXR0b25zID0gJCh0aGlzLm9wdGlvbnMuYnV0dG9uc1NlbGVjdG9yLCB0aGlzLiR3cmFwcGVyKTtcbiAgICB9O1xuXG4gICAgQWNjb3JkaW9uLnByb3RvdHlwZS5pbml0RXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHdyYXBwZXIub24oJ2ZvY3VzJywgdGhpcy5vcHRpb25zLmJ1dHRvbnNTZWxlY3RvciwgJC5wcm94eSh0aGlzLmZvY3VzQnV0dG9uRXZlbnRIYW5kbGVyLCB0aGlzKSk7XG5cbiAgICAgICAgdGhpcy4kd3JhcHBlci5vbignY2xpY2snLCB0aGlzLm9wdGlvbnMuYnV0dG9uc1NlbGVjdG9yLCAkLnByb3h5KHRoaXMuY2xpY2tCdXR0b25FdmVudEhhbmRsZXIsIHRoaXMpKTtcblxuICAgICAgICB0aGlzLiR3cmFwcGVyLm9uKCdrZXlkb3duJywgdGhpcy5vcHRpb25zLmJ1dHRvbnNTZWxlY3RvciwgJC5wcm94eSh0aGlzLmtleWRvd25CdXR0b25FdmVudEhhbmRsZXIsIHRoaXMpKTtcblxuICAgICAgICB0aGlzLiR3cmFwcGVyLm9uKCdrZXlkb3duJywgdGhpcy5vcHRpb25zLnBhbmVsc1NlbGVjdG9yLCAkLnByb3h5KHRoaXMua2V5ZG93blBhbmVsRXZlbnRIYW5kbGVyLCB0aGlzKSk7XG4gICAgfTtcblxuICAgIEFjY29yZGlvbi5wcm90b3R5cGUuZm9jdXNCdXR0b25FdmVudEhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XG4gICAgICAgIHZhciAkYnV0dG9uID0gJHRhcmdldC5pcygnYnV0dG9uJykgPyAkdGFyZ2V0IDogJHRhcmdldC5jbG9zZXN0KCdidXR0b24nKTtcblxuICAgICAgICAkKHRoaXMub3B0aW9ucy5idXR0b25zU2VsZWN0b3IsIHRoaXMuJHdyYXBwZXIpLmF0dHIoe1xuICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJyxcbiAgICAgICAgICAgICdhcmlhLXNlbGVjdGVkJzogJ2ZhbHNlJ1xuICAgICAgICB9KTtcblxuICAgICAgICAkYnV0dG9uLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZScsXG4gICAgICAgICAgICAndGFiaW5kZXgnOiBudWxsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBBY2NvcmRpb24ucHJvdG90eXBlLmNsaWNrQnV0dG9uRXZlbnRIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xuICAgICAgICB2YXIgJGJ1dHRvbiA9ICR0YXJnZXQuaXMoJ2J1dHRvbicpID8gJHRhcmdldCA6ICR0YXJnZXQuY2xvc2VzdCgnYnV0dG9uJyk7XG4gICAgICAgIHZhciAkcGFuZWwgPSAkKCcjJyArICRidXR0b24uYXR0cignYXJpYS1jb250cm9scycpKTtcblxuICAgICAgICB0aGlzLiRidXR0b25zLmF0dHIoJ2FyaWEtc2VsZWN0ZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgJGJ1dHRvbi5hdHRyKCdhcmlhLXNlbGVjdGVkJywgJ3RydWUnKTtcblxuICAgICAgICAvLyBvcGVuZWQgb3IgY2xvc2VkP1xuICAgICAgICBpZiAoJGJ1dHRvbi5hdHRyKCdhcmlhLWV4cGFuZGVkJykgPT09ICdmYWxzZScpIHsgLy8gY2xvc2VkXG4gICAgICAgICAgICAkYnV0dG9uLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgJHBhbmVsLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgICAgIH0gZWxzZSB7IC8vIG9wZW5lZFxuICAgICAgICAgICAgJGJ1dHRvbi5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgICAkcGFuZWwuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tdWx0aXNlbGVjdGFibGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLiRwYW5lbHMubm90KCRwYW5lbCkuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICAgICAgdGhpcy4kYnV0dG9ucy5ub3QoJGJ1dHRvbikuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRidXR0b24uZm9jdXMoKTtcbiAgICAgICAgfSwgMCk7XG5cbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH07XG5cbiAgICBBY2NvcmRpb24ucHJvdG90eXBlLmtleWRvd25CdXR0b25FdmVudEhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XG4gICAgICAgIHZhciAkYnV0dG9uID0gJHRhcmdldC5pcygnYnV0dG9uJykgPyAkdGFyZ2V0IDogJHRhcmdldC5jbG9zZXN0KCdidXR0b24nKTtcbiAgICAgICAgdmFyICRmaXJzdEJ1dHRvbiA9IHRoaXMuJGJ1dHRvbnMuZmlyc3QoKTtcbiAgICAgICAgdmFyICRsYXN0QnV0dG9uID0gdGhpcy4kYnV0dG9ucy5sYXN0KCk7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuJGJ1dHRvbnMuaW5kZXgoJGJ1dHRvbik7XG5cbiAgICAgICAgJHRhcmdldCA9IG51bGw7XG5cbiAgICAgICAgdmFyIGsgPSB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID09PSAnbHRyJyA/IHtcbiAgICAgICAgICAgIHByZXY6IFszOCwgMzddLCAvLyB1cCAmIGxlZnRcbiAgICAgICAgICAgIG5leHQ6IFs0MCwgMzldLCAvLyBkb3duICYgcmlnaHRcbiAgICAgICAgICAgIGZpcnN0OiAzNiwgLy8gaG9tZVxuICAgICAgICAgICAgbGFzdDogMzUgLy8gZW5kXG4gICAgICAgIH0gOiB7XG4gICAgICAgICAgICBwcmV2OiBbMzgsIDM5XSwgLy8gdXAgJiBsZWZ0XG4gICAgICAgICAgICBuZXh0OiBbNDAsIDM3XSwgLy8gZG93biAmIHJpZ2h0XG4gICAgICAgICAgICBmaXJzdDogMzYsIC8vIGhvbWVcbiAgICAgICAgICAgIGxhc3Q6IDM1IC8vIGVuZFxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBhbGxLZXlDb2RlID0gW10uY29uY2F0KGsucHJldiwgay5uZXh0LCBrLmZpcnN0LCBrLmxhc3QpO1xuXG4gICAgICAgIGlmICgkLmluQXJyYXkoZS5rZXlDb2RlLCBhbGxLZXlDb2RlKSA+PSAwICYmICFlLmN0cmxLZXkpIHtcbiAgICAgICAgICAgIHRoaXMuJGJ1dHRvbnMuYXR0cih7XG4gICAgICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJyxcbiAgICAgICAgICAgICAgICAnYXJpYS1zZWxlY3RlZCc6ICdmYWxzZSdcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDM2KSB7XG4gICAgICAgICAgICAgICAgJHRhcmdldCA9ICRmaXJzdEJ1dHRvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHN0cmlrZSBlbmQgaW4gdGhlIHRhYiA9PiBsYXN0IHRhYlxuICAgICAgICAgICAgZWxzZSBpZiAoZS5rZXlDb2RlID09PSAzNSkge1xuICAgICAgICAgICAgICAgICR0YXJnZXQgPSAkbGFzdEJ1dHRvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHN0cmlrZSB1cCBvciBsZWZ0IGluIHRoZSB0YWIgPT4gcHJldmlvdXMgdGFiXG4gICAgICAgICAgICBlbHNlIGlmICgkLmluQXJyYXkoZS5rZXlDb2RlLCBrLnByZXYpID49IDApIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBhcmUgb24gZmlyc3Qgb25lLCBhY3RpdmF0ZSBsYXN0XG4gICAgICAgICAgICAgICAgJHRhcmdldCA9ICRidXR0b24uaXMoJGZpcnN0QnV0dG9uKSA/ICRsYXN0QnV0dG9uIDogdGhpcy4kYnV0dG9ucy5lcShpbmRleCAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gc3RyaWtlIGRvd24gb3IgcmlnaHQgaW4gdGhlIHRhYiA9PiBuZXh0IHRhYlxuICAgICAgICAgICAgZWxzZSBpZiAoJC5pbkFycmF5KGUua2V5Q29kZSwgay5uZXh0KSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgYXJlIG9uIGxhc3Qgb25lLCBhY3RpdmF0ZSBmaXJzdFxuICAgICAgICAgICAgICAgICR0YXJnZXQgPSAkYnV0dG9uLmlzKCRsYXN0QnV0dG9uKSA/ICRmaXJzdEJ1dHRvbiA6IHRoaXMuJGJ1dHRvbnMuZXEoaW5kZXggKyAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCR0YXJnZXQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdvVG9IZWFkZXIoJHRhcmdldCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBBY2NvcmRpb24ucHJvdG90eXBlLmtleWRvd25QYW5lbEV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRwYW5lbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QodGhpcy5vcHRpb25zLnBhbmVsc1NlbGVjdG9yKTtcbiAgICAgICAgdmFyICRidXR0b24gPSAkKCcjJyArICRwYW5lbC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKSk7XG4gICAgICAgIHZhciAkZmlyc3RCdXR0b24gPSB0aGlzLiRidXR0b25zLmZpcnN0KCk7XG4gICAgICAgIHZhciAkbGFzdEJ1dHRvbiA9IHRoaXMuJGJ1dHRvbnMubGFzdCgpO1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLiRidXR0b25zLmluZGV4KCRidXR0b24pO1xuICAgICAgICB2YXIgJHRhcmdldCA9IG51bGw7XG5cbiAgICAgICAgLy8gc3RyaWtlIHVwICsgY3RybCA9PiBnbyB0byBoZWFkZXJcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzggJiYgZS5jdHJsS2V5KSB7XG4gICAgICAgICAgICAkdGFyZ2V0ID0gJGJ1dHRvbjtcbiAgICAgICAgfVxuICAgICAgICAvLyBzdHJpa2UgcGFnZXVwICsgY3RybCA9PiBnbyB0byBwcmV2IGhlYWRlclxuICAgICAgICBlbHNlIGlmIChlLmtleUNvZGUgPT09IDMzICYmIGUuY3RybEtleSkge1xuICAgICAgICAgICAgJHRhcmdldCA9ICRidXR0b24uaXMoJGZpcnN0QnV0dG9uKSA/ICRsYXN0QnV0dG9uIDogdGhpcy4kYnV0dG9ucy5lcShpbmRleCAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHN0cmlrZSBwYWdlZG93biArIGN0cmwgPT4gZ28gdG8gbmV4dCBoZWFkZXJcbiAgICAgICAgZWxzZSBpZiAoZS5rZXlDb2RlID09PSAzNCAmJiBlLmN0cmxLZXkpIHtcbiAgICAgICAgICAgICR0YXJnZXQgPSAkYnV0dG9uLmlzKCRsYXN0QnV0dG9uKSA/ICRmaXJzdEJ1dHRvbiA6IHRoaXMuJGJ1dHRvbnMuZXEoaW5kZXggKyAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkdGFyZ2V0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmdvVG9IZWFkZXIoJHRhcmdldCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQWNjb3JkaW9uLnByb3RvdHlwZS5nb1RvSGVhZGVyID0gZnVuY3Rpb24oJHRhcmdldCkge1xuICAgICAgICBpZiAoJHRhcmdldC5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICR0YXJnZXQuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1zZWxlY3RlZCc6ICd0cnVlJyxcbiAgICAgICAgICAgICd0YWJpbmRleCc6IG51bGxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICR0YXJnZXQuZm9jdXMoKTtcbiAgICAgICAgfSwgMCk7XG4gICAgfTtcblxuXG4gICAgdmFyIFBMVUdJTiA9ICdhY2NvcmRpb24nO1xuXG4gICAgJC5mbltQTFVHSU5dID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe30sICQuZm5bUExVR0lOXS5kZWZhdWx0cywgcGFyYW1zKTtcblxuXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgJGVsID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgdmFyIHNwZWNpZmljT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBtdWx0aXNlbGVjdGFibGU6ICRlbC5hdHRyKCdkYXRhLWFjY29yZGlvbi1tdWx0aXNlbGVjdGFibGUnKSA9PT0gJ25vbmUnID8gZmFsc2UgOiBvcHRpb25zLm11bHRpc2VsZWN0YWJsZSxcbiAgICAgICAgICAgICAgICBwcmVmaXhDbGFzczogdHlwZW9mKCRlbC5hdHRyKCdkYXRhLWFjY29yZGlvbi1wcmVmaXgtY2xhc3NlcycpKSAhPT0gJ3VuZGVmaW5lZCcgPyAkZWwuYXR0cignZGF0YS1hY2NvcmRpb24tcHJlZml4LWNsYXNzZXMnKSA6IG9wdGlvbnMucHJlZml4Q2xhc3MsXG4gICAgICAgICAgICAgICAgYnV0dG9uc0dlbmVyYXRlZENvbnRlbnQ6IHR5cGVvZigkZWwuYXR0cignZGF0YS1hY2NvcmRpb24tYnV0dG9uLWdlbmVyYXRlZC1jb250ZW50JykpICE9PSAndW5kZWZpbmVkJyA/ICRlbC5hdHRyKCdkYXRhLWFjY29yZGlvbi1idXR0b24tZ2VuZXJhdGVkLWNvbnRlbnQnKSA6IG9wdGlvbnMuYnV0dG9uc0dlbmVyYXRlZENvbnRlbnQsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAkZWwuY2xvc2VzdCgnW2Rpcj1cInJ0bFwiXScpLmxlbmd0aCA+IDAgPyAncnRsJyA6IG9wdGlvbnMuZGlyZWN0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc3BlY2lmaWNPcHRpb25zID0gJC5leHRlbmQoe30sIG9wdGlvbnMsIHNwZWNpZmljT3B0aW9ucyk7XG5cbiAgICAgICAgICAgICRlbC5kYXRhW1BMVUdJTl0gPSBuZXcgQWNjb3JkaW9uKCRlbCwgc3BlY2lmaWNPcHRpb25zKTsgXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkLmZuW1BMVUdJTl0uZGVmYXVsdHMgPSBkZWZhdWx0Q29uZmlnO1xuXG59KSk7XG4iXX0=
