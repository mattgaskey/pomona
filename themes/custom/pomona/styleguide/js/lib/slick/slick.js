'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.9.0
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
;(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
})(function ($) {
    'use strict';

    var Slick = window.Slick || {};

    Slick = function () {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this,
                dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
                nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function customPaging(slider, i) {
                    return $('<button type="button" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                focusOnChange: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                scrolling: false,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                swiping: false,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

            _.registerBreakpoints();
            _.init(true);
        }

        return Slick;
    }();

    Slick.prototype.activateADA = function () {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });
    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {

        var _ = this;

        if (typeof index === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || index >= _.slideCount) {
            return false;
        }

        _.unload();

        if (typeof index === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();
    };

    Slick.prototype.animateHeight = function () {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function (targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }
        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -_.currentLeft;
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function step(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' + now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' + now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function complete() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });
            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function () {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }
            }
        }
    };

    Slick.prototype.getNavTarget = function () {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if (asNavFor && asNavFor !== null) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;
    };

    Slick.prototype.asNavFor = function (index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if (asNavFor !== null && (typeof asNavFor === 'undefined' ? 'undefined' : _typeof(asNavFor)) === 'object') {
            asNavFor.each(function () {
                var target = $(this).slick('getSlick');
                if (!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }
    };

    Slick.prototype.applyTransition = function (slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }
    };

    Slick.prototype.autoPlay = function () {

        var _ = this;

        _.autoPlayClear();

        if (_.slideCount > _.options.slidesToShow) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
        }
    };

    Slick.prototype.autoPlayClear = function () {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }
    };

    Slick.prototype.autoPlayIterator = function () {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if (!_.paused && !_.interrupted && !_.focussed) {

            if (_.options.infinite === false) {

                if (_.direction === 1 && _.currentSlide + 1 === _.slideCount - 1) {
                    _.direction = 0;
                } else if (_.direction === 0) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if (_.currentSlide - 1 === 0) {
                        _.direction = 1;
                    }
                }
            }

            _.slideHandler(slideTo);
        }
    };

    Slick.prototype.buildArrows = function () {

        var _ = this;

        if (_.options.arrows === true) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if (_.slideCount > _.options.slidesToShow) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                }
            } else {

                _.$prevArrow.add(_.$nextArrow).addClass('slick-hidden').attr({
                    'aria-disabled': 'true',
                    'tabindex': '-1'
                });
            }
        }
    };

    Slick.prototype.buildDots = function () {

        var _ = this,
            i,
            dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active');
        }
    };

    Slick.prototype.buildOut = function () {

        var _ = this;

        _.$slides = _.$slider.children(_.options.slide + ':not(.slick-cloned)').addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index).data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = _.slideCount === 0 ? $('<div class="slick-track"/>').appendTo(_.$slider) : _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap('<div class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }
    };

    Slick.prototype.buildRows = function () {

        var _ = this,
            a,
            b,
            c,
            newSlides,
            numOfSlides,
            originalSlides,
            slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if (_.options.rows > 0) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(originalSlides.length / slidesPerSection);

            for (a = 0; a < numOfSlides; a++) {
                var slide = document.createElement('div');
                for (b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for (c = 0; c < _.options.slidesPerRow; c++) {
                        var target = a * slidesPerSection + (b * _.options.slidesPerRow + c);
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children().css({
                'width': 100 / _.options.slidesPerRow + '%',
                'display': 'inline-block'
            });
        }
    };

    Slick.prototype.checkResponsive = function (initial, forceUpdate) {

        var _ = this,
            breakpoint,
            targetBreakpoint,
            respondToWidth,
            triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if (_.options.responsive && _.options.responsive.length && _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint = targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if (!initial && triggerBreakpoint !== false) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }
    };

    Slick.prototype.changeSlide = function (event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset,
            slideOffset,
            unevenOffset;

        // If target is a link, prevent default action.
        if ($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if (!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = _.slideCount % _.options.slidesToScroll !== 0;
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 : event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }
    };

    Slick.prototype.checkNavigable = function (index) {

        var _ = this,
            navigables,
            prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function () {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots).off('click.slick', _.changeSlide).off('mouseenter.slick', $.proxy(_.interrupt, _, true)).off('mouseleave.slick', $.proxy(_.interrupt, _, false));

            if (_.options.accessibility === true) {
                _.$dots.off('keydown.slick', _.keyHandler);
            }
        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);
                _.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);
            }
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
    };

    Slick.prototype.cleanUpSlideEvents = function () {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));
    };

    Slick.prototype.cleanUpRows = function () {

        var _ = this,
            originalSlides;

        if (_.options.rows > 0) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }
    };

    Slick.prototype.clickHandler = function (event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }
    };

    Slick.prototype.destroy = function (refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.$prevArrow.length) {

            _.$prevArrow.removeClass('slick-disabled slick-arrow slick-hidden').removeAttr('aria-hidden aria-disabled tabindex').css('display', '');

            if (_.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.remove();
            }
        }

        if (_.$nextArrow && _.$nextArrow.length) {

            _.$nextArrow.removeClass('slick-disabled slick-arrow slick-hidden').removeAttr('aria-hidden aria-disabled tabindex').css('display', '');

            if (_.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.remove();
            }
        }

        if (_.$slides) {

            _.$slides.removeClass('slick-slide slick-active slick-center slick-visible slick-current').removeAttr('aria-hidden').removeAttr('data-slick-index').each(function () {
                $(this).attr('style', $(this).data('originalStyling'));
            });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if (!refresh) {
            _.$slider.trigger('destroy', [_]);
        }
    };

    Slick.prototype.disableTransition = function (slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }
    };

    Slick.prototype.fadeSlide = function (slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);
        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function () {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }
        }
    };

    Slick.prototype.fadeSlideOut = function (slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);
        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });
        }
    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();
        }
    };

    Slick.prototype.focusHandler = function () {

        var _ = this;

        // If any child element receives focus within the slider we need to pause the autoplay
        _.$slider.off('focus.slick blur.slick').on('focus.slick', '*', function (event) {
            var $sf = $(this);

            setTimeout(function () {
                if (_.options.pauseOnFocus) {
                    if ($sf.is(':focus')) {
                        _.focussed = true;
                        _.autoPlay();
                    }
                }
            }, 0);
        }).on('blur.slick', '*', function (event) {
            var $sf = $(this);

            // When a blur occurs on any elements within the slider we become unfocused
            if (_.options.pauseOnFocus) {
                _.focussed = false;
                _.autoPlay();
            }
        });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {

        var _ = this;
        return _.currentSlide;
    };

    Slick.prototype.getDotCount = function () {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            if (_.slideCount <= _.options.slidesToShow) {
                ++pagerQty;
            } else {
                while (breakPoint < _.slideCount) {
                    ++pagerQty;
                    breakPoint = counter + _.options.slidesToScroll;
                    counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                }
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if (!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        } else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;
    };

    Slick.prototype.getLeft = function (slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide,
            coef;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
                coef = -1;

                if (_.options.vertical === true && _.options.centerMode === true) {
                    if (_.options.slidesToShow === 2) {
                        coef = -1.5;
                    } else if (_.options.slidesToShow === 1) {
                        coef = -2;
                    }
                }
                verticalOffset = verticalHeight * _.options.slidesToShow * coef;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth * -1;
                        verticalOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight * -1;
                    } else {
                        _.slideOffset = _.slideCount % _.options.slidesToScroll * _.slideWidth * -1;
                        verticalOffset = _.slideCount % _.options.slidesToScroll * verticalHeight * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth;
                verticalOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
            _.slideOffset = _.slideWidth * Math.floor(_.options.slidesToShow) / 2 - _.slideWidth * _.slideCount / 2;
        } else if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
        } else {
            targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft = 0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft = 0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;
    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {

        var _ = this;

        return _.options[option];
    };

    Slick.prototype.getNavigableIndexes = function () {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;
    };

    Slick.prototype.getSlick = function () {

        return this;
    };

    Slick.prototype.getSlideCount = function () {

        var _ = this,
            slidesTraversed,
            swipedSlide,
            swipeTarget,
            centerOffset;

        centerOffset = _.options.centerMode === true ? Math.floor(_.$list.width() / 2) : 0;
        swipeTarget = _.swipeLeft * -1 + centerOffset;

        if (_.options.swipeToSlide === true) {

            _.$slideTrack.find('.slick-slide').each(function (index, slide) {

                var slideOuterWidth, slideOffset, slideRightBoundary;
                slideOuterWidth = $(slide).outerWidth();
                slideOffset = slide.offsetLeft;
                if (_.options.centerMode !== true) {
                    slideOffset += slideOuterWidth / 2;
                }

                slideRightBoundary = slideOffset + slideOuterWidth;

                if (swipeTarget < slideRightBoundary) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;
        } else {
            return _.options.slidesToScroll;
        }
    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);
    };

    Slick.prototype.init = function (creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();
        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if (_.options.autoplay) {

            _.paused = false;
            _.autoPlay();
        }
    };

    Slick.prototype.initADA = function () {
        var _ = this,
            numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
            tabControlIndexes = _.getNavigableIndexes().filter(function (val) {
            return val >= 0 && val < _.slideCount;
        });

        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        if (_.$dots !== null) {
            _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {
                var slideControlIndex = tabControlIndexes.indexOf(i);

                $(this).attr({
                    'role': 'tabpanel',
                    'id': 'slick-slide' + _.instanceUid + i,
                    'tabindex': -1
                });

                if (slideControlIndex !== -1) {
                    var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex;
                    if ($('#' + ariaButtonControl).length) {
                        $(this).attr({
                            'aria-describedby': ariaButtonControl
                        });
                    }
                }
            });

            _.$dots.attr('role', 'tablist').find('li').each(function (i) {
                var mappedSlideIndex = tabControlIndexes[i];

                $(this).attr({
                    'role': 'presentation'
                });

                $(this).find('button').first().attr({
                    'role': 'tab',
                    'id': 'slick-slide-control' + _.instanceUid + i,
                    'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,
                    'aria-label': i + 1 + ' of ' + numDotGroups,
                    'aria-selected': null,
                    'tabindex': '-1'
                });
            }).eq(_.currentSlide).find('button').attr({
                'aria-selected': 'true',
                'tabindex': '0'
            }).end();
        }

        for (var i = _.currentSlide, max = i + _.options.slidesToShow; i < max; i++) {
            if (_.options.focusOnChange) {
                _.$slides.eq(i).attr({ 'tabindex': '0' });
            } else {
                _.$slides.eq(i).removeAttr('tabindex');
            }
        }

        _.activateADA();
    };

    Slick.prototype.initArrowEvents = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.off('click.slick').on('click.slick', {
                message: 'previous'
            }, _.changeSlide);
            _.$nextArrow.off('click.slick').on('click.slick', {
                message: 'next'
            }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow.on('keydown.slick', _.keyHandler);
                _.$nextArrow.on('keydown.slick', _.keyHandler);
            }
        }
    };

    Slick.prototype.initDotEvents = function () {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$dots.on('keydown.slick', _.keyHandler);
            }
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {

            $('li', _.$dots).on('mouseenter.slick', $.proxy(_.interrupt, _, true)).on('mouseleave.slick', $.proxy(_.interrupt, _, false));
        }
    };

    Slick.prototype.initSlideEvents = function () {

        var _ = this;

        if (_.options.pauseOnHover) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));
        }
    };

    Slick.prototype.initializeEvents = function () {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(_.setPosition);
    };

    Slick.prototype.initUI = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();
        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();
        }
    };

    Slick.prototype.keyHandler = function (event) {

        var _ = this;
        //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' : 'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }
    };

    Slick.prototype.lazyLoad = function () {

        var _ = this,
            loadRange,
            cloneRange,
            rangeStart,
            rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function () {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageSrcSet = $(this).attr('data-srcset'),
                    imageSizes = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function () {

                    image.animate({ opacity: 0 }, 100, function () {

                        if (imageSrcSet) {
                            image.attr('srcset', imageSrcSet);

                            if (imageSizes) {
                                image.attr('sizes', imageSizes);
                            }
                        }

                        image.attr('src', imageSource).animate({ opacity: 1 }, 200, function () {
                            image.removeAttr('data-lazy data-srcset data-sizes').removeClass('slick-loading');
                        });
                        _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                    });
                };

                imageToLoad.onerror = function () {

                    image.removeAttr('data-lazy').removeClass('slick-loading').addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);
                };

                imageToLoad.src = imageSource;
            });
        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

        if (_.options.lazyLoad === 'anticipated') {
            var prevSlide = rangeStart - 1,
                nextSlide = rangeEnd,
                $slides = _.$slider.find('.slick-slide');

            for (var i = 0; i < _.options.slidesToScroll; i++) {
                if (prevSlide < 0) prevSlide = _.slideCount - 1;
                loadRange = loadRange.add($slides.eq(prevSlide));
                loadRange = loadRange.add($slides.eq(nextSlide));
                prevSlide--;
                nextSlide++;
            }
        }

        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }
    };

    Slick.prototype.loadSlider = function () {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }
    };

    Slick.prototype.next = Slick.prototype.slickNext = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });
    };

    Slick.prototype.orientationChange = function () {

        var _ = this;

        _.checkResponsive();
        _.setPosition();
    };

    Slick.prototype.pause = Slick.prototype.slickPause = function () {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;
    };

    Slick.prototype.play = Slick.prototype.slickPlay = function () {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;
    };

    Slick.prototype.postSlide = function (index) {

        var _ = this;

        if (!_.unslicked) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            if (_.slideCount > _.options.slidesToShow) {
                _.setPosition();
            }

            _.swipeLeft = null;

            if (_.options.autoplay) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();

                if (_.options.focusOnChange) {
                    var $currentSlide = $(_.$slides.get(_.currentSlide));
                    $currentSlide.attr('tabindex', 0).focus();
                }
            }
        }
    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });
    };

    Slick.prototype.preventDefault = function (event) {

        event.preventDefault();
    };

    Slick.prototype.progressiveLazyLoad = function (tryCount) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $('img[data-lazy]', _.$slider),
            image,
            imageSource,
            imageSrcSet,
            imageSizes,
            imageToLoad;

        if ($imgsToLoad.length) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageSrcSet = image.attr('data-srcset');
            imageSizes = image.attr('data-sizes') || _.$slider.attr('data-sizes');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function () {

                if (imageSrcSet) {
                    image.attr('srcset', imageSrcSet);

                    if (imageSizes) {
                        image.attr('sizes', imageSizes);
                    }
                }

                image.attr('src', imageSource).removeAttr('data-lazy data-srcset data-sizes').removeClass('slick-loading');

                if (_.options.adaptiveHeight === true) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                _.progressiveLazyLoad();
            };

            imageToLoad.onerror = function () {

                if (tryCount < 3) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout(function () {
                        _.progressiveLazyLoad(tryCount + 1);
                    }, 500);
                } else {

                    image.removeAttr('data-lazy').removeClass('slick-loading').addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

                    _.progressiveLazyLoad();
                }
            };

            imageToLoad.src = imageSource;
        } else {

            _.$slider.trigger('allImagesLoaded', [_]);
        }
    };

    Slick.prototype.refresh = function (initializing) {

        var _ = this,
            currentSlide,
            lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if (!_.options.infinite && _.currentSlide > lastVisibleIndex) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if (!initializing) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);
        }
    };

    Slick.prototype.registerBreakpoints = function () {

        var _ = this,
            breakpoint,
            currentBreakpoint,
            l,
            responsiveSettings = _.options.responsive || null;

        if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {

            _.respondTo = _.options.respondTo || 'window';

            for (breakpoint in responsiveSettings) {

                l = _.breakpoints.length - 1;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {
                    currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while (l >= 0) {
                        if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
                            _.breakpoints.splice(l, 1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;
                }
            }

            _.breakpoints.sort(function (a, b) {
                return _.options.mobileFirst ? a - b : b - a;
            });
        }
    };

    Slick.prototype.reinit = function () {

        var _ = this;

        _.$slides = _.$slideTrack.children(_.options.slide).addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);
    };

    Slick.prototype.resize = function () {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function () {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if (!_.unslicked) {
                    _.setPosition();
                }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {

        var _ = this;

        if (typeof index === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();
    };

    Slick.prototype.setCSS = function (position) {

        var _ = this,
            positionProps = {},
            x,
            y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }
    };

    Slick.prototype.setDimensions = function () {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: '0px ' + _.options.centerPadding
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: _.options.centerPadding + ' 0px'
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();

        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children('.slick-slide').length));
        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);
    };

    Slick.prototype.setFade = function () {

        var _ = this,
            targetLeft;

        _.$slides.each(function (index, element) {
            targetLeft = _.slideWidth * index * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });
    };

    Slick.prototype.setHeight = function () {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }
    };

    Slick.prototype.setOption = Slick.prototype.slickSetOption = function () {

        /**
         * accepts arguments in format of:
         *
         *  - for changing a single option's value:
         *     .slick("setOption", option, value, refresh )
         *
         *  - for changing a set of responsive options:
         *     .slick("setOption", 'responsive', [{}, ...], refresh )
         *
         *  - for updating multiple values at once (not responsive)
         *     .slick("setOption", { 'option': value, ... }, refresh )
         */

        var _ = this,
            l,
            item,
            option,
            value,
            refresh = false,
            type;

        if ($.type(arguments[0]) === 'object') {

            option = arguments[0];
            refresh = arguments[1];
            type = 'multiple';
        } else if ($.type(arguments[0]) === 'string') {

            option = arguments[0];
            value = arguments[1];
            refresh = arguments[2];

            if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {

                type = 'responsive';
            } else if (typeof arguments[1] !== 'undefined') {

                type = 'single';
            }
        }

        if (type === 'single') {

            _.options[option] = value;
        } else if (type === 'multiple') {

            $.each(option, function (opt, val) {

                _.options[opt] = val;
            });
        } else if (type === 'responsive') {

            for (item in value) {

                if ($.type(_.options.responsive) !== 'array') {

                    _.options.responsive = [value[item]];
                } else {

                    l = _.options.responsive.length - 1;

                    // loop through the responsive object and splice out duplicates.
                    while (l >= 0) {

                        if (_.options.responsive[l].breakpoint === value[item].breakpoint) {

                            _.options.responsive.splice(l, 1);
                        }

                        l--;
                    }

                    _.options.responsive.push(value[item]);
                }
            }
        }

        if (refresh) {

            _.unload();
            _.reinit();
        }
    };

    Slick.prototype.setPosition = function () {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);
    };

    Slick.prototype.setProps = function () {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (_.options.fade) {
            if (typeof _.options.zIndex === 'number') {
                if (_.options.zIndex < 3) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && _.animType !== null && _.animType !== false;
    };

    Slick.prototype.setSlideClasses = function (index) {

        var _ = this,
            centerOffset,
            allSlides,
            indexOffset,
            remainder;

        allSlides = _.$slider.find('.slick-slide').removeClass('slick-active slick-center slick-current').attr('aria-hidden', 'true');

        _.$slides.eq(index).addClass('slick-current');

        if (_.options.centerMode === true) {

            var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {
                    _.$slides.slice(index - centerOffset + evenCoef, index + centerOffset + 1).addClass('slick-active').attr('aria-hidden', 'false');
                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides.slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2).addClass('slick-active').attr('aria-hidden', 'false');
                }

                if (index === 0) {

                    allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
                } else if (index === _.slideCount - 1) {

                    allSlides.eq(_.options.slidesToShow).addClass('slick-center');
                }
            }

            _.$slides.eq(index).addClass('slick-center');
        } else {

            if (index >= 0 && index <= _.slideCount - _.options.slidesToShow) {

                _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides.addClass('slick-active').attr('aria-hidden', 'false');
            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && _.slideCount - index < _.options.slidesToShow) {

                    allSlides.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder).addClass('slick-active').attr('aria-hidden', 'false');
                } else {

                    allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
                }
            }
        }

        if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
            _.lazyLoad();
        }
    };

    Slick.prototype.setupInfinite = function () {

        var _ = this,
            i,
            slideIndex,
            infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > _.slideCount - infiniteCount; i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '').attr('data-slick-index', slideIndex - _.slideCount).prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount + _.slideCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '').attr('data-slick-index', slideIndex + _.slideCount).appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
                    $(this).attr('id', '');
                });
            }
        }
    };

    Slick.prototype.interrupt = function (toggle) {

        var _ = this;

        if (!toggle) {
            _.autoPlay();
        }
        _.interrupted = toggle;
    };

    Slick.prototype.selectHandler = function (event) {

        var _ = this;

        var targetElement = $(event.target).is('.slick-slide') ? $(event.target) : $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.slideHandler(index, false, true);
            return;
        }

        _.slideHandler(index);
    };

    Slick.prototype.slideHandler = function (index, sync, dontAnimate) {

        var targetSlide,
            animSlide,
            oldSlide,
            slideLeft,
            targetLeft = null,
            _ = this,
            navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > _.slideCount - _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if (_.options.autoplay) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - _.slideCount % _.options.slidesToScroll;
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if (_.options.asNavFor) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if (navTarget.slideCount <= navTarget.options.slidesToShow) {
                navTarget.setSlideClasses(_.currentSlide);
            }
        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function () {
                    _.postSlide(animSlide);
                });
            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
            _.animateSlide(targetLeft, function () {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }
    };

    Slick.prototype.startLoad = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();
        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();
        }

        _.$slider.addClass('slick-loading');
    };

    Slick.prototype.swipeDirection = function () {

        var xDist,
            yDist,
            r,
            swipeAngle,
            _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if (swipeAngle <= 45 && swipeAngle >= 0) {
            return _.options.rtl === false ? 'left' : 'right';
        }
        if (swipeAngle <= 360 && swipeAngle >= 315) {
            return _.options.rtl === false ? 'left' : 'right';
        }
        if (swipeAngle >= 135 && swipeAngle <= 225) {
            return _.options.rtl === false ? 'right' : 'left';
        }
        if (_.options.verticalSwiping === true) {
            if (swipeAngle >= 35 && swipeAngle <= 135) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';
    };

    Slick.prototype.swipeEnd = function (event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.swiping = false;

        if (_.scrolling) {
            _.scrolling = false;
            return false;
        }

        _.interrupted = false;
        _.shouldClick = _.touchObject.swipeLength > 10 ? false : true;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.edgeHit === true) {
            _.$slider.trigger('edge', [_, _.swipeDirection()]);
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

            direction = _.swipeDirection();

            switch (direction) {

                case 'left':
                case 'down':

                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:

            }

            if (direction != 'vertical') {

                _.slideHandler(slideCount);
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction]);
            }
        } else {

            if (_.touchObject.startX !== _.touchObject.curX) {

                _.slideHandler(_.currentSlide);
                _.touchObject = {};
            }
        }
    };

    Slick.prototype.swipeHandler = function (event) {

        var _ = this;

        if (_.options.swipe === false || 'ontouchend' in document && _.options.swipe === false) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ? event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options.touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options.touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }
    };

    Slick.prototype.swipeMove = function (event) {

        var _ = this,
            edgeWasHit = false,
            curLeft,
            swipeDirection,
            swipeLength,
            positionOffset,
            touches,
            verticalSwipeLength;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        verticalSwipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

        if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
            _.scrolling = true;
            return false;
        }

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = verticalSwipeLength;
        }

        swipeDirection = _.swipeDirection();

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            _.swiping = true;
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }

        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if (_.currentSlide === 0 && swipeDirection === 'right' || _.currentSlide >= _.getDotCount() && swipeDirection === 'left') {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);
    };

    Slick.prototype.swipeStart = function (event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;
    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();
        }
    };

    Slick.prototype.unload = function () {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides.removeClass('slick-slide slick-active slick-visible slick-current').attr('aria-hidden', 'true').css('width', '');
    };

    Slick.prototype.unslick = function (fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();
    };

    Slick.prototype.updateArrows = function () {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow && !_.options.infinite) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            }
        }
    };

    Slick.prototype.updateDots = function () {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots.find('li').removeClass('slick-active').end();

            _.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active');
        }
    };

    Slick.prototype.visibility = function () {

        var _ = this;

        if (_.options.autoplay) {

            if (document[_.hidden]) {

                _.interrupted = true;
            } else {

                _.interrupted = false;
            }
        }
    };

    $.fn.slick = function () {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) == 'object' || typeof opt == 'undefined') _[i].slick = new Slick(_[i], opt);else ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9zbGljay9zbGljay5qcyJdLCJuYW1lcyI6WyJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwiZXhwb3J0cyIsIm1vZHVsZSIsInJlcXVpcmUiLCJqUXVlcnkiLCIkIiwiU2xpY2siLCJ3aW5kb3ciLCJpbnN0YW5jZVVpZCIsImVsZW1lbnQiLCJzZXR0aW5ncyIsIl8iLCJkYXRhU2V0dGluZ3MiLCJkZWZhdWx0cyIsImFjY2Vzc2liaWxpdHkiLCJhZGFwdGl2ZUhlaWdodCIsImFwcGVuZEFycm93cyIsImFwcGVuZERvdHMiLCJhcnJvd3MiLCJhc05hdkZvciIsInByZXZBcnJvdyIsIm5leHRBcnJvdyIsImF1dG9wbGF5IiwiYXV0b3BsYXlTcGVlZCIsImNlbnRlck1vZGUiLCJjZW50ZXJQYWRkaW5nIiwiY3NzRWFzZSIsImN1c3RvbVBhZ2luZyIsInNsaWRlciIsImkiLCJ0ZXh0IiwiZG90cyIsImRvdHNDbGFzcyIsImRyYWdnYWJsZSIsImVhc2luZyIsImVkZ2VGcmljdGlvbiIsImZhZGUiLCJmb2N1c09uU2VsZWN0IiwiZm9jdXNPbkNoYW5nZSIsImluZmluaXRlIiwiaW5pdGlhbFNsaWRlIiwibGF6eUxvYWQiLCJtb2JpbGVGaXJzdCIsInBhdXNlT25Ib3ZlciIsInBhdXNlT25Gb2N1cyIsInBhdXNlT25Eb3RzSG92ZXIiLCJyZXNwb25kVG8iLCJyZXNwb25zaXZlIiwicm93cyIsInJ0bCIsInNsaWRlIiwic2xpZGVzUGVyUm93Iiwic2xpZGVzVG9TaG93Iiwic2xpZGVzVG9TY3JvbGwiLCJzcGVlZCIsInN3aXBlIiwic3dpcGVUb1NsaWRlIiwidG91Y2hNb3ZlIiwidG91Y2hUaHJlc2hvbGQiLCJ1c2VDU1MiLCJ1c2VUcmFuc2Zvcm0iLCJ2YXJpYWJsZVdpZHRoIiwidmVydGljYWwiLCJ2ZXJ0aWNhbFN3aXBpbmciLCJ3YWl0Rm9yQW5pbWF0ZSIsInpJbmRleCIsImluaXRpYWxzIiwiYW5pbWF0aW5nIiwiZHJhZ2dpbmciLCJhdXRvUGxheVRpbWVyIiwiY3VycmVudERpcmVjdGlvbiIsImN1cnJlbnRMZWZ0IiwiY3VycmVudFNsaWRlIiwiZGlyZWN0aW9uIiwiJGRvdHMiLCJsaXN0V2lkdGgiLCJsaXN0SGVpZ2h0IiwibG9hZEluZGV4IiwiJG5leHRBcnJvdyIsIiRwcmV2QXJyb3ciLCJzY3JvbGxpbmciLCJzbGlkZUNvdW50Iiwic2xpZGVXaWR0aCIsIiRzbGlkZVRyYWNrIiwiJHNsaWRlcyIsInNsaWRpbmciLCJzbGlkZU9mZnNldCIsInN3aXBlTGVmdCIsInN3aXBpbmciLCIkbGlzdCIsInRvdWNoT2JqZWN0IiwidHJhbnNmb3Jtc0VuYWJsZWQiLCJ1bnNsaWNrZWQiLCJleHRlbmQiLCJhY3RpdmVCcmVha3BvaW50IiwiYW5pbVR5cGUiLCJhbmltUHJvcCIsImJyZWFrcG9pbnRzIiwiYnJlYWtwb2ludFNldHRpbmdzIiwiY3NzVHJhbnNpdGlvbnMiLCJmb2N1c3NlZCIsImludGVycnVwdGVkIiwiaGlkZGVuIiwicGF1c2VkIiwicG9zaXRpb25Qcm9wIiwicm93Q291bnQiLCJzaG91bGRDbGljayIsIiRzbGlkZXIiLCIkc2xpZGVzQ2FjaGUiLCJ0cmFuc2Zvcm1UeXBlIiwidHJhbnNpdGlvblR5cGUiLCJ2aXNpYmlsaXR5Q2hhbmdlIiwid2luZG93V2lkdGgiLCJ3aW5kb3dUaW1lciIsImRhdGEiLCJvcHRpb25zIiwib3JpZ2luYWxTZXR0aW5ncyIsImRvY3VtZW50IiwibW96SGlkZGVuIiwid2Via2l0SGlkZGVuIiwiYXV0b1BsYXkiLCJwcm94eSIsImF1dG9QbGF5Q2xlYXIiLCJhdXRvUGxheUl0ZXJhdG9yIiwiY2hhbmdlU2xpZGUiLCJjbGlja0hhbmRsZXIiLCJzZWxlY3RIYW5kbGVyIiwic2V0UG9zaXRpb24iLCJzd2lwZUhhbmRsZXIiLCJkcmFnSGFuZGxlciIsImtleUhhbmRsZXIiLCJodG1sRXhwciIsInJlZ2lzdGVyQnJlYWtwb2ludHMiLCJpbml0IiwicHJvdG90eXBlIiwiYWN0aXZhdGVBREEiLCJmaW5kIiwiYXR0ciIsImFkZFNsaWRlIiwic2xpY2tBZGQiLCJtYXJrdXAiLCJpbmRleCIsImFkZEJlZm9yZSIsInVubG9hZCIsImxlbmd0aCIsImFwcGVuZFRvIiwiaW5zZXJ0QmVmb3JlIiwiZXEiLCJpbnNlcnRBZnRlciIsInByZXBlbmRUbyIsImNoaWxkcmVuIiwiZGV0YWNoIiwiYXBwZW5kIiwiZWFjaCIsInJlaW5pdCIsImFuaW1hdGVIZWlnaHQiLCJ0YXJnZXRIZWlnaHQiLCJvdXRlckhlaWdodCIsImFuaW1hdGUiLCJoZWlnaHQiLCJhbmltYXRlU2xpZGUiLCJ0YXJnZXRMZWZ0IiwiY2FsbGJhY2siLCJhbmltUHJvcHMiLCJsZWZ0IiwidG9wIiwiYW5pbVN0YXJ0IiwiZHVyYXRpb24iLCJzdGVwIiwibm93IiwiTWF0aCIsImNlaWwiLCJjc3MiLCJjb21wbGV0ZSIsImNhbGwiLCJhcHBseVRyYW5zaXRpb24iLCJzZXRUaW1lb3V0IiwiZGlzYWJsZVRyYW5zaXRpb24iLCJnZXROYXZUYXJnZXQiLCJub3QiLCJ0YXJnZXQiLCJzbGljayIsInNsaWRlSGFuZGxlciIsInRyYW5zaXRpb24iLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJzbGlkZVRvIiwiYnVpbGRBcnJvd3MiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwicmVtb3ZlQXR0ciIsInRlc3QiLCJhZGQiLCJidWlsZERvdHMiLCJkb3QiLCJnZXREb3RDb3VudCIsImZpcnN0IiwiYnVpbGRPdXQiLCJ3cmFwQWxsIiwicGFyZW50Iiwid3JhcCIsInNldHVwSW5maW5pdGUiLCJ1cGRhdGVEb3RzIiwic2V0U2xpZGVDbGFzc2VzIiwiYnVpbGRSb3dzIiwiYSIsImIiLCJjIiwibmV3U2xpZGVzIiwibnVtT2ZTbGlkZXMiLCJvcmlnaW5hbFNsaWRlcyIsInNsaWRlc1BlclNlY3Rpb24iLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY3JlYXRlRWxlbWVudCIsInJvdyIsImdldCIsImFwcGVuZENoaWxkIiwiZW1wdHkiLCJjaGVja1Jlc3BvbnNpdmUiLCJpbml0aWFsIiwiZm9yY2VVcGRhdGUiLCJicmVha3BvaW50IiwidGFyZ2V0QnJlYWtwb2ludCIsInJlc3BvbmRUb1dpZHRoIiwidHJpZ2dlckJyZWFrcG9pbnQiLCJzbGlkZXJXaWR0aCIsIndpZHRoIiwiaW5uZXJXaWR0aCIsIm1pbiIsImhhc093blByb3BlcnR5IiwidW5zbGljayIsInJlZnJlc2giLCJ0cmlnZ2VyIiwiZXZlbnQiLCJkb250QW5pbWF0ZSIsIiR0YXJnZXQiLCJjdXJyZW50VGFyZ2V0IiwiaW5kZXhPZmZzZXQiLCJ1bmV2ZW5PZmZzZXQiLCJpcyIsInByZXZlbnREZWZhdWx0IiwiY2xvc2VzdCIsIm1lc3NhZ2UiLCJjaGVja05hdmlnYWJsZSIsIm5hdmlnYWJsZXMiLCJwcmV2TmF2aWdhYmxlIiwiZ2V0TmF2aWdhYmxlSW5kZXhlcyIsIm4iLCJjbGVhblVwRXZlbnRzIiwib2ZmIiwiaW50ZXJydXB0IiwidmlzaWJpbGl0eSIsImNsZWFuVXBTbGlkZUV2ZW50cyIsIm9yaWVudGF0aW9uQ2hhbmdlIiwicmVzaXplIiwiY2xlYW5VcFJvd3MiLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJzdG9wUHJvcGFnYXRpb24iLCJkZXN0cm95IiwicmVtb3ZlIiwiZmFkZVNsaWRlIiwic2xpZGVJbmRleCIsIm9wYWNpdHkiLCJmYWRlU2xpZGVPdXQiLCJmaWx0ZXJTbGlkZXMiLCJzbGlja0ZpbHRlciIsImZpbHRlciIsImZvY3VzSGFuZGxlciIsIm9uIiwiJHNmIiwiZ2V0Q3VycmVudCIsInNsaWNrQ3VycmVudFNsaWRlIiwiYnJlYWtQb2ludCIsImNvdW50ZXIiLCJwYWdlclF0eSIsImdldExlZnQiLCJ2ZXJ0aWNhbEhlaWdodCIsInZlcnRpY2FsT2Zmc2V0IiwidGFyZ2V0U2xpZGUiLCJjb2VmIiwiZmxvb3IiLCJvZmZzZXRMZWZ0Iiwib3V0ZXJXaWR0aCIsImdldE9wdGlvbiIsInNsaWNrR2V0T3B0aW9uIiwib3B0aW9uIiwiaW5kZXhlcyIsIm1heCIsInB1c2giLCJnZXRTbGljayIsImdldFNsaWRlQ291bnQiLCJzbGlkZXNUcmF2ZXJzZWQiLCJzd2lwZWRTbGlkZSIsInN3aXBlVGFyZ2V0IiwiY2VudGVyT2Zmc2V0Iiwic2xpZGVPdXRlcldpZHRoIiwic2xpZGVSaWdodEJvdW5kYXJ5IiwiYWJzIiwiZ29UbyIsInNsaWNrR29UbyIsInBhcnNlSW50IiwiY3JlYXRpb24iLCJoYXNDbGFzcyIsInNldFByb3BzIiwic3RhcnRMb2FkIiwibG9hZFNsaWRlciIsImluaXRpYWxpemVFdmVudHMiLCJ1cGRhdGVBcnJvd3MiLCJpbml0QURBIiwibnVtRG90R3JvdXBzIiwidGFiQ29udHJvbEluZGV4ZXMiLCJ2YWwiLCJzbGlkZUNvbnRyb2xJbmRleCIsImluZGV4T2YiLCJhcmlhQnV0dG9uQ29udHJvbCIsIm1hcHBlZFNsaWRlSW5kZXgiLCJlbmQiLCJpbml0QXJyb3dFdmVudHMiLCJpbml0RG90RXZlbnRzIiwiaW5pdFNsaWRlRXZlbnRzIiwiYWN0aW9uIiwiaW5pdFVJIiwic2hvdyIsInRhZ05hbWUiLCJtYXRjaCIsImtleUNvZGUiLCJsb2FkUmFuZ2UiLCJjbG9uZVJhbmdlIiwicmFuZ2VTdGFydCIsInJhbmdlRW5kIiwibG9hZEltYWdlcyIsImltYWdlc1Njb3BlIiwiaW1hZ2UiLCJpbWFnZVNvdXJjZSIsImltYWdlU3JjU2V0IiwiaW1hZ2VTaXplcyIsImltYWdlVG9Mb2FkIiwib25sb2FkIiwib25lcnJvciIsInNyYyIsInNsaWNlIiwicHJldlNsaWRlIiwibmV4dFNsaWRlIiwicHJvZ3Jlc3NpdmVMYXp5TG9hZCIsIm5leHQiLCJzbGlja05leHQiLCJwYXVzZSIsInNsaWNrUGF1c2UiLCJwbGF5Iiwic2xpY2tQbGF5IiwicG9zdFNsaWRlIiwiJGN1cnJlbnRTbGlkZSIsImZvY3VzIiwicHJldiIsInNsaWNrUHJldiIsInRyeUNvdW50IiwiJGltZ3NUb0xvYWQiLCJpbml0aWFsaXppbmciLCJsYXN0VmlzaWJsZUluZGV4IiwiY3VycmVudEJyZWFrcG9pbnQiLCJsIiwicmVzcG9uc2l2ZVNldHRpbmdzIiwidHlwZSIsInNwbGljZSIsInNvcnQiLCJjbGVhclRpbWVvdXQiLCJ3aW5kb3dEZWxheSIsInJlbW92ZVNsaWRlIiwic2xpY2tSZW1vdmUiLCJyZW1vdmVCZWZvcmUiLCJyZW1vdmVBbGwiLCJzZXRDU1MiLCJwb3NpdGlvbiIsInBvc2l0aW9uUHJvcHMiLCJ4IiwieSIsInNldERpbWVuc2lvbnMiLCJwYWRkaW5nIiwib2Zmc2V0Iiwic2V0RmFkZSIsInJpZ2h0Iiwic2V0SGVpZ2h0Iiwic2V0T3B0aW9uIiwic2xpY2tTZXRPcHRpb24iLCJpdGVtIiwidmFsdWUiLCJhcmd1bWVudHMiLCJvcHQiLCJib2R5U3R5bGUiLCJib2R5Iiwic3R5bGUiLCJXZWJraXRUcmFuc2l0aW9uIiwidW5kZWZpbmVkIiwiTW96VHJhbnNpdGlvbiIsIm1zVHJhbnNpdGlvbiIsIk9UcmFuc2Zvcm0iLCJwZXJzcGVjdGl2ZVByb3BlcnR5Iiwid2Via2l0UGVyc3BlY3RpdmUiLCJNb3pUcmFuc2Zvcm0iLCJNb3pQZXJzcGVjdGl2ZSIsIndlYmtpdFRyYW5zZm9ybSIsIm1zVHJhbnNmb3JtIiwidHJhbnNmb3JtIiwiYWxsU2xpZGVzIiwicmVtYWluZGVyIiwiZXZlbkNvZWYiLCJpbmZpbml0ZUNvdW50IiwiY2xvbmUiLCJ0b2dnbGUiLCJ0YXJnZXRFbGVtZW50IiwicGFyZW50cyIsInN5bmMiLCJhbmltU2xpZGUiLCJvbGRTbGlkZSIsInNsaWRlTGVmdCIsIm5hdlRhcmdldCIsImhpZGUiLCJzd2lwZURpcmVjdGlvbiIsInhEaXN0IiwieURpc3QiLCJyIiwic3dpcGVBbmdsZSIsInN0YXJ0WCIsImN1clgiLCJzdGFydFkiLCJjdXJZIiwiYXRhbjIiLCJyb3VuZCIsIlBJIiwic3dpcGVFbmQiLCJzd2lwZUxlbmd0aCIsImVkZ2VIaXQiLCJtaW5Td2lwZSIsImZpbmdlckNvdW50Iiwib3JpZ2luYWxFdmVudCIsInRvdWNoZXMiLCJzd2lwZVN0YXJ0Iiwic3dpcGVNb3ZlIiwiZWRnZVdhc0hpdCIsImN1ckxlZnQiLCJwb3NpdGlvbk9mZnNldCIsInZlcnRpY2FsU3dpcGVMZW5ndGgiLCJwYWdlWCIsImNsaWVudFgiLCJwYWdlWSIsImNsaWVudFkiLCJzcXJ0IiwicG93IiwidW5maWx0ZXJTbGlkZXMiLCJzbGlja1VuZmlsdGVyIiwiZnJvbUJyZWFrcG9pbnQiLCJmbiIsImFyZ3MiLCJBcnJheSIsInJldCIsImFwcGx5Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkE7QUFDQSxDQUFFLFdBQVNBLE9BQVQsRUFBa0I7QUFDaEI7O0FBQ0EsUUFBSSxPQUFPQyxNQUFQLEtBQWtCLFVBQWxCLElBQWdDQSxPQUFPQyxHQUEzQyxFQUFnRDtBQUM1Q0QsZUFBTyxDQUFDLFFBQUQsQ0FBUCxFQUFtQkQsT0FBbkI7QUFDSCxLQUZELE1BRU8sSUFBSSxPQUFPRyxPQUFQLEtBQW1CLFdBQXZCLEVBQW9DO0FBQ3ZDQyxlQUFPRCxPQUFQLEdBQWlCSCxRQUFRSyxRQUFRLFFBQVIsQ0FBUixDQUFqQjtBQUNILEtBRk0sTUFFQTtBQUNITCxnQkFBUU0sTUFBUjtBQUNIO0FBRUosQ0FWQyxFQVVBLFVBQVNDLENBQVQsRUFBWTtBQUNWOztBQUNBLFFBQUlDLFFBQVFDLE9BQU9ELEtBQVAsSUFBZ0IsRUFBNUI7O0FBRUFBLFlBQVMsWUFBVzs7QUFFaEIsWUFBSUUsY0FBYyxDQUFsQjs7QUFFQSxpQkFBU0YsS0FBVCxDQUFlRyxPQUFmLEVBQXdCQyxRQUF4QixFQUFrQzs7QUFFOUIsZ0JBQUlDLElBQUksSUFBUjtBQUFBLGdCQUFjQyxZQUFkOztBQUVBRCxjQUFFRSxRQUFGLEdBQWE7QUFDVEMsK0JBQWUsSUFETjtBQUVUQyxnQ0FBZ0IsS0FGUDtBQUdUQyw4QkFBY1gsRUFBRUksT0FBRixDQUhMO0FBSVRRLDRCQUFZWixFQUFFSSxPQUFGLENBSkg7QUFLVFMsd0JBQVEsSUFMQztBQU1UQywwQkFBVSxJQU5EO0FBT1RDLDJCQUFXLGtGQVBGO0FBUVRDLDJCQUFXLDBFQVJGO0FBU1RDLDBCQUFVLEtBVEQ7QUFVVEMsK0JBQWUs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LENBQXRDLENBRlg7QUFBQSxZQUdJMUIsSUFBSTdWLEVBQUVxSSxNQUhWO0FBQUEsWUFJSW5ILENBSko7QUFBQSxZQUtJeWEsR0FMSjtBQU1BLGFBQUt6YSxJQUFJLENBQVQsRUFBWUEsSUFBSTJVLENBQWhCLEVBQW1CM1UsR0FBbkIsRUFBd0I7QUFDcEIsZ0JBQUksUUFBT3NXLEdBQVAseUNBQU9BLEdBQVAsTUFBYyxRQUFkLElBQTBCLE9BQU9BLEdBQVAsSUFBYyxXQUE1QyxFQUNJeFgsRUFBRWtCLENBQUYsRUFBS3dKLEtBQUwsR0FBYSxJQUFJL0ssS0FBSixDQUFVSyxFQUFFa0IsQ0FBRixDQUFWLEVBQWdCc1csR0FBaEIsQ0FBYixDQURKLEtBR0ltRSxNQUFNM2IsRUFBRWtCLENBQUYsRUFBS3dKLEtBQUwsQ0FBVzhNLEdBQVgsRUFBZ0JvRSxLQUFoQixDQUFzQjViLEVBQUVrQixDQUFGLEVBQUt3SixLQUEzQixFQUFrQytRLElBQWxDLENBQU47QUFDSixnQkFBSSxPQUFPRSxHQUFQLElBQWMsV0FBbEIsRUFBK0IsT0FBT0EsR0FBUDtBQUNsQztBQUNELGVBQU8zYixDQUFQO0FBQ0gsS0FmRDtBQWlCSCxDQTM4RkMsQ0FBRCIsImZpbGUiOiJsaWIvc2xpY2svc2xpY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICAgICBfIF8gICAgICBfICAgICAgIF9cbiBfX198IChfKSBfX198IHwgX18gIChfKV9fX1xuLyBfX3wgfCB8LyBfX3wgfC8gLyAgfCAvIF9ffFxuXFxfXyBcXCB8IHwgKF9ffCAgIDwgXyB8IFxcX18gXFxcbnxfX18vX3xffFxcX19ffF98XFxfKF8pLyB8X19fL1xuICAgICAgICAgICAgICAgICAgIHxfXy9cblxuIFZlcnNpb246IDEuOS4wXG4gIEF1dGhvcjogS2VuIFdoZWVsZXJcbiBXZWJzaXRlOiBodHRwOi8va2Vud2hlZWxlci5naXRodWIuaW9cbiAgICBEb2NzOiBodHRwOi8va2Vud2hlZWxlci5naXRodWIuaW8vc2xpY2tcbiAgICBSZXBvOiBodHRwOi8vZ2l0aHViLmNvbS9rZW53aGVlbGVyL3NsaWNrXG4gIElzc3VlczogaHR0cDovL2dpdGh1Yi5jb20va2Vud2hlZWxlci9zbGljay9pc3N1ZXNcblxuICovXG4vKiBnbG9iYWwgd2luZG93LCBkb2N1bWVudCwgZGVmaW5lLCBqUXVlcnksIHNldEludGVydmFsLCBjbGVhckludGVydmFsICovXG47KGZ1bmN0aW9uKGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XG4gICAgfVxuXG59KGZ1bmN0aW9uKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgdmFyIFNsaWNrID0gd2luZG93LlNsaWNrIHx8IHt9O1xuXG4gICAgU2xpY2sgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGluc3RhbmNlVWlkID0gMDtcblxuICAgICAgICBmdW5jdGlvbiBTbGljayhlbGVtZW50LCBzZXR0aW5ncykge1xuXG4gICAgICAgICAgICB2YXIgXyA9IHRoaXMsIGRhdGFTZXR0aW5ncztcblxuICAgICAgICAgICAgXy5kZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICBhY2Nlc3NpYmlsaXR5OiB0cnVlLFxuICAgICAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhcHBlbmRBcnJvd3M6ICQoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgYXBwZW5kRG90czogJChlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBhcnJvd3M6IHRydWUsXG4gICAgICAgICAgICAgICAgYXNOYXZGb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgcHJldkFycm93OiAnPGJ1dHRvbiBjbGFzcz1cInNsaWNrLXByZXZcIiBhcmlhLWxhYmVsPVwiUHJldmlvdXNcIiB0eXBlPVwiYnV0dG9uXCI+UHJldmlvdXM8L2J1dHRvbj4nLFxuICAgICAgICAgICAgICAgIG5leHRBcnJvdzogJzxidXR0b24gY2xhc3M9XCJzbGljay1uZXh0XCIgYXJpYS1sYWJlbD1cIk5leHRcIiB0eXBlPVwiYnV0dG9uXCI+TmV4dDwvYnV0dG9uPicsXG4gICAgICAgICAgICAgICAgYXV0b3BsYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5U3BlZWQ6IDMwMDAsXG4gICAgICAgICAgICAgICAgY2VudGVyTW9kZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzUwcHgnLFxuICAgICAgICAgICAgICAgIGNzc0Vhc2U6ICdlYXNlJyxcbiAgICAgICAgICAgICAgICBjdXN0b21QYWdpbmc6IGZ1bmN0aW9uKHNsaWRlciwgaSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgLz4nKS50ZXh0KGkgKyAxKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRvdHNDbGFzczogJ3NsaWNrLWRvdHMnLFxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlYXNpbmc6ICdsaW5lYXInLFxuICAgICAgICAgICAgICAgIGVkZ2VGcmljdGlvbjogMC4zNSxcbiAgICAgICAgICAgICAgICBmYWRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBmb2N1c09uU2VsZWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBmb2N1c09uQ2hhbmdlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbml0aWFsU2xpZGU6IDAsXG4gICAgICAgICAgICAgICAgbGF6eUxvYWQ6ICdvbmRlbWFuZCcsXG4gICAgICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBhdXNlT25Ib3ZlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXVzZU9uRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgcGF1c2VPbkRvdHNIb3ZlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVzcG9uZFRvOiAnd2luZG93JyxcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiBudWxsLFxuICAgICAgICAgICAgICAgIHJvd3M6IDEsXG4gICAgICAgICAgICAgICAgcnRsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzbGlkZTogJycsXG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyUm93OiAxLFxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICAgICAgICAgICAgICBzcGVlZDogNTAwLFxuICAgICAgICAgICAgICAgIHN3aXBlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHN3aXBlVG9TbGlkZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdG91Y2hNb3ZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRvdWNoVGhyZXNob2xkOiA1LFxuICAgICAgICAgICAgICAgIHVzZUNTUzogdHJ1ZSxcbiAgICAgICAgICAgICAgICB1c2VUcmFuc2Zvcm06IHRydWUsXG4gICAgICAgICAgICAgICAgdmFyaWFibGVXaWR0aDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmVydGljYWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcnRpY2FsU3dpcGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgd2FpdEZvckFuaW1hdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgekluZGV4OiAxMDAwXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBfLmluaXRpYWxzID0ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF1dG9QbGF5VGltZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgY3VycmVudERpcmVjdGlvbjogMCxcbiAgICAgICAgICAgICAgICBjdXJyZW50TGVmdDogbnVsbCxcbiAgICAgICAgICAgICAgICBjdXJyZW50U2xpZGU6IDAsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAxLFxuICAgICAgICAgICAgICAgICRkb3RzOiBudWxsLFxuICAgICAgICAgICAgICAgIGxpc3RXaWR0aDogbnVsbCxcbiAgICAgICAgICAgICAgICBsaXN0SGVpZ2h0OiBudWxsLFxuICAgICAgICAgICAgICAgIGxvYWRJbmRleDogMCxcbiAgICAgICAgICAgICAgICAkbmV4dEFycm93OiBudWxsLFxuICAgICAgICAgICAgICAgICRwcmV2QXJyb3c6IG51bGwsXG4gICAgICAgICAgICAgICAgc2Nyb2xsaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzbGlkZUNvdW50OiBudWxsLFxuICAgICAgICAgICAgICAgIHNsaWRlV2lkdGg6IG51bGwsXG4gICAgICAgICAgICAgICAgJHNsaWRlVHJhY2s6IG51bGwsXG4gICAgICAgICAgICAgICAgJHNsaWRlczogbnVsbCxcbiAgICAgICAgICAgICAgICBzbGlkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzbGlkZU9mZnNldDogMCxcbiAgICAgICAgICAgICAgICBzd2lwZUxlZnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgc3dpcGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgJGxpc3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgdG91Y2hPYmplY3Q6IHt9LFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybXNFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB1bnNsaWNrZWQ6IGZhbHNlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkLmV4dGVuZChfLCBfLmluaXRpYWxzKTtcblxuICAgICAgICAgICAgXy5hY3RpdmVCcmVha3BvaW50ID0gbnVsbDtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSBudWxsO1xuICAgICAgICAgICAgXy5hbmltUHJvcCA9IG51bGw7XG4gICAgICAgICAgICBfLmJyZWFrcG9pbnRzID0gW107XG4gICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5ncyA9IFtdO1xuICAgICAgICAgICAgXy5jc3NUcmFuc2l0aW9ucyA9IGZhbHNlO1xuICAgICAgICAgICAgXy5mb2N1c3NlZCA9IGZhbHNlO1xuICAgICAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgXy5oaWRkZW4gPSAnaGlkZGVuJztcbiAgICAgICAgICAgIF8ucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIF8ucG9zaXRpb25Qcm9wID0gbnVsbDtcbiAgICAgICAgICAgIF8ucmVzcG9uZFRvID0gbnVsbDtcbiAgICAgICAgICAgIF8ucm93Q291bnQgPSAxO1xuICAgICAgICAgICAgXy5zaG91bGRDbGljayA9IHRydWU7XG4gICAgICAgICAgICBfLiRzbGlkZXIgPSAkKGVsZW1lbnQpO1xuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBudWxsO1xuICAgICAgICAgICAgXy50cmFuc2Zvcm1UeXBlID0gbnVsbDtcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSBudWxsO1xuICAgICAgICAgICAgXy52aXNpYmlsaXR5Q2hhbmdlID0gJ3Zpc2liaWxpdHljaGFuZ2UnO1xuICAgICAgICAgICAgXy53aW5kb3dXaWR0aCA9IDA7XG4gICAgICAgICAgICBfLndpbmRvd1RpbWVyID0gbnVsbDtcblxuICAgICAgICAgICAgZGF0YVNldHRpbmdzID0gJChlbGVtZW50KS5kYXRhKCdzbGljaycpIHx8IHt9O1xuXG4gICAgICAgICAgICBfLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgXy5kZWZhdWx0cywgc2V0dGluZ3MsIGRhdGFTZXR0aW5ncyk7XG5cbiAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcblxuICAgICAgICAgICAgXy5vcmlnaW5hbFNldHRpbmdzID0gXy5vcHRpb25zO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50Lm1vekhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBfLmhpZGRlbiA9ICdtb3pIaWRkZW4nO1xuICAgICAgICAgICAgICAgIF8udmlzaWJpbGl0eUNoYW5nZSA9ICdtb3p2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LndlYmtpdEhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBfLmhpZGRlbiA9ICd3ZWJraXRIaWRkZW4nO1xuICAgICAgICAgICAgICAgIF8udmlzaWJpbGl0eUNoYW5nZSA9ICd3ZWJraXR2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy5hdXRvUGxheSA9ICQucHJveHkoXy5hdXRvUGxheSwgXyk7XG4gICAgICAgICAgICBfLmF1dG9QbGF5Q2xlYXIgPSAkLnByb3h5KF8uYXV0b1BsYXlDbGVhciwgXyk7XG4gICAgICAgICAgICBfLmF1dG9QbGF5SXRlcmF0b3IgPSAkLnByb3h5KF8uYXV0b1BsYXlJdGVyYXRvciwgXyk7XG4gICAgICAgICAgICBfLmNoYW5nZVNsaWRlID0gJC5wcm94eShfLmNoYW5nZVNsaWRlLCBfKTtcbiAgICAgICAgICAgIF8uY2xpY2tIYW5kbGVyID0gJC5wcm94eShfLmNsaWNrSGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLnNlbGVjdEhhbmRsZXIgPSAkLnByb3h5KF8uc2VsZWN0SGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLnNldFBvc2l0aW9uID0gJC5wcm94eShfLnNldFBvc2l0aW9uLCBfKTtcbiAgICAgICAgICAgIF8uc3dpcGVIYW5kbGVyID0gJC5wcm94eShfLnN3aXBlSGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLmRyYWdIYW5kbGVyID0gJC5wcm94eShfLmRyYWdIYW5kbGVyLCBfKTtcbiAgICAgICAgICAgIF8ua2V5SGFuZGxlciA9ICQucHJveHkoXy5rZXlIYW5kbGVyLCBfKTtcblxuICAgICAgICAgICAgXy5pbnN0YW5jZVVpZCA9IGluc3RhbmNlVWlkKys7XG5cbiAgICAgICAgICAgIC8vIEEgc2ltcGxlIHdheSB0byBjaGVjayBmb3IgSFRNTCBzdHJpbmdzXG4gICAgICAgICAgICAvLyBTdHJpY3QgSFRNTCByZWNvZ25pdGlvbiAobXVzdCBzdGFydCB3aXRoIDwpXG4gICAgICAgICAgICAvLyBFeHRyYWN0ZWQgZnJvbSBqUXVlcnkgdjEuMTEgc291cmNlXG4gICAgICAgICAgICBfLmh0bWxFeHByID0gL14oPzpcXHMqKDxbXFx3XFxXXSs+KVtePl0qKSQvO1xuXG5cbiAgICAgICAgICAgIF8ucmVnaXN0ZXJCcmVha3BvaW50cygpO1xuICAgICAgICAgICAgXy5pbml0KHRydWUpO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gU2xpY2s7XG5cbiAgICB9KCkpO1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFjdGl2YXRlQURBID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1hY3RpdmUnKS5hdHRyKHtcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICdmYWxzZSdcbiAgICAgICAgfSkuZmluZCgnYSwgaW5wdXQsIGJ1dHRvbiwgc2VsZWN0JykuYXR0cih7XG4gICAgICAgICAgICAndGFiaW5kZXgnOiAnMCdcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFkZFNsaWRlID0gU2xpY2sucHJvdG90eXBlLnNsaWNrQWRkID0gZnVuY3Rpb24obWFya3VwLCBpbmRleCwgYWRkQmVmb3JlKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICh0eXBlb2YoaW5kZXgpID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIGFkZEJlZm9yZSA9IGluZGV4O1xuICAgICAgICAgICAgaW5kZXggPSBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKGluZGV4IDwgMCB8fCAoaW5kZXggPj0gXy5zbGlkZUNvdW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgXy51bmxvYWQoKTtcblxuICAgICAgICBpZiAodHlwZW9mKGluZGV4KSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCAmJiBfLiRzbGlkZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJChtYXJrdXApLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhZGRCZWZvcmUpIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuaW5zZXJ0QmVmb3JlKF8uJHNsaWRlcy5lcShpbmRleCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuaW5zZXJ0QWZ0ZXIoXy4kc2xpZGVzLmVxKGluZGV4KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoYWRkQmVmb3JlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgJChtYXJrdXApLnByZXBlbmRUbyhfLiRzbGlkZVRyYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJChtYXJrdXApLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVzID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmFwcGVuZChfLiRzbGlkZXMpO1xuXG4gICAgICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnLCBpbmRleCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF8uJHNsaWRlc0NhY2hlID0gXy4kc2xpZGVzO1xuXG4gICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFuaW1hdGVIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuICAgICAgICBpZiAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA9PT0gMSAmJiBfLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgPT09IHRydWUgJiYgXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdmFyIHRhcmdldEhlaWdodCA9IF8uJHNsaWRlcy5lcShfLmN1cnJlbnRTbGlkZSkub3V0ZXJIZWlnaHQodHJ1ZSk7XG4gICAgICAgICAgICBfLiRsaXN0LmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIGhlaWdodDogdGFyZ2V0SGVpZ2h0XG4gICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hbmltYXRlU2xpZGUgPSBmdW5jdGlvbih0YXJnZXRMZWZ0LCBjYWxsYmFjaykge1xuXG4gICAgICAgIHZhciBhbmltUHJvcHMgPSB7fSxcbiAgICAgICAgICAgIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uYW5pbWF0ZUhlaWdodCgpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlICYmIF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRhcmdldExlZnQgPSAtdGFyZ2V0TGVmdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy50cmFuc2Zvcm1zRW5hYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogdGFyZ2V0TGVmdFxuICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZywgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICB0b3A6IHRhcmdldExlZnRcbiAgICAgICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQsIF8ub3B0aW9ucy5lYXNpbmcsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoXy5jc3NUcmFuc2l0aW9ucyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRMZWZ0ID0gLShfLmN1cnJlbnRMZWZ0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJCh7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1TdGFydDogXy5jdXJyZW50TGVmdFxuICAgICAgICAgICAgICAgIH0pLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICBhbmltU3RhcnQ6IHRhcmdldExlZnRcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBfLm9wdGlvbnMuc3BlZWQsXG4gICAgICAgICAgICAgICAgICAgIGVhc2luZzogXy5vcHRpb25zLmVhc2luZyxcbiAgICAgICAgICAgICAgICAgICAgc3RlcDogZnVuY3Rpb24obm93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3cgPSBNYXRoLmNlaWwobm93KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbVByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZSgnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ICsgJ3B4LCAwcHgpJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhhbmltUHJvcHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlKDBweCwnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ICsgJ3B4KSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoYW5pbVByb3BzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBfLmFwcGx5VHJhbnNpdGlvbigpO1xuICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSBNYXRoLmNlaWwodGFyZ2V0TGVmdCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoJyArIHRhcmdldExlZnQgKyAncHgsIDBweCwgMHB4KSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbVByb3BzW18uYW5pbVR5cGVdID0gJ3RyYW5zbGF0ZTNkKDBweCwnICsgdGFyZ2V0TGVmdCArICdweCwgMHB4KSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKGFuaW1Qcm9wcyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgXy5kaXNhYmxlVHJhbnNpdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXROYXZUYXJnZXQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBhc05hdkZvciA9IF8ub3B0aW9ucy5hc05hdkZvcjtcblxuICAgICAgICBpZiAoIGFzTmF2Rm9yICYmIGFzTmF2Rm9yICE9PSBudWxsICkge1xuICAgICAgICAgICAgYXNOYXZGb3IgPSAkKGFzTmF2Rm9yKS5ub3QoXy4kc2xpZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhc05hdkZvcjtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXNOYXZGb3IgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGFzTmF2Rm9yID0gXy5nZXROYXZUYXJnZXQoKTtcblxuICAgICAgICBpZiAoIGFzTmF2Rm9yICE9PSBudWxsICYmIHR5cGVvZiBhc05hdkZvciA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAgICAgICBhc05hdkZvci5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKHRoaXMpLnNsaWNrKCdnZXRTbGljaycpO1xuICAgICAgICAgICAgICAgIGlmKCF0YXJnZXQudW5zbGlja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5zbGlkZUhhbmRsZXIoaW5kZXgsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFwcGx5VHJhbnNpdGlvbiA9IGZ1bmN0aW9uKHNsaWRlKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdHJhbnNpdGlvbiA9IHt9O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRyYW5zaXRpb25bXy50cmFuc2l0aW9uVHlwZV0gPSBfLnRyYW5zZm9ybVR5cGUgKyAnICcgKyBfLm9wdGlvbnMuc3BlZWQgKyAnbXMgJyArIF8ub3B0aW9ucy5jc3NFYXNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJhbnNpdGlvbltfLnRyYW5zaXRpb25UeXBlXSA9ICdvcGFjaXR5ICcgKyBfLm9wdGlvbnMuc3BlZWQgKyAnbXMgJyArIF8ub3B0aW9ucy5jc3NFYXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGUpLmNzcyh0cmFuc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hdXRvUGxheSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmF1dG9QbGF5Q2xlYXIoKTtcblxuICAgICAgICBpZiAoIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKSB7XG4gICAgICAgICAgICBfLmF1dG9QbGF5VGltZXIgPSBzZXRJbnRlcnZhbCggXy5hdXRvUGxheUl0ZXJhdG9yLCBfLm9wdGlvbnMuYXV0b3BsYXlTcGVlZCApO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmF1dG9QbGF5Q2xlYXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uYXV0b1BsYXlUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChfLmF1dG9QbGF5VGltZXIpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmF1dG9QbGF5SXRlcmF0b3IgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBzbGlkZVRvID0gXy5jdXJyZW50U2xpZGUgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG5cbiAgICAgICAgaWYgKCAhXy5wYXVzZWQgJiYgIV8uaW50ZXJydXB0ZWQgJiYgIV8uZm9jdXNzZWQgKSB7XG5cbiAgICAgICAgICAgIGlmICggXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSApIHtcblxuICAgICAgICAgICAgICAgIGlmICggXy5kaXJlY3Rpb24gPT09IDEgJiYgKCBfLmN1cnJlbnRTbGlkZSArIDEgKSA9PT0gKCBfLnNsaWRlQ291bnQgLSAxICkpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCBfLmRpcmVjdGlvbiA9PT0gMCApIHtcblxuICAgICAgICAgICAgICAgICAgICBzbGlkZVRvID0gXy5jdXJyZW50U2xpZGUgLSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBfLmN1cnJlbnRTbGlkZSAtIDEgPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmRpcmVjdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLnNsaWRlSGFuZGxlciggc2xpZGVUbyApO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGRBcnJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgKSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdyA9ICQoXy5vcHRpb25zLnByZXZBcnJvdykuYWRkQ2xhc3MoJ3NsaWNrLWFycm93Jyk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cgPSAkKF8ub3B0aW9ucy5uZXh0QXJyb3cpLmFkZENsYXNzKCdzbGljay1hcnJvdycpO1xuXG4gICAgICAgICAgICBpZiggXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyApIHtcblxuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2staGlkZGVuJykucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4gdGFiaW5kZXgnKTtcbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWhpZGRlbicpLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIHRhYmluZGV4Jyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5odG1sRXhwci50ZXN0KF8ub3B0aW9ucy5wcmV2QXJyb3cpKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5wcmVwZW5kVG8oXy5vcHRpb25zLmFwcGVuZEFycm93cyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMubmV4dEFycm93KSkge1xuICAgICAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cuYXBwZW5kVG8oXy5vcHRpb25zLmFwcGVuZEFycm93cyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3dcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stZGlzYWJsZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5hZGQoIF8uJG5leHRBcnJvdyApXG5cbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1oaWRkZW4nKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYXJpYS1kaXNhYmxlZCc6ICd0cnVlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0YWJpbmRleCc6ICctMSdcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkRG90cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGksIGRvdDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIuYWRkQ2xhc3MoJ3NsaWNrLWRvdHRlZCcpO1xuXG4gICAgICAgICAgICBkb3QgPSAkKCc8dWwgLz4nKS5hZGRDbGFzcyhfLm9wdGlvbnMuZG90c0NsYXNzKTtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8PSBfLmdldERvdENvdW50KCk7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGRvdC5hcHBlbmQoJCgnPGxpIC8+JykuYXBwZW5kKF8ub3B0aW9ucy5jdXN0b21QYWdpbmcuY2FsbCh0aGlzLCBfLCBpKSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLiRkb3RzID0gZG90LmFwcGVuZFRvKF8ub3B0aW9ucy5hcHBlbmREb3RzKTtcblxuICAgICAgICAgICAgXy4kZG90cy5maW5kKCdsaScpLmZpcnN0KCkuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGRPdXQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVzID1cbiAgICAgICAgICAgIF8uJHNsaWRlclxuICAgICAgICAgICAgICAgIC5jaGlsZHJlbiggXy5vcHRpb25zLnNsaWRlICsgJzpub3QoLnNsaWNrLWNsb25lZCknKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stc2xpZGUnKTtcblxuICAgICAgICBfLnNsaWRlQ291bnQgPSBfLiRzbGlkZXMubGVuZ3RoO1xuXG4gICAgICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnLCBpbmRleClcbiAgICAgICAgICAgICAgICAuZGF0YSgnb3JpZ2luYWxTdHlsaW5nJywgJChlbGVtZW50KS5hdHRyKCdzdHlsZScpIHx8ICcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1zbGlkZXInKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrID0gKF8uc2xpZGVDb3VudCA9PT0gMCkgP1xuICAgICAgICAgICAgJCgnPGRpdiBjbGFzcz1cInNsaWNrLXRyYWNrXCIvPicpLmFwcGVuZFRvKF8uJHNsaWRlcikgOlxuICAgICAgICAgICAgXy4kc2xpZGVzLndyYXBBbGwoJzxkaXYgY2xhc3M9XCJzbGljay10cmFja1wiLz4nKS5wYXJlbnQoKTtcblxuICAgICAgICBfLiRsaXN0ID0gXy4kc2xpZGVUcmFjay53cmFwKFxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJzbGljay1saXN0XCIvPicpLnBhcmVudCgpO1xuICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcygnb3BhY2l0eScsIDApO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSB8fCBfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnaW1nW2RhdGEtbGF6eV0nLCBfLiRzbGlkZXIpLm5vdCgnW3NyY10nKS5hZGRDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgICAgIF8uc2V0dXBJbmZpbml0ZSgpO1xuXG4gICAgICAgIF8uYnVpbGRBcnJvd3MoKTtcblxuICAgICAgICBfLmJ1aWxkRG90cygpO1xuXG4gICAgICAgIF8udXBkYXRlRG90cygpO1xuXG5cbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXModHlwZW9mIF8uY3VycmVudFNsaWRlID09PSAnbnVtYmVyJyA/IF8uY3VycmVudFNsaWRlIDogMCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kcmFnZ2FibGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJGxpc3QuYWRkQ2xhc3MoJ2RyYWdnYWJsZScpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkUm93cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcywgYSwgYiwgYywgbmV3U2xpZGVzLCBudW1PZlNsaWRlcywgb3JpZ2luYWxTbGlkZXMsc2xpZGVzUGVyU2VjdGlvbjtcblxuICAgICAgICBuZXdTbGlkZXMgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICAgIG9yaWdpbmFsU2xpZGVzID0gXy4kc2xpZGVyLmNoaWxkcmVuKCk7XG5cbiAgICAgICAgaWYoXy5vcHRpb25zLnJvd3MgPiAwKSB7XG5cbiAgICAgICAgICAgIHNsaWRlc1BlclNlY3Rpb24gPSBfLm9wdGlvbnMuc2xpZGVzUGVyUm93ICogXy5vcHRpb25zLnJvd3M7XG4gICAgICAgICAgICBudW1PZlNsaWRlcyA9IE1hdGguY2VpbChcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNsaWRlcy5sZW5ndGggLyBzbGlkZXNQZXJTZWN0aW9uXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBmb3IoYSA9IDA7IGEgPCBudW1PZlNsaWRlczsgYSsrKXtcbiAgICAgICAgICAgICAgICB2YXIgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBmb3IoYiA9IDA7IGIgPCBfLm9wdGlvbnMucm93czsgYisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGMgPSAwOyBjIDwgXy5vcHRpb25zLnNsaWRlc1BlclJvdzsgYysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gKGEgKiBzbGlkZXNQZXJTZWN0aW9uICsgKChiICogXy5vcHRpb25zLnNsaWRlc1BlclJvdykgKyBjKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlLmFwcGVuZENoaWxkKHJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1NsaWRlcy5hcHBlbmRDaGlsZChzbGlkZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uJHNsaWRlci5lbXB0eSgpLmFwcGVuZChuZXdTbGlkZXMpO1xuICAgICAgICAgICAgXy4kc2xpZGVyLmNoaWxkcmVuKCkuY2hpbGRyZW4oKS5jaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICd3aWR0aCc6KDEwMCAvIF8ub3B0aW9ucy5zbGlkZXNQZXJSb3cpICsgJyUnLFxuICAgICAgICAgICAgICAgICAgICAnZGlzcGxheSc6ICdpbmxpbmUtYmxvY2snXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jaGVja1Jlc3BvbnNpdmUgPSBmdW5jdGlvbihpbml0aWFsLCBmb3JjZVVwZGF0ZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJyZWFrcG9pbnQsIHRhcmdldEJyZWFrcG9pbnQsIHJlc3BvbmRUb1dpZHRoLCB0cmlnZ2VyQnJlYWtwb2ludCA9IGZhbHNlO1xuICAgICAgICB2YXIgc2xpZGVyV2lkdGggPSBfLiRzbGlkZXIud2lkdGgoKTtcbiAgICAgICAgdmFyIHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgJCh3aW5kb3cpLndpZHRoKCk7XG5cbiAgICAgICAgaWYgKF8ucmVzcG9uZFRvID09PSAnd2luZG93Jykge1xuICAgICAgICAgICAgcmVzcG9uZFRvV2lkdGggPSB3aW5kb3dXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChfLnJlc3BvbmRUbyA9PT0gJ3NsaWRlcicpIHtcbiAgICAgICAgICAgIHJlc3BvbmRUb1dpZHRoID0gc2xpZGVyV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5yZXNwb25kVG8gPT09ICdtaW4nKSB7XG4gICAgICAgICAgICByZXNwb25kVG9XaWR0aCA9IE1hdGgubWluKHdpbmRvd1dpZHRoLCBzbGlkZXJXaWR0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5yZXNwb25zaXZlICYmXG4gICAgICAgICAgICBfLm9wdGlvbnMucmVzcG9uc2l2ZS5sZW5ndGggJiZcbiAgICAgICAgICAgIF8ub3B0aW9ucy5yZXNwb25zaXZlICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKGJyZWFrcG9pbnQgaW4gXy5icmVha3BvaW50cykge1xuICAgICAgICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnRzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLm9yaWdpbmFsU2V0dGluZ3MubW9iaWxlRmlyc3QgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPCBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPiBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRCcmVha3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uYWN0aXZlQnJlYWtwb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0QnJlYWtwb2ludCAhPT0gXy5hY3RpdmVCcmVha3BvaW50IHx8IGZvcmNlVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8udW5zbGljayh0YXJnZXRCcmVha3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3NbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCcmVha3BvaW50XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLnJlZnJlc2goaW5pdGlhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSB0YXJnZXRCcmVha3BvaW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy51bnNsaWNrKHRhcmdldEJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnJlZnJlc2goaW5pdGlhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckJyZWFrcG9pbnQgPSB0YXJnZXRCcmVha3BvaW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uYWN0aXZlQnJlYWtwb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMgPSBfLm9yaWdpbmFsU2V0dGluZ3M7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbml0aWFsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8ub3B0aW9ucy5pbml0aWFsU2xpZGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXy5yZWZyZXNoKGluaXRpYWwpO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQnJlYWtwb2ludCA9IHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBvbmx5IHRyaWdnZXIgYnJlYWtwb2ludHMgZHVyaW5nIGFuIGFjdHVhbCBicmVhay4gbm90IG9uIGluaXRpYWxpemUuXG4gICAgICAgICAgICBpZiggIWluaXRpYWwgJiYgdHJpZ2dlckJyZWFrcG9pbnQgIT09IGZhbHNlICkge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdicmVha3BvaW50JywgW18sIHRyaWdnZXJCcmVha3BvaW50XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2hhbmdlU2xpZGUgPSBmdW5jdGlvbihldmVudCwgZG9udEFuaW1hdGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICAkdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KSxcbiAgICAgICAgICAgIGluZGV4T2Zmc2V0LCBzbGlkZU9mZnNldCwgdW5ldmVuT2Zmc2V0O1xuXG4gICAgICAgIC8vIElmIHRhcmdldCBpcyBhIGxpbmssIHByZXZlbnQgZGVmYXVsdCBhY3Rpb24uXG4gICAgICAgIGlmKCR0YXJnZXQuaXMoJ2EnKSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRhcmdldCBpcyBub3QgdGhlIDxsaT4gZWxlbWVudCAoaWU6IGEgY2hpbGQpLCBmaW5kIHRoZSA8bGk+LlxuICAgICAgICBpZighJHRhcmdldC5pcygnbGknKSkge1xuICAgICAgICAgICAgJHRhcmdldCA9ICR0YXJnZXQuY2xvc2VzdCgnbGknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVuZXZlbk9mZnNldCA9IChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApO1xuICAgICAgICBpbmRleE9mZnNldCA9IHVuZXZlbk9mZnNldCA/IDAgOiAoXy5zbGlkZUNvdW50IC0gXy5jdXJyZW50U2xpZGUpICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQuZGF0YS5tZXNzYWdlKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ3ByZXZpb3VzJzpcbiAgICAgICAgICAgICAgICBzbGlkZU9mZnNldCA9IGluZGV4T2Zmc2V0ID09PSAwID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIGluZGV4T2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlIC0gc2xpZGVPZmZzZXQsIGZhbHNlLCBkb250QW5pbWF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICduZXh0JzpcbiAgICAgICAgICAgICAgICBzbGlkZU9mZnNldCA9IGluZGV4T2Zmc2V0ID09PSAwID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogaW5kZXhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jdXJyZW50U2xpZGUgKyBzbGlkZU9mZnNldCwgZmFsc2UsIGRvbnRBbmltYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2luZGV4JzpcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBldmVudC5kYXRhLmluZGV4ID09PSAwID8gMCA6XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmRhdGEuaW5kZXggfHwgJHRhcmdldC5pbmRleCgpICogXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuXG4gICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jaGVja05hdmlnYWJsZShpbmRleCksIGZhbHNlLCBkb250QW5pbWF0ZSk7XG4gICAgICAgICAgICAgICAgJHRhcmdldC5jaGlsZHJlbigpLnRyaWdnZXIoJ2ZvY3VzJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNoZWNrTmF2aWdhYmxlID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBuYXZpZ2FibGVzLCBwcmV2TmF2aWdhYmxlO1xuXG4gICAgICAgIG5hdmlnYWJsZXMgPSBfLmdldE5hdmlnYWJsZUluZGV4ZXMoKTtcbiAgICAgICAgcHJldk5hdmlnYWJsZSA9IDA7XG4gICAgICAgIGlmIChpbmRleCA+IG5hdmlnYWJsZXNbbmF2aWdhYmxlcy5sZW5ndGggLSAxXSkge1xuICAgICAgICAgICAgaW5kZXggPSBuYXZpZ2FibGVzW25hdmlnYWJsZXMubGVuZ3RoIC0gMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBuIGluIG5hdmlnYWJsZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBuYXZpZ2FibGVzW25dKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gcHJldk5hdmlnYWJsZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByZXZOYXZpZ2FibGUgPSBuYXZpZ2FibGVzW25dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2xlYW5VcEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgJiYgXy4kZG90cyAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICAkKCdsaScsIF8uJGRvdHMpXG4gICAgICAgICAgICAgICAgLm9mZignY2xpY2suc2xpY2snLCBfLmNoYW5nZVNsaWRlKVxuICAgICAgICAgICAgICAgIC5vZmYoJ21vdXNlZW50ZXIuc2xpY2snLCAkLnByb3h5KF8uaW50ZXJydXB0LCBfLCB0cnVlKSlcbiAgICAgICAgICAgICAgICAub2ZmKCdtb3VzZWxlYXZlLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgZmFsc2UpKTtcblxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy4kZG90cy5vZmYoJ2tleWRvd24uc2xpY2snLCBfLmtleUhhbmRsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVyLm9mZignZm9jdXMuc2xpY2sgYmx1ci5zbGljaycpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8uJHByZXZBcnJvdyAmJiBfLiRwcmV2QXJyb3cub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93ICYmIF8uJG5leHRBcnJvdy5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jaGFuZ2VTbGlkZSk7XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdyAmJiBfLiRwcmV2QXJyb3cub2ZmKCdrZXlkb3duLnNsaWNrJywgXy5rZXlIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cgJiYgXy4kbmV4dEFycm93Lm9mZigna2V5ZG93bi5zbGljaycsIF8ua2V5SGFuZGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2hzdGFydC5zbGljayBtb3VzZWRvd24uc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaG1vdmUuc2xpY2sgbW91c2Vtb3ZlLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2hlbmQuc2xpY2sgbW91c2V1cC5zbGljaycsIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNoY2FuY2VsLnNsaWNrIG1vdXNlbGVhdmUuc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG5cbiAgICAgICAgXy4kbGlzdC5vZmYoJ2NsaWNrLnNsaWNrJywgXy5jbGlja0hhbmRsZXIpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm9mZihfLnZpc2liaWxpdHlDaGFuZ2UsIF8udmlzaWJpbGl0eSk7XG5cbiAgICAgICAgXy5jbGVhblVwU2xpZGVFdmVudHMoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uJGxpc3Qub2ZmKCdrZXlkb3duLnNsaWNrJywgXy5rZXlIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJChfLiRzbGlkZVRyYWNrKS5jaGlsZHJlbigpLm9mZignY2xpY2suc2xpY2snLCBfLnNlbGVjdEhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCh3aW5kb3cpLm9mZignb3JpZW50YXRpb25jaGFuZ2Uuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8ub3JpZW50YXRpb25DaGFuZ2UpO1xuXG4gICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5yZXNpemUpO1xuXG4gICAgICAgICQoJ1tkcmFnZ2FibGUhPXRydWVdJywgXy4kc2xpZGVUcmFjaykub2ZmKCdkcmFnc3RhcnQnLCBfLnByZXZlbnREZWZhdWx0KTtcblxuICAgICAgICAkKHdpbmRvdykub2ZmKCdsb2FkLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2xlYW5VcFNsaWRlRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJGxpc3Qub2ZmKCdtb3VzZWVudGVyLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgdHJ1ZSkpO1xuICAgICAgICBfLiRsaXN0Lm9mZignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNsZWFuVXBSb3dzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBvcmlnaW5hbFNsaWRlcztcblxuICAgICAgICBpZihfLm9wdGlvbnMucm93cyA+IDApIHtcbiAgICAgICAgICAgIG9yaWdpbmFsU2xpZGVzID0gXy4kc2xpZGVzLmNoaWxkcmVuKCkuY2hpbGRyZW4oKTtcbiAgICAgICAgICAgIG9yaWdpbmFsU2xpZGVzLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICBfLiRzbGlkZXIuZW1wdHkoKS5hcHBlbmQob3JpZ2luYWxTbGlkZXMpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLnNob3VsZENsaWNrID09PSBmYWxzZSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKHJlZnJlc2gpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheUNsZWFyKCk7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuXG4gICAgICAgIF8uY2xlYW5VcEV2ZW50cygpO1xuXG4gICAgICAgICQoJy5zbGljay1jbG9uZWQnLCBfLiRzbGlkZXIpLmRldGFjaCgpO1xuXG4gICAgICAgIGlmIChfLiRkb3RzKSB7XG4gICAgICAgICAgICBfLiRkb3RzLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLiRwcmV2QXJyb3cgJiYgXy4kcHJldkFycm93Lmxlbmd0aCApIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93XG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCBzbGljay1hcnJvdyBzbGljay1oaWRkZW4nKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbiBhcmlhLWRpc2FibGVkIHRhYmluZGV4JylcbiAgICAgICAgICAgICAgICAuY3NzKCdkaXNwbGF5JywnJyk7XG5cbiAgICAgICAgICAgIGlmICggXy5odG1sRXhwci50ZXN0KCBfLm9wdGlvbnMucHJldkFycm93ICkpIHtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8uJG5leHRBcnJvdyAmJiBfLiRuZXh0QXJyb3cubGVuZ3RoICkge1xuXG4gICAgICAgICAgICBfLiRuZXh0QXJyb3dcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkIHNsaWNrLWFycm93IHNsaWNrLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIGFyaWEtZGlzYWJsZWQgdGFiaW5kZXgnKVxuICAgICAgICAgICAgICAgIC5jc3MoJ2Rpc3BsYXknLCcnKTtcblxuICAgICAgICAgICAgaWYgKCBfLmh0bWxFeHByLnRlc3QoIF8ub3B0aW9ucy5uZXh0QXJyb3cgKSkge1xuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKF8uJHNsaWRlcykge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXNcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ3NsaWNrLXNsaWRlIHNsaWNrLWFjdGl2ZSBzbGljay1jZW50ZXIgc2xpY2stdmlzaWJsZSBzbGljay1jdXJyZW50JylcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4nKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXNsaWNrLWluZGV4JylcbiAgICAgICAgICAgICAgICAuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ3N0eWxlJywgJCh0aGlzKS5kYXRhKCdvcmlnaW5hbFN0eWxpbmcnKSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kbGlzdC5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVyLmFwcGVuZChfLiRzbGlkZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5jbGVhblVwUm93cygpO1xuXG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGVyJyk7XG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKTtcbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1kb3R0ZWQnKTtcblxuICAgICAgICBfLnVuc2xpY2tlZCA9IHRydWU7XG5cbiAgICAgICAgaWYoIXJlZnJlc2gpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdkZXN0cm95JywgW19dKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5kaXNhYmxlVHJhbnNpdGlvbiA9IGZ1bmN0aW9uKHNsaWRlKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdHJhbnNpdGlvbiA9IHt9O1xuXG4gICAgICAgIHRyYW5zaXRpb25bXy50cmFuc2l0aW9uVHlwZV0gPSAnJztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyh0cmFuc2l0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZSkuY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmZhZGVTbGlkZSA9IGZ1bmN0aW9uKHNsaWRlSW5kZXgsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuY3NzKHtcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXhcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgXy5hcHBseVRyYW5zaXRpb24oc2xpZGVJbmRleCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShzbGlkZUluZGV4KS5jc3Moe1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICBfLmRpc2FibGVUcmFuc2l0aW9uKHNsaWRlSW5kZXgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoKTtcbiAgICAgICAgICAgICAgICB9LCBfLm9wdGlvbnMuc3BlZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZmFkZVNsaWRlT3V0ID0gZnVuY3Rpb24oc2xpZGVJbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5jc3NUcmFuc2l0aW9ucyA9PT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMlxuICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBfLmFwcGx5VHJhbnNpdGlvbihzbGlkZUluZGV4KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmNzcyh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAyXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmZpbHRlclNsaWRlcyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0ZpbHRlciA9IGZ1bmN0aW9uKGZpbHRlcikge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoZmlsdGVyICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc0NhY2hlID0gXy4kc2xpZGVzO1xuXG4gICAgICAgICAgICBfLnVubG9hZCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc0NhY2hlLmZpbHRlcihmaWx0ZXIpLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuXG4gICAgICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZm9jdXNIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIC8vIElmIGFueSBjaGlsZCBlbGVtZW50IHJlY2VpdmVzIGZvY3VzIHdpdGhpbiB0aGUgc2xpZGVyIHdlIG5lZWQgdG8gcGF1c2UgdGhlIGF1dG9wbGF5XG4gICAgICAgIF8uJHNsaWRlclxuICAgICAgICAgICAgLm9mZignZm9jdXMuc2xpY2sgYmx1ci5zbGljaycpXG4gICAgICAgICAgICAub24oXG4gICAgICAgICAgICAgICAgJ2ZvY3VzLnNsaWNrJyxcbiAgICAgICAgICAgICAgICAnKicsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyICRzZiA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBfLm9wdGlvbnMucGF1c2VPbkZvY3VzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2YuaXMoJzpmb2N1cycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9jdXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLm9uKFxuICAgICAgICAgICAgICAgICdibHVyLnNsaWNrJyxcbiAgICAgICAgICAgICAgICAnKicsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyICRzZiA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gV2hlbiBhIGJsdXIgb2NjdXJzIG9uIGFueSBlbGVtZW50cyB3aXRoaW4gdGhlIHNsaWRlciB3ZSBiZWNvbWUgdW5mb2N1c2VkXG4gICAgICAgICAgICAgICAgICAgIGlmKCBfLm9wdGlvbnMucGF1c2VPbkZvY3VzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5mb2N1c3NlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldEN1cnJlbnQgPSBTbGljay5wcm90b3R5cGUuc2xpY2tDdXJyZW50U2xpZGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIHJldHVybiBfLmN1cnJlbnRTbGlkZTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0RG90Q291bnQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGJyZWFrUG9pbnQgPSAwO1xuICAgICAgICB2YXIgY291bnRlciA9IDA7XG4gICAgICAgIHZhciBwYWdlclF0eSA9IDA7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICsrcGFnZXJRdHk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdoaWxlIChicmVha1BvaW50IDwgXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICsrcGFnZXJRdHk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBjb3VudGVyICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyICs9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBhZ2VyUXR5ID0gXy5zbGlkZUNvdW50O1xuICAgICAgICB9IGVsc2UgaWYoIV8ub3B0aW9ucy5hc05hdkZvcikge1xuICAgICAgICAgICAgcGFnZXJRdHkgPSAxICsgTWF0aC5jZWlsKChfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAvIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCk7XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICAgIHdoaWxlIChicmVha1BvaW50IDwgXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgKytwYWdlclF0eTtcbiAgICAgICAgICAgICAgICBicmVha1BvaW50ID0gY291bnRlciArIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgICAgICAgICBjb3VudGVyICs9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYWdlclF0eSAtIDE7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldExlZnQgPSBmdW5jdGlvbihzbGlkZUluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdGFyZ2V0TGVmdCxcbiAgICAgICAgICAgIHZlcnRpY2FsSGVpZ2h0LFxuICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAwLFxuICAgICAgICAgICAgdGFyZ2V0U2xpZGUsXG4gICAgICAgICAgICBjb2VmO1xuXG4gICAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgICAgICB2ZXJ0aWNhbEhlaWdodCA9IF8uJHNsaWRlcy5maXJzdCgpLm91dGVySGVpZ2h0KHRydWUpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9IChfLnNsaWRlV2lkdGggKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAqIC0xO1xuICAgICAgICAgICAgICAgIGNvZWYgPSAtMVxuXG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29lZiA9IC0xLjU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29lZiA9IC0yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAodmVydGljYWxIZWlnaHQgKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSAqIGNvZWY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPiBfLnNsaWRlQ291bnQgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2xpZGVJbmRleCA+IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIChzbGlkZUluZGV4IC0gXy5zbGlkZUNvdW50KSkgKiBfLnNsaWRlV2lkdGgpICogLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIChzbGlkZUluZGV4IC0gXy5zbGlkZUNvdW50KSkgKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkgKiBfLnNsaWRlV2lkdGgpICogLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSAqIHZlcnRpY2FsSGVpZ2h0KSAqIC0xO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID4gXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIC0gXy5zbGlkZUNvdW50KSAqIF8uc2xpZGVXaWR0aDtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIC0gXy5zbGlkZUNvdW50KSAqIHZlcnRpY2FsSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gMDtcbiAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoXy5zbGlkZVdpZHRoICogTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSkgLyAyKSAtICgoXy5zbGlkZVdpZHRoICogXy5zbGlkZUNvdW50KSAvIDIpO1xuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlICYmIF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCArPSBfLnNsaWRlV2lkdGggKiBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKSAtIF8uc2xpZGVXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9IDA7XG4gICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ICs9IF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRhcmdldExlZnQgPSAoKHNsaWRlSW5kZXggKiBfLnNsaWRlV2lkdGgpICogLTEpICsgXy5zbGlkZU9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldExlZnQgPSAoKHNsaWRlSW5kZXggKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMSkgKyB2ZXJ0aWNhbE9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgfHwgXy5vcHRpb25zLmluZmluaXRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLnJ0bCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRTbGlkZVswXSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKF8uJHNsaWRlVHJhY2sud2lkdGgoKSAtIHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgLSB0YXJnZXRTbGlkZS53aWR0aCgpKSAqIC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSAgMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSB0YXJnZXRTbGlkZVswXSA/IHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgKiAtMSA6IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyB8fCBfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy4kc2xpZGVUcmFjay5jaGlsZHJlbignLnNsaWNrLXNsaWRlJykuZXEoc2xpZGVJbmRleCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5lcShzbGlkZUluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRTbGlkZVswXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IChfLiRzbGlkZVRyYWNrLndpZHRoKCkgLSB0YXJnZXRTbGlkZVswXS5vZmZzZXRMZWZ0IC0gdGFyZ2V0U2xpZGUud2lkdGgoKSkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSAgMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSB0YXJnZXRTbGlkZVswXSA/IHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgKiAtMSA6IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCArPSAoXy4kbGlzdC53aWR0aCgpIC0gdGFyZ2V0U2xpZGUub3V0ZXJXaWR0aCgpKSAvIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0TGVmdDtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0T3B0aW9uID0gU2xpY2sucHJvdG90eXBlLnNsaWNrR2V0T3B0aW9uID0gZnVuY3Rpb24ob3B0aW9uKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBfLm9wdGlvbnNbb3B0aW9uXTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0TmF2aWdhYmxlSW5kZXhlcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSAwLFxuICAgICAgICAgICAgY291bnRlciA9IDAsXG4gICAgICAgICAgICBpbmRleGVzID0gW10sXG4gICAgICAgICAgICBtYXg7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIG1heCA9IF8uc2xpZGVDb3VudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgKiAtMTtcbiAgICAgICAgICAgIGNvdW50ZXIgPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgKiAtMTtcbiAgICAgICAgICAgIG1heCA9IF8uc2xpZGVDb3VudCAqIDI7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoYnJlYWtQb2ludCA8IG1heCkge1xuICAgICAgICAgICAgaW5kZXhlcy5wdXNoKGJyZWFrUG9pbnQpO1xuICAgICAgICAgICAgYnJlYWtQb2ludCA9IGNvdW50ZXIgKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgICAgICBjb3VudGVyICs9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbmRleGVzO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRTbGljayA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRTbGlkZUNvdW50ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgc2xpZGVzVHJhdmVyc2VkLCBzd2lwZWRTbGlkZSwgc3dpcGVUYXJnZXQsIGNlbnRlck9mZnNldDtcblxuICAgICAgICBjZW50ZXJPZmZzZXQgPSBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSA/IE1hdGguZmxvb3IoXy4kbGlzdC53aWR0aCgpIC8gMikgOiAwO1xuICAgICAgICBzd2lwZVRhcmdldCA9IChfLnN3aXBlTGVmdCAqIC0xKSArIGNlbnRlck9mZnNldDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnN3aXBlVG9TbGlkZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1zbGlkZScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIHNsaWRlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgc2xpZGVPdXRlcldpZHRoLCBzbGlkZU9mZnNldCwgc2xpZGVSaWdodEJvdW5kYXJ5O1xuICAgICAgICAgICAgICAgIHNsaWRlT3V0ZXJXaWR0aCA9ICQoc2xpZGUpLm91dGVyV2lkdGgoKTtcbiAgICAgICAgICAgICAgICBzbGlkZU9mZnNldCA9IHNsaWRlLm9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlT2Zmc2V0ICs9IChzbGlkZU91dGVyV2lkdGggLyAyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzbGlkZVJpZ2h0Qm91bmRhcnkgPSBzbGlkZU9mZnNldCArIChzbGlkZU91dGVyV2lkdGgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHN3aXBlVGFyZ2V0IDwgc2xpZGVSaWdodEJvdW5kYXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXBlZFNsaWRlID0gc2xpZGU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2xpZGVzVHJhdmVyc2VkID0gTWF0aC5hYnMoJChzd2lwZWRTbGlkZSkuYXR0cignZGF0YS1zbGljay1pbmRleCcpIC0gXy5jdXJyZW50U2xpZGUpIHx8IDE7XG5cbiAgICAgICAgICAgIHJldHVybiBzbGlkZXNUcmF2ZXJzZWQ7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ29UbyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0dvVG8gPSBmdW5jdGlvbihzbGlkZSwgZG9udEFuaW1hdGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICBpbmRleDogcGFyc2VJbnQoc2xpZGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGRvbnRBbmltYXRlKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKGNyZWF0aW9uKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICghJChfLiRzbGlkZXIpLmhhc0NsYXNzKCdzbGljay1pbml0aWFsaXplZCcpKSB7XG5cbiAgICAgICAgICAgICQoXy4kc2xpZGVyKS5hZGRDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKTtcblxuICAgICAgICAgICAgXy5idWlsZFJvd3MoKTtcbiAgICAgICAgICAgIF8uYnVpbGRPdXQoKTtcbiAgICAgICAgICAgIF8uc2V0UHJvcHMoKTtcbiAgICAgICAgICAgIF8uc3RhcnRMb2FkKCk7XG4gICAgICAgICAgICBfLmxvYWRTbGlkZXIoKTtcbiAgICAgICAgICAgIF8uaW5pdGlhbGl6ZUV2ZW50cygpO1xuICAgICAgICAgICAgXy51cGRhdGVBcnJvd3MoKTtcbiAgICAgICAgICAgIF8udXBkYXRlRG90cygpO1xuICAgICAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUodHJ1ZSk7XG4gICAgICAgICAgICBfLmZvY3VzSGFuZGxlcigpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3JlYXRpb24pIHtcbiAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdpbml0JywgW19dKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5pbml0QURBKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5hdXRvcGxheSApIHtcblxuICAgICAgICAgICAgXy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXkoKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRBREEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgICAgIG51bURvdEdyb3VwcyA9IE1hdGguY2VpbChfLnNsaWRlQ291bnQgLyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSxcbiAgICAgICAgICAgICAgICB0YWJDb250cm9sSW5kZXhlcyA9IF8uZ2V0TmF2aWdhYmxlSW5kZXhlcygpLmZpbHRlcihmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh2YWwgPj0gMCkgJiYgKHZhbCA8IF8uc2xpZGVDb3VudCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVzLmFkZChfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1jbG9uZWQnKSkuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiAndHJ1ZScsXG4gICAgICAgICAgICAndGFiaW5kZXgnOiAnLTEnXG4gICAgICAgIH0pLmZpbmQoJ2EsIGlucHV0LCBidXR0b24sIHNlbGVjdCcpLmF0dHIoe1xuICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJ1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoXy4kZG90cyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgXy4kc2xpZGVzLm5vdChfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1jbG9uZWQnKSkuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNsaWRlQ29udHJvbEluZGV4ID0gdGFiQ29udHJvbEluZGV4ZXMuaW5kZXhPZihpKTtcblxuICAgICAgICAgICAgICAgICQodGhpcykuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICdyb2xlJzogJ3RhYnBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgJ2lkJzogJ3NsaWNrLXNsaWRlJyArIF8uaW5zdGFuY2VVaWQgKyBpLFxuICAgICAgICAgICAgICAgICAgICAndGFiaW5kZXgnOiAtMVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlQ29udHJvbEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgIHZhciBhcmlhQnV0dG9uQ29udHJvbCA9ICdzbGljay1zbGlkZS1jb250cm9sJyArIF8uaW5zdGFuY2VVaWQgKyBzbGlkZUNvbnRyb2xJbmRleFxuICAgICAgICAgICAgICAgICAgIGlmICgkKCcjJyArIGFyaWFCdXR0b25Db250cm9sKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgJ2FyaWEtZGVzY3JpYmVkYnknOiBhcmlhQnV0dG9uQ29udHJvbFxuICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfLiRkb3RzLmF0dHIoJ3JvbGUnLCAndGFibGlzdCcpLmZpbmQoJ2xpJykuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hcHBlZFNsaWRlSW5kZXggPSB0YWJDb250cm9sSW5kZXhlc1tpXTtcblxuICAgICAgICAgICAgICAgICQodGhpcykuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICdyb2xlJzogJ3ByZXNlbnRhdGlvbidcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnYnV0dG9uJykuZmlyc3QoKS5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgJ3JvbGUnOiAndGFiJyxcbiAgICAgICAgICAgICAgICAgICAgJ2lkJzogJ3NsaWNrLXNsaWRlLWNvbnRyb2wnICsgXy5pbnN0YW5jZVVpZCArIGksXG4gICAgICAgICAgICAgICAgICAgICdhcmlhLWNvbnRyb2xzJzogJ3NsaWNrLXNsaWRlJyArIF8uaW5zdGFuY2VVaWQgKyBtYXBwZWRTbGlkZUluZGV4LFxuICAgICAgICAgICAgICAgICAgICAnYXJpYS1sYWJlbCc6IChpICsgMSkgKyAnIG9mICcgKyBudW1Eb3RHcm91cHMsXG4gICAgICAgICAgICAgICAgICAgICdhcmlhLXNlbGVjdGVkJzogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgJ3RhYmluZGV4JzogJy0xJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9KS5lcShfLmN1cnJlbnRTbGlkZSkuZmluZCgnYnV0dG9uJykuYXR0cih7XG4gICAgICAgICAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZScsXG4gICAgICAgICAgICAgICAgJ3RhYmluZGV4JzogJzAnXG4gICAgICAgICAgICB9KS5lbmQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGk9Xy5jdXJyZW50U2xpZGUsIG1heD1pK18ub3B0aW9ucy5zbGlkZXNUb1Nob3c7IGkgPCBtYXg7IGkrKykge1xuICAgICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPbkNoYW5nZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKGkpLmF0dHIoeyd0YWJpbmRleCc6ICcwJ30pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoaSkucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfLmFjdGl2YXRlQURBKCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRBcnJvd0V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3dcbiAgICAgICAgICAgICAgIC5vZmYoJ2NsaWNrLnNsaWNrJylcbiAgICAgICAgICAgICAgIC5vbignY2xpY2suc2xpY2snLCB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cydcbiAgICAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93XG4gICAgICAgICAgICAgICAub2ZmKCdjbGljay5zbGljaycpXG4gICAgICAgICAgICAgICAub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnbmV4dCdcbiAgICAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cub24oJ2tleWRvd24uc2xpY2snLCBfLmtleUhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5vbigna2V5ZG93bi5zbGljaycsIF8ua2V5SGFuZGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdERvdEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKS5vbignY2xpY2suc2xpY2snLCB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ2luZGV4J1xuICAgICAgICAgICAgfSwgXy5jaGFuZ2VTbGlkZSk7XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJGRvdHMub24oJ2tleWRvd24uc2xpY2snLCBfLmtleUhhbmRsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8ub3B0aW9ucy5wYXVzZU9uRG90c0hvdmVyID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VlbnRlci5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIHRydWUpKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0U2xpZGVFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMucGF1c2VPbkhvdmVyICkge1xuXG4gICAgICAgICAgICBfLiRsaXN0Lm9uKCdtb3VzZWVudGVyLnNsaWNrJywgJC5wcm94eShfLmludGVycnVwdCwgXywgdHJ1ZSkpO1xuICAgICAgICAgICAgXy4kbGlzdC5vbignbW91c2VsZWF2ZS5zbGljaycsICQucHJveHkoXy5pbnRlcnJ1cHQsIF8sIGZhbHNlKSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5pbml0aWFsaXplRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uaW5pdEFycm93RXZlbnRzKCk7XG5cbiAgICAgICAgXy5pbml0RG90RXZlbnRzKCk7XG4gICAgICAgIF8uaW5pdFNsaWRlRXZlbnRzKCk7XG5cbiAgICAgICAgXy4kbGlzdC5vbigndG91Y2hzdGFydC5zbGljayBtb3VzZWRvd24uc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdzdGFydCdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaG1vdmUuc2xpY2sgbW91c2Vtb3ZlLnNsaWNrJywge1xuICAgICAgICAgICAgYWN0aW9uOiAnbW92ZSdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaGVuZC5zbGljayBtb3VzZXVwLnNsaWNrJywge1xuICAgICAgICAgICAgYWN0aW9uOiAnZW5kJ1xuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNoY2FuY2VsLnNsaWNrIG1vdXNlbGVhdmUuc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdlbmQnXG4gICAgICAgIH0sIF8uc3dpcGVIYW5kbGVyKTtcblxuICAgICAgICBfLiRsaXN0Lm9uKCdjbGljay5zbGljaycsIF8uY2xpY2tIYW5kbGVyKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5vbihfLnZpc2liaWxpdHlDaGFuZ2UsICQucHJveHkoXy52aXNpYmlsaXR5LCBfKSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRsaXN0Lm9uKCdrZXlkb3duLnNsaWNrJywgXy5rZXlIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPblNlbGVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJChfLiRzbGlkZVRyYWNrKS5jaGlsZHJlbigpLm9uKCdjbGljay5zbGljaycsIF8uc2VsZWN0SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICAkKHdpbmRvdykub24oJ29yaWVudGF0aW9uY2hhbmdlLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCAkLnByb3h5KF8ub3JpZW50YXRpb25DaGFuZ2UsIF8pKTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgJC5wcm94eShfLnJlc2l6ZSwgXykpO1xuXG4gICAgICAgICQoJ1tkcmFnZ2FibGUhPXRydWVdJywgXy4kc2xpZGVUcmFjaykub24oJ2RyYWdzdGFydCcsIF8ucHJldmVudERlZmF1bHQpO1xuXG4gICAgICAgICQod2luZG93KS5vbignbG9hZC5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG4gICAgICAgICQoXy5zZXRQb3NpdGlvbik7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRVSSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5zaG93KCk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cuc2hvdygpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRkb3RzLnNob3coKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmtleUhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgIC8vRG9udCBzbGlkZSBpZiB0aGUgY3Vyc29yIGlzIGluc2lkZSB0aGUgZm9ybSBmaWVsZHMgYW5kIGFycm93IGtleXMgYXJlIHByZXNzZWRcbiAgICAgICAgaWYoIWV2ZW50LnRhcmdldC50YWdOYW1lLm1hdGNoKCdURVhUQVJFQXxJTlBVVHxTRUxFQ1QnKSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM3ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IF8ub3B0aW9ucy5ydGwgPT09IHRydWUgPyAnbmV4dCcgOiAgJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM5ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IF8ub3B0aW9ucy5ydGwgPT09IHRydWUgPyAncHJldmlvdXMnIDogJ25leHQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5sYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGxvYWRSYW5nZSwgY2xvbmVSYW5nZSwgcmFuZ2VTdGFydCwgcmFuZ2VFbmQ7XG5cbiAgICAgICAgZnVuY3Rpb24gbG9hZEltYWdlcyhpbWFnZXNTY29wZSkge1xuXG4gICAgICAgICAgICAkKCdpbWdbZGF0YS1sYXp5XScsIGltYWdlc1Njb3BlKS5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGltYWdlID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2UgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtbGF6eScpLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVNyY1NldCA9ICQodGhpcykuYXR0cignZGF0YS1zcmNzZXQnKSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VTaXplcyAgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtc2l6ZXMnKSB8fCBfLiRzbGlkZXIuYXR0cignZGF0YS1zaXplcycpLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVRvTG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgb3BhY2l0eTogMCB9LCAxMDAsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlU3JjU2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3Jjc2V0JywgaW1hZ2VTcmNTZXQgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2VTaXplcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc2l6ZXMnLCBpbWFnZVNpemVzICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3JjJywgaW1hZ2VTb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgb3BhY2l0eTogMSB9LCAyMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1sYXp5IGRhdGEtc3Jjc2V0IGRhdGEtc2l6ZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignbGF6eUxvYWRlZCcsIFtfLCBpbWFnZSwgaW1hZ2VTb3VyY2VdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoICdkYXRhLWxhenknIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggJ3NsaWNrLWxvYWRpbmcnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyggJ3NsaWNrLWxhenlsb2FkLWVycm9yJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdsYXp5TG9hZEVycm9yJywgWyBfLCBpbWFnZSwgaW1hZ2VTb3VyY2UgXSk7XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQuc3JjID0gaW1hZ2VTb3VyY2U7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5jdXJyZW50U2xpZGUgKyAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIgKyAxKTtcbiAgICAgICAgICAgICAgICByYW5nZUVuZCA9IHJhbmdlU3RhcnQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmFuZ2VTdGFydCA9IE1hdGgubWF4KDAsIF8uY3VycmVudFNsaWRlIC0gKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyICsgMSkpO1xuICAgICAgICAgICAgICAgIHJhbmdlRW5kID0gMiArIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMiArIDEpICsgXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5vcHRpb25zLmluZmluaXRlID8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIF8uY3VycmVudFNsaWRlIDogXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICByYW5nZUVuZCA9IE1hdGguY2VpbChyYW5nZVN0YXJ0ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdyk7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VTdGFydCA+IDApIHJhbmdlU3RhcnQtLTtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VFbmQgPD0gXy5zbGlkZUNvdW50KSByYW5nZUVuZCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbG9hZFJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpLnNsaWNlKHJhbmdlU3RhcnQsIHJhbmdlRW5kKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmxhenlMb2FkID09PSAnYW50aWNpcGF0ZWQnKSB7XG4gICAgICAgICAgICB2YXIgcHJldlNsaWRlID0gcmFuZ2VTdGFydCAtIDEsXG4gICAgICAgICAgICAgICAgbmV4dFNsaWRlID0gcmFuZ2VFbmQsXG4gICAgICAgICAgICAgICAgJHNsaWRlcyA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stc2xpZGUnKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChwcmV2U2xpZGUgPCAwKSBwcmV2U2xpZGUgPSBfLnNsaWRlQ291bnQgLSAxO1xuICAgICAgICAgICAgICAgIGxvYWRSYW5nZSA9IGxvYWRSYW5nZS5hZGQoJHNsaWRlcy5lcShwcmV2U2xpZGUpKTtcbiAgICAgICAgICAgICAgICBsb2FkUmFuZ2UgPSBsb2FkUmFuZ2UuYWRkKCRzbGlkZXMuZXEobmV4dFNsaWRlKSk7XG4gICAgICAgICAgICAgICAgcHJldlNsaWRlLS07XG4gICAgICAgICAgICAgICAgbmV4dFNsaWRlKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsb2FkSW1hZ2VzKGxvYWRSYW5nZSk7XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBjbG9uZVJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpO1xuICAgICAgICAgICAgbG9hZEltYWdlcyhjbG9uZVJhbmdlKTtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBjbG9uZVJhbmdlID0gXy4kc2xpZGVyLmZpbmQoJy5zbGljay1jbG9uZWQnKS5zbGljZSgwLCBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIGxvYWRJbWFnZXMoY2xvbmVSYW5nZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5jdXJyZW50U2xpZGUgPT09IDApIHtcbiAgICAgICAgICAgIGNsb25lUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLWNsb25lZCcpLnNsaWNlKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKiAtMSk7XG4gICAgICAgICAgICBsb2FkSW1hZ2VzKGNsb25lUmFuZ2UpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmxvYWRTbGlkZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVyLnJlbW92ZUNsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICAgICAgXy5pbml0VUkoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmxhenlMb2FkID09PSAncHJvZ3Jlc3NpdmUnKSB7XG4gICAgICAgICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5uZXh0ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrTmV4dCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnbmV4dCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLm9yaWVudGF0aW9uQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uY2hlY2tSZXNwb25zaXZlKCk7XG4gICAgICAgIF8uc2V0UG9zaXRpb24oKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucGF1c2UgPSBTbGljay5wcm90b3R5cGUuc2xpY2tQYXVzZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmF1dG9QbGF5Q2xlYXIoKTtcbiAgICAgICAgXy5wYXVzZWQgPSB0cnVlO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wbGF5ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUGxheSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgIF8ub3B0aW9ucy5hdXRvcGxheSA9IHRydWU7XG4gICAgICAgIF8ucGF1c2VkID0gZmFsc2U7XG4gICAgICAgIF8uZm9jdXNzZWQgPSBmYWxzZTtcbiAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wb3N0U2xpZGUgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiggIV8udW5zbGlja2VkICkge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignYWZ0ZXJDaGFuZ2UnLCBbXywgaW5kZXhdKTtcblxuICAgICAgICAgICAgXy5hbmltYXRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXV0b3BsYXkgKSB7XG4gICAgICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLmluaXRBREEoKTtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuZm9jdXNPbkNoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJGN1cnJlbnRTbGlkZSA9ICQoXy4kc2xpZGVzLmdldChfLmN1cnJlbnRTbGlkZSkpO1xuICAgICAgICAgICAgICAgICAgICAkY3VycmVudFNsaWRlLmF0dHIoJ3RhYmluZGV4JywgMCkuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wcmV2ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrUHJldiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAncHJldmlvdXMnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJvZ3Jlc3NpdmVMYXp5TG9hZCA9IGZ1bmN0aW9uKCB0cnlDb3VudCApIHtcblxuICAgICAgICB0cnlDb3VudCA9IHRyeUNvdW50IHx8IDE7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgJGltZ3NUb0xvYWQgPSAkKCAnaW1nW2RhdGEtbGF6eV0nLCBfLiRzbGlkZXIgKSxcbiAgICAgICAgICAgIGltYWdlLFxuICAgICAgICAgICAgaW1hZ2VTb3VyY2UsXG4gICAgICAgICAgICBpbWFnZVNyY1NldCxcbiAgICAgICAgICAgIGltYWdlU2l6ZXMsXG4gICAgICAgICAgICBpbWFnZVRvTG9hZDtcblxuICAgICAgICBpZiAoICRpbWdzVG9Mb2FkLmxlbmd0aCApIHtcblxuICAgICAgICAgICAgaW1hZ2UgPSAkaW1nc1RvTG9hZC5maXJzdCgpO1xuICAgICAgICAgICAgaW1hZ2VTb3VyY2UgPSBpbWFnZS5hdHRyKCdkYXRhLWxhenknKTtcbiAgICAgICAgICAgIGltYWdlU3JjU2V0ID0gaW1hZ2UuYXR0cignZGF0YS1zcmNzZXQnKTtcbiAgICAgICAgICAgIGltYWdlU2l6ZXMgID0gaW1hZ2UuYXR0cignZGF0YS1zaXplcycpIHx8IF8uJHNsaWRlci5hdHRyKCdkYXRhLXNpemVzJyk7XG4gICAgICAgICAgICBpbWFnZVRvTG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgICAgICBpbWFnZVRvTG9hZC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGlmIChpbWFnZVNyY1NldCkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3NyY3NldCcsIGltYWdlU3JjU2V0ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlU2l6ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3NpemVzJywgaW1hZ2VTaXplcyApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoICdzcmMnLCBpbWFnZVNvdXJjZSApXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLWxhenkgZGF0YS1zcmNzZXQgZGF0YS1zaXplcycpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBfLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgPT09IHRydWUgKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uc2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignbGF6eUxvYWRlZCcsIFsgXywgaW1hZ2UsIGltYWdlU291cmNlIF0pO1xuICAgICAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCgpO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpbWFnZVRvTG9hZC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIHRyeUNvdW50IDwgMyApIHtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogdHJ5IHRvIGxvYWQgdGhlIGltYWdlIDMgdGltZXMsXG4gICAgICAgICAgICAgICAgICAgICAqIGxlYXZlIGEgc2xpZ2h0IGRlbGF5IHNvIHdlIGRvbid0IGdldFxuICAgICAgICAgICAgICAgICAgICAgKiBzZXJ2ZXJzIGJsb2NraW5nIHRoZSByZXF1ZXN0LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoIHRyeUNvdW50ICsgMSApO1xuICAgICAgICAgICAgICAgICAgICB9LCA1MDAgKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCAnZGF0YS1sYXp5JyApXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoICdzbGljay1sb2FkaW5nJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoICdzbGljay1sYXp5bG9hZC1lcnJvcicgKTtcblxuICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignbGF6eUxvYWRFcnJvcicsIFsgXywgaW1hZ2UsIGltYWdlU291cmNlIF0pO1xuXG4gICAgICAgICAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCgpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpbWFnZVRvTG9hZC5zcmMgPSBpbWFnZVNvdXJjZTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignYWxsSW1hZ2VzTG9hZGVkJywgWyBfIF0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCBpbml0aWFsaXppbmcgKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBjdXJyZW50U2xpZGUsIGxhc3RWaXNpYmxlSW5kZXg7XG5cbiAgICAgICAgbGFzdFZpc2libGVJbmRleCA9IF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG5cbiAgICAgICAgLy8gaW4gbm9uLWluZmluaXRlIHNsaWRlcnMsIHdlIGRvbid0IHdhbnQgdG8gZ28gcGFzdCB0aGVcbiAgICAgICAgLy8gbGFzdCB2aXNpYmxlIGluZGV4LlxuICAgICAgICBpZiggIV8ub3B0aW9ucy5pbmZpbml0ZSAmJiAoIF8uY3VycmVudFNsaWRlID4gbGFzdFZpc2libGVJbmRleCApKSB7XG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IGxhc3RWaXNpYmxlSW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBsZXNzIHNsaWRlcyB0aGFuIHRvIHNob3csIGdvIHRvIHN0YXJ0LlxuICAgICAgICBpZiAoIF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICkge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSAwO1xuXG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50U2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcblxuICAgICAgICBfLmRlc3Ryb3kodHJ1ZSk7XG5cbiAgICAgICAgJC5leHRlbmQoXywgXy5pbml0aWFscywgeyBjdXJyZW50U2xpZGU6IGN1cnJlbnRTbGlkZSB9KTtcblxuICAgICAgICBfLmluaXQoKTtcblxuICAgICAgICBpZiggIWluaXRpYWxpemluZyApIHtcblxuICAgICAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnaW5kZXgnLFxuICAgICAgICAgICAgICAgICAgICBpbmRleDogY3VycmVudFNsaWRlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVnaXN0ZXJCcmVha3BvaW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcywgYnJlYWtwb2ludCwgY3VycmVudEJyZWFrcG9pbnQsIGwsXG4gICAgICAgICAgICByZXNwb25zaXZlU2V0dGluZ3MgPSBfLm9wdGlvbnMucmVzcG9uc2l2ZSB8fCBudWxsO1xuXG4gICAgICAgIGlmICggJC50eXBlKHJlc3BvbnNpdmVTZXR0aW5ncykgPT09ICdhcnJheScgJiYgcmVzcG9uc2l2ZVNldHRpbmdzLmxlbmd0aCApIHtcblxuICAgICAgICAgICAgXy5yZXNwb25kVG8gPSBfLm9wdGlvbnMucmVzcG9uZFRvIHx8ICd3aW5kb3cnO1xuXG4gICAgICAgICAgICBmb3IgKCBicmVha3BvaW50IGluIHJlc3BvbnNpdmVTZXR0aW5ncyApIHtcblxuICAgICAgICAgICAgICAgIGwgPSBfLmJyZWFrcG9pbnRzLmxlbmd0aC0xO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNpdmVTZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShicmVha3BvaW50KSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50QnJlYWtwb2ludCA9IHJlc3BvbnNpdmVTZXR0aW5nc1ticmVha3BvaW50XS5icmVha3BvaW50O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgYnJlYWtwb2ludHMgYW5kIGN1dCBvdXQgYW55IGV4aXN0aW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIG9uZXMgd2l0aCB0aGUgc2FtZSBicmVha3BvaW50IG51bWJlciwgd2UgZG9uJ3Qgd2FudCBkdXBlcy5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUoIGwgPj0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBfLmJyZWFrcG9pbnRzW2xdICYmIF8uYnJlYWtwb2ludHNbbF0gPT09IGN1cnJlbnRCcmVha3BvaW50ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludHMuc3BsaWNlKGwsMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBsLS07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRzLnB1c2goY3VycmVudEJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tjdXJyZW50QnJlYWtwb2ludF0gPSByZXNwb25zaXZlU2V0dGluZ3NbYnJlYWtwb2ludF0uc2V0dGluZ3M7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy5icmVha3BvaW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCBfLm9wdGlvbnMubW9iaWxlRmlyc3QgKSA/IGEtYiA6IGItYTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVpbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJHNsaWRlcyA9XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrXG4gICAgICAgICAgICAgICAgLmNoaWxkcmVuKF8ub3B0aW9ucy5zbGlkZSlcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLXNsaWRlJyk7XG5cbiAgICAgICAgXy5zbGlkZUNvdW50ID0gXy4kc2xpZGVzLmxlbmd0aDtcblxuICAgICAgICBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50ICYmIF8uY3VycmVudFNsaWRlICE9PSAwKSB7XG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IF8uY3VycmVudFNsaWRlIC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBfLnJlZ2lzdGVyQnJlYWtwb2ludHMoKTtcblxuICAgICAgICBfLnNldFByb3BzKCk7XG4gICAgICAgIF8uc2V0dXBJbmZpbml0ZSgpO1xuICAgICAgICBfLmJ1aWxkQXJyb3dzKCk7XG4gICAgICAgIF8udXBkYXRlQXJyb3dzKCk7XG4gICAgICAgIF8uaW5pdEFycm93RXZlbnRzKCk7XG4gICAgICAgIF8uYnVpbGREb3RzKCk7XG4gICAgICAgIF8udXBkYXRlRG90cygpO1xuICAgICAgICBfLmluaXREb3RFdmVudHMoKTtcbiAgICAgICAgXy5jbGVhblVwU2xpZGVFdmVudHMoKTtcbiAgICAgICAgXy5pbml0U2xpZGVFdmVudHMoKTtcblxuICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZShmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mb2N1c09uU2VsZWN0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAkKF8uJHNsaWRlVHJhY2spLmNoaWxkcmVuKCkub24oJ2NsaWNrLnNsaWNrJywgXy5zZWxlY3RIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uc2V0U2xpZGVDbGFzc2VzKHR5cGVvZiBfLmN1cnJlbnRTbGlkZSA9PT0gJ251bWJlcicgPyBfLmN1cnJlbnRTbGlkZSA6IDApO1xuXG4gICAgICAgIF8uc2V0UG9zaXRpb24oKTtcbiAgICAgICAgXy5mb2N1c0hhbmRsZXIoKTtcblxuICAgICAgICBfLnBhdXNlZCA9ICFfLm9wdGlvbnMuYXV0b3BsYXk7XG4gICAgICAgIF8uYXV0b1BsYXkoKTtcblxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcigncmVJbml0JywgW19dKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSAhPT0gXy53aW5kb3dXaWR0aCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KF8ud2luZG93RGVsYXkpO1xuICAgICAgICAgICAgXy53aW5kb3dEZWxheSA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIF8ud2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgICAgICAgICBfLmNoZWNrUmVzcG9uc2l2ZSgpO1xuICAgICAgICAgICAgICAgIGlmKCAhXy51bnNsaWNrZWQgKSB7IF8uc2V0UG9zaXRpb24oKTsgfVxuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZW1vdmVTbGlkZSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1JlbW92ZSA9IGZ1bmN0aW9uKGluZGV4LCByZW1vdmVCZWZvcmUsIHJlbW92ZUFsbCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAodHlwZW9mKGluZGV4KSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICByZW1vdmVCZWZvcmUgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gcmVtb3ZlQmVmb3JlID09PSB0cnVlID8gMCA6IF8uc2xpZGVDb3VudCAtIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmRleCA9IHJlbW92ZUJlZm9yZSA9PT0gdHJ1ZSA/IC0taW5kZXggOiBpbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPCAxIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+IF8uc2xpZGVDb3VudCAtIDEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgaWYgKHJlbW92ZUFsbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbigpLnJlbW92ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmVxKGluZGV4KS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5hcHBlbmQoXy4kc2xpZGVzKTtcblxuICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcblxuICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRDU1MgPSBmdW5jdGlvbihwb3NpdGlvbikge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHBvc2l0aW9uUHJvcHMgPSB7fSxcbiAgICAgICAgICAgIHgsIHk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gLXBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHggPSBfLnBvc2l0aW9uUHJvcCA9PSAnbGVmdCcgPyBNYXRoLmNlaWwocG9zaXRpb24pICsgJ3B4JyA6ICcwcHgnO1xuICAgICAgICB5ID0gXy5wb3NpdGlvblByb3AgPT0gJ3RvcCcgPyBNYXRoLmNlaWwocG9zaXRpb24pICsgJ3B4JyA6ICcwcHgnO1xuXG4gICAgICAgIHBvc2l0aW9uUHJvcHNbXy5wb3NpdGlvblByb3BdID0gcG9zaXRpb247XG5cbiAgICAgICAgaWYgKF8udHJhbnNmb3Jtc0VuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvc2l0aW9uUHJvcHMgPSB7fTtcbiAgICAgICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlKCcgKyB4ICsgJywgJyArIHkgKyAnKSc7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MocG9zaXRpb25Qcm9wcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoJyArIHggKyAnLCAnICsgeSArICcsIDBweCknO1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHBvc2l0aW9uUHJvcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldERpbWVuc2lvbnMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJGxpc3QuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogKCcwcHggJyArIF8ub3B0aW9ucy5jZW50ZXJQYWRkaW5nKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kbGlzdC5oZWlnaHQoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJGxpc3QuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogKF8ub3B0aW9ucy5jZW50ZXJQYWRkaW5nICsgJyAwcHgnKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgXy5saXN0V2lkdGggPSBfLiRsaXN0LndpZHRoKCk7XG4gICAgICAgIF8ubGlzdEhlaWdodCA9IF8uJGxpc3QuaGVpZ2h0KCk7XG5cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSAmJiBfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uc2xpZGVXaWR0aCA9IE1hdGguY2VpbChfLmxpc3RXaWR0aCAvIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay53aWR0aChNYXRoLmNlaWwoKF8uc2xpZGVXaWR0aCAqIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmxlbmd0aCkpKTtcblxuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy52YXJpYWJsZVdpZHRoID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLndpZHRoKDUwMDAgKiBfLnNsaWRlQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5zbGlkZVdpZHRoID0gTWF0aC5jZWlsKF8ubGlzdFdpZHRoKTtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suaGVpZ2h0KE1hdGguY2VpbCgoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5sZW5ndGgpKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb2Zmc2V0ID0gXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJXaWR0aCh0cnVlKSAtIF8uJHNsaWRlcy5maXJzdCgpLndpZHRoKCk7XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gZmFsc2UpIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLndpZHRoKF8uc2xpZGVXaWR0aCAtIG9mZnNldCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldEZhZGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0YXJnZXRMZWZ0O1xuXG4gICAgICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKF8uc2xpZGVXaWR0aCAqIGluZGV4KSAqIC0xO1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgICAgICAgICByaWdodDogdGFyZ2V0TGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAyLFxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRhcmdldExlZnQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiBfLm9wdGlvbnMuekluZGV4IC0gMixcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXMuZXEoXy5jdXJyZW50U2xpZGUpLmNzcyh7XG4gICAgICAgICAgICB6SW5kZXg6IF8ub3B0aW9ucy56SW5kZXggLSAxLFxuICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID09PSAxICYmIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5vdXRlckhlaWdodCh0cnVlKTtcbiAgICAgICAgICAgIF8uJGxpc3QuY3NzKCdoZWlnaHQnLCB0YXJnZXRIZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldE9wdGlvbiA9XG4gICAgU2xpY2sucHJvdG90eXBlLnNsaWNrU2V0T3B0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGFjY2VwdHMgYXJndW1lbnRzIGluIGZvcm1hdCBvZjpcbiAgICAgICAgICpcbiAgICAgICAgICogIC0gZm9yIGNoYW5naW5nIGEgc2luZ2xlIG9wdGlvbidzIHZhbHVlOlxuICAgICAgICAgKiAgICAgLnNsaWNrKFwic2V0T3B0aW9uXCIsIG9wdGlvbiwgdmFsdWUsIHJlZnJlc2ggKVxuICAgICAgICAgKlxuICAgICAgICAgKiAgLSBmb3IgY2hhbmdpbmcgYSBzZXQgb2YgcmVzcG9uc2l2ZSBvcHRpb25zOlxuICAgICAgICAgKiAgICAgLnNsaWNrKFwic2V0T3B0aW9uXCIsICdyZXNwb25zaXZlJywgW3t9LCAuLi5dLCByZWZyZXNoIClcbiAgICAgICAgICpcbiAgICAgICAgICogIC0gZm9yIHVwZGF0aW5nIG11bHRpcGxlIHZhbHVlcyBhdCBvbmNlIChub3QgcmVzcG9uc2l2ZSlcbiAgICAgICAgICogICAgIC5zbGljayhcInNldE9wdGlvblwiLCB7ICdvcHRpb24nOiB2YWx1ZSwgLi4uIH0sIHJlZnJlc2ggKVxuICAgICAgICAgKi9cblxuICAgICAgICB2YXIgXyA9IHRoaXMsIGwsIGl0ZW0sIG9wdGlvbiwgdmFsdWUsIHJlZnJlc2ggPSBmYWxzZSwgdHlwZTtcblxuICAgICAgICBpZiggJC50eXBlKCBhcmd1bWVudHNbMF0gKSA9PT0gJ29iamVjdCcgKSB7XG5cbiAgICAgICAgICAgIG9wdGlvbiA9ICBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICByZWZyZXNoID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgdHlwZSA9ICdtdWx0aXBsZSc7XG5cbiAgICAgICAgfSBlbHNlIGlmICggJC50eXBlKCBhcmd1bWVudHNbMF0gKSA9PT0gJ3N0cmluZycgKSB7XG5cbiAgICAgICAgICAgIG9wdGlvbiA9ICBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB2YWx1ZSA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHJlZnJlc2ggPSBhcmd1bWVudHNbMl07XG5cbiAgICAgICAgICAgIGlmICggYXJndW1lbnRzWzBdID09PSAncmVzcG9uc2l2ZScgJiYgJC50eXBlKCBhcmd1bWVudHNbMV0gKSA9PT0gJ2FycmF5JyApIHtcblxuICAgICAgICAgICAgICAgIHR5cGUgPSAncmVzcG9uc2l2ZSc7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiBhcmd1bWVudHNbMV0gIT09ICd1bmRlZmluZWQnICkge1xuXG4gICAgICAgICAgICAgICAgdHlwZSA9ICdzaW5nbGUnO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggdHlwZSA9PT0gJ3NpbmdsZScgKSB7XG5cbiAgICAgICAgICAgIF8ub3B0aW9uc1tvcHRpb25dID0gdmFsdWU7XG5cblxuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlID09PSAnbXVsdGlwbGUnICkge1xuXG4gICAgICAgICAgICAkLmVhY2goIG9wdGlvbiAsIGZ1bmN0aW9uKCBvcHQsIHZhbCApIHtcblxuICAgICAgICAgICAgICAgIF8ub3B0aW9uc1tvcHRdID0gdmFsO1xuXG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGUgPT09ICdyZXNwb25zaXZlJyApIHtcblxuICAgICAgICAgICAgZm9yICggaXRlbSBpbiB2YWx1ZSApIHtcblxuICAgICAgICAgICAgICAgIGlmKCAkLnR5cGUoIF8ub3B0aW9ucy5yZXNwb25zaXZlICkgIT09ICdhcnJheScgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUgPSBbIHZhbHVlW2l0ZW1dIF07XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGwgPSBfLm9wdGlvbnMucmVzcG9uc2l2ZS5sZW5ndGgtMTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggdGhlIHJlc3BvbnNpdmUgb2JqZWN0IGFuZCBzcGxpY2Ugb3V0IGR1cGxpY2F0ZXMuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKCBsID49IDAgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBfLm9wdGlvbnMucmVzcG9uc2l2ZVtsXS5icmVha3BvaW50ID09PSB2YWx1ZVtpdGVtXS5icmVha3BvaW50ICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnJlc3BvbnNpdmUuc3BsaWNlKGwsMSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgbC0tO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMucmVzcG9uc2l2ZS5wdXNoKCB2YWx1ZVtpdGVtXSApO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggcmVmcmVzaCApIHtcblxuICAgICAgICAgICAgXy51bmxvYWQoKTtcbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLnNldERpbWVuc2lvbnMoKTtcblxuICAgICAgICBfLnNldEhlaWdodCgpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uc2V0Q1NTKF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5zZXRGYWRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignc2V0UG9zaXRpb24nLCBbX10pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRQcm9wcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJvZHlTdHlsZSA9IGRvY3VtZW50LmJvZHkuc3R5bGU7XG5cbiAgICAgICAgXy5wb3NpdGlvblByb3AgPSBfLm9wdGlvbnMudmVydGljYWwgPT09IHRydWUgPyAndG9wJyA6ICdsZWZ0JztcblxuICAgICAgICBpZiAoXy5wb3NpdGlvblByb3AgPT09ICd0b3AnKSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIuYWRkQ2xhc3MoJ3NsaWNrLXZlcnRpY2FsJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLXZlcnRpY2FsJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm9keVN0eWxlLldlYmtpdFRyYW5zaXRpb24gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgYm9keVN0eWxlLk1velRyYW5zaXRpb24gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgYm9keVN0eWxlLm1zVHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLnVzZUNTUyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uY3NzVHJhbnNpdGlvbnMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuZmFkZSApIHtcbiAgICAgICAgICAgIGlmICggdHlwZW9mIF8ub3B0aW9ucy56SW5kZXggPT09ICdudW1iZXInICkge1xuICAgICAgICAgICAgICAgIGlmKCBfLm9wdGlvbnMuekluZGV4IDwgMyApIHtcbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zLnpJbmRleCA9IDM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfLm9wdGlvbnMuekluZGV4ID0gXy5kZWZhdWx0cy56SW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm9keVN0eWxlLk9UcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICdPVHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctby10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICdPVHJhbnNpdGlvbic7XG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLnBlcnNwZWN0aXZlUHJvcGVydHkgPT09IHVuZGVmaW5lZCAmJiBib2R5U3R5bGUud2Via2l0UGVyc3BlY3RpdmUgPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUuTW96VHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAnTW96VHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbW96LXRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ01velRyYW5zaXRpb24nO1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZS5wZXJzcGVjdGl2ZVByb3BlcnR5ID09PSB1bmRlZmluZWQgJiYgYm9keVN0eWxlLk1velBlcnNwZWN0aXZlID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9keVN0eWxlLndlYmtpdFRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ3dlYmtpdFRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLXdlYmtpdC10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICd3ZWJraXRUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUucGVyc3BlY3RpdmVQcm9wZXJ0eSA9PT0gdW5kZWZpbmVkICYmIGJvZHlTdHlsZS53ZWJraXRQZXJzcGVjdGl2ZSA9PT0gdW5kZWZpbmVkKSBfLmFuaW1UeXBlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvZHlTdHlsZS5tc1RyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ21zVHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbXMtdHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnbXNUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUubXNUcmFuc2Zvcm0gPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUudHJhbnNmb3JtICE9PSB1bmRlZmluZWQgJiYgXy5hbmltVHlwZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAndHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICd0cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICd0cmFuc2l0aW9uJztcbiAgICAgICAgfVxuICAgICAgICBfLnRyYW5zZm9ybXNFbmFibGVkID0gXy5vcHRpb25zLnVzZVRyYW5zZm9ybSAmJiAoXy5hbmltVHlwZSAhPT0gbnVsbCAmJiBfLmFuaW1UeXBlICE9PSBmYWxzZSk7XG4gICAgfTtcblxuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldFNsaWRlQ2xhc3NlcyA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgY2VudGVyT2Zmc2V0LCBhbGxTbGlkZXMsIGluZGV4T2Zmc2V0LCByZW1haW5kZXI7XG5cbiAgICAgICAgYWxsU2xpZGVzID0gXy4kc2xpZGVyXG4gICAgICAgICAgICAuZmluZCgnLnNsaWNrLXNsaWRlJylcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stYWN0aXZlIHNsaWNrLWNlbnRlciBzbGljay1jdXJyZW50JylcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICAgICAgXy4kc2xpZGVzXG4gICAgICAgICAgICAuZXEoaW5kZXgpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWN1cnJlbnQnKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgdmFyIGV2ZW5Db2VmID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAlIDIgPT09IDAgPyAxIDogMDtcblxuICAgICAgICAgICAgY2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMik7XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcblxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSBjZW50ZXJPZmZzZXQgJiYgaW5kZXggPD0gKF8uc2xpZGVDb3VudCAtIDEpIC0gY2VudGVyT2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4IC0gY2VudGVyT2Zmc2V0ICsgZXZlbkNvZWYsIGluZGV4ICsgY2VudGVyT2Zmc2V0ICsgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBpbmRleE9mZnNldCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXhPZmZzZXQgLSBjZW50ZXJPZmZzZXQgKyAxICsgZXZlbkNvZWYsIGluZGV4T2Zmc2V0ICsgY2VudGVyT2Zmc2V0ICsgMilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuZXEoYWxsU2xpZGVzLmxlbmd0aCAtIDEgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IF8uc2xpZGVDb3VudCAtIDEpIHtcblxuICAgICAgICAgICAgICAgICAgICBhbGxTbGlkZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lcShfLm9wdGlvbnMuc2xpZGVzVG9TaG93KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfLiRzbGlkZXNcbiAgICAgICAgICAgICAgICAuZXEoaW5kZXgpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8PSAoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykpIHtcblxuICAgICAgICAgICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXgsIGluZGV4ICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdylcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbGxTbGlkZXMubGVuZ3RoIDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgcmVtYWluZGVyID0gXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgICAgICAgICBpbmRleE9mZnNldCA9IF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gdHJ1ZSA/IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyBpbmRleCA6IGluZGV4O1xuXG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICYmIChfLnNsaWRlQ291bnQgLSBpbmRleCkgPCBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYWxsU2xpZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoaW5kZXhPZmZzZXQgLSAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIHJlbWFpbmRlciksIGluZGV4T2Zmc2V0ICsgcmVtYWluZGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKGluZGV4T2Zmc2V0LCBpbmRleE9mZnNldCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmxhenlMb2FkID09PSAnb25kZW1hbmQnIHx8IF8ub3B0aW9ucy5sYXp5TG9hZCA9PT0gJ2FudGljaXBhdGVkJykge1xuICAgICAgICAgICAgXy5sYXp5TG9hZCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXR1cEluZmluaXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgaSwgc2xpZGVJbmRleCwgaW5maW5pdGVDb3VudDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8ub3B0aW9ucy5jZW50ZXJNb2RlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlICYmIF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBzbGlkZUluZGV4ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5maW5pdGVDb3VudCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gXy5zbGlkZUNvdW50OyBpID4gKF8uc2xpZGVDb3VudCAtXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50KTsgaSAtPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlSW5kZXggPSBpIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucHJlcGVuZFRvKF8uJHNsaWRlVHJhY2spLmFkZENsYXNzKCdzbGljay1jbG9uZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGluZmluaXRlQ291bnQgICsgXy5zbGlkZUNvdW50OyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICQoXy4kc2xpZGVzW3NsaWRlSW5kZXhdKS5jbG9uZSh0cnVlKS5hdHRyKCdpZCcsICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnLCBzbGlkZUluZGV4ICsgXy5zbGlkZUNvdW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spLmFkZENsYXNzKCdzbGljay1jbG9uZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stY2xvbmVkJykuZmluZCgnW2lkXScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYXR0cignaWQnLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmludGVycnVwdCA9IGZ1bmN0aW9uKCB0b2dnbGUgKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmKCAhdG9nZ2xlICkge1xuICAgICAgICAgICAgXy5hdXRvUGxheSgpO1xuICAgICAgICB9XG4gICAgICAgIF8uaW50ZXJydXB0ZWQgPSB0b2dnbGU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNlbGVjdEhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICB2YXIgdGFyZ2V0RWxlbWVudCA9XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuaXMoJy5zbGljay1zbGlkZScpID9cbiAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkgOlxuICAgICAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5wYXJlbnRzKCcuc2xpY2stc2xpZGUnKTtcblxuICAgICAgICB2YXIgaW5kZXggPSBwYXJzZUludCh0YXJnZXRFbGVtZW50LmF0dHIoJ2RhdGEtc2xpY2staW5kZXgnKSk7XG5cbiAgICAgICAgaWYgKCFpbmRleCkgaW5kZXggPSAwO1xuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihpbmRleCwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIH1cblxuICAgICAgICBfLnNsaWRlSGFuZGxlcihpbmRleCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNsaWRlSGFuZGxlciA9IGZ1bmN0aW9uKGluZGV4LCBzeW5jLCBkb250QW5pbWF0ZSkge1xuXG4gICAgICAgIHZhciB0YXJnZXRTbGlkZSwgYW5pbVNsaWRlLCBvbGRTbGlkZSwgc2xpZGVMZWZ0LCB0YXJnZXRMZWZ0ID0gbnVsbCxcbiAgICAgICAgICAgIF8gPSB0aGlzLCBuYXZUYXJnZXQ7XG5cbiAgICAgICAgc3luYyA9IHN5bmMgfHwgZmFsc2U7XG5cbiAgICAgICAgaWYgKF8uYW5pbWF0aW5nID09PSB0cnVlICYmIF8ub3B0aW9ucy53YWl0Rm9yQW5pbWF0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlICYmIF8uY3VycmVudFNsaWRlID09PSBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN5bmMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLmFzTmF2Rm9yKGluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldFNsaWRlID0gaW5kZXg7XG4gICAgICAgIHRhcmdldExlZnQgPSBfLmdldExlZnQodGFyZ2V0U2xpZGUpO1xuICAgICAgICBzbGlkZUxlZnQgPSBfLmdldExlZnQoXy5jdXJyZW50U2xpZGUpO1xuXG4gICAgICAgIF8uY3VycmVudExlZnQgPSBfLnN3aXBlTGVmdCA9PT0gbnVsbCA/IHNsaWRlTGVmdCA6IF8uc3dpcGVMZWZ0O1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSBmYWxzZSAmJiAoaW5kZXggPCAwIHx8IGluZGV4ID4gXy5nZXREb3RDb3VudCgpICogXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFNsaWRlID0gXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hbmltYXRlU2xpZGUoc2xpZGVMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlICYmIChpbmRleCA8IDAgfHwgaW5kZXggPiAoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSkpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuICAgICAgICAgICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIF8uYW5pbWF0ZVNsaWRlKHNsaWRlTGVmdCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIF8ub3B0aW9ucy5hdXRvcGxheSApIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoXy5hdXRvUGxheVRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXJnZXRTbGlkZSA8IDApIHtcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApIHtcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSBfLnNsaWRlQ291bnQgLSAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gXy5zbGlkZUNvdW50ICsgdGFyZ2V0U2xpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0U2xpZGUgPj0gXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYW5pbVNsaWRlID0gdGFyZ2V0U2xpZGUgLSBfLnNsaWRlQ291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbmltU2xpZGUgPSB0YXJnZXRTbGlkZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uYW5pbWF0aW5nID0gdHJ1ZTtcblxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignYmVmb3JlQ2hhbmdlJywgW18sIF8uY3VycmVudFNsaWRlLCBhbmltU2xpZGVdKTtcblxuICAgICAgICBvbGRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuICAgICAgICBfLmN1cnJlbnRTbGlkZSA9IGFuaW1TbGlkZTtcblxuICAgICAgICBfLnNldFNsaWRlQ2xhc3NlcyhfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXNOYXZGb3IgKSB7XG5cbiAgICAgICAgICAgIG5hdlRhcmdldCA9IF8uZ2V0TmF2VGFyZ2V0KCk7XG4gICAgICAgICAgICBuYXZUYXJnZXQgPSBuYXZUYXJnZXQuc2xpY2soJ2dldFNsaWNrJyk7XG5cbiAgICAgICAgICAgIGlmICggbmF2VGFyZ2V0LnNsaWRlQ291bnQgPD0gbmF2VGFyZ2V0Lm9wdGlvbnMuc2xpZGVzVG9TaG93ICkge1xuICAgICAgICAgICAgICAgIG5hdlRhcmdldC5zZXRTbGlkZUNsYXNzZXMoXy5jdXJyZW50U2xpZGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBfLnVwZGF0ZURvdHMoKTtcbiAgICAgICAgXy51cGRhdGVBcnJvd3MoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICAgICAgXy5mYWRlU2xpZGVPdXQob2xkU2xpZGUpO1xuXG4gICAgICAgICAgICAgICAgXy5mYWRlU2xpZGUoYW5pbVNsaWRlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXy5hbmltYXRlSGVpZ2h0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy5hbmltYXRlU2xpZGUodGFyZ2V0TGVmdCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zdGFydExvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cuaGlkZSgpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93LmhpZGUoKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kZG90cy5oaWRlKCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlci5hZGRDbGFzcygnc2xpY2stbG9hZGluZycpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZURpcmVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciB4RGlzdCwgeURpc3QsIHIsIHN3aXBlQW5nbGUsIF8gPSB0aGlzO1xuXG4gICAgICAgIHhEaXN0ID0gXy50b3VjaE9iamVjdC5zdGFydFggLSBfLnRvdWNoT2JqZWN0LmN1clg7XG4gICAgICAgIHlEaXN0ID0gXy50b3VjaE9iamVjdC5zdGFydFkgLSBfLnRvdWNoT2JqZWN0LmN1clk7XG4gICAgICAgIHIgPSBNYXRoLmF0YW4yKHlEaXN0LCB4RGlzdCk7XG5cbiAgICAgICAgc3dpcGVBbmdsZSA9IE1hdGgucm91bmQociAqIDE4MCAvIE1hdGguUEkpO1xuICAgICAgICBpZiAoc3dpcGVBbmdsZSA8IDApIHtcbiAgICAgICAgICAgIHN3aXBlQW5nbGUgPSAzNjAgLSBNYXRoLmFicyhzd2lwZUFuZ2xlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoc3dpcGVBbmdsZSA8PSA0NSkgJiYgKHN3aXBlQW5nbGUgPj0gMCkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAnbGVmdCcgOiAncmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPD0gMzYwKSAmJiAoc3dpcGVBbmdsZSA+PSAzMTUpKSB7XG4gICAgICAgICAgICByZXR1cm4gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gJ2xlZnQnIDogJ3JpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChzd2lwZUFuZ2xlID49IDEzNSkgJiYgKHN3aXBlQW5nbGUgPD0gMjI1KSkge1xuICAgICAgICAgICAgcmV0dXJuIChfLm9wdGlvbnMucnRsID09PSBmYWxzZSA/ICdyaWdodCcgOiAnbGVmdCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPj0gMzUpICYmIChzd2lwZUFuZ2xlIDw9IDEzNSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Rvd24nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3VwJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAndmVydGljYWwnO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZUVuZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgc2xpZGVDb3VudCxcbiAgICAgICAgICAgIGRpcmVjdGlvbjtcblxuICAgICAgICBfLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgIF8uc3dpcGluZyA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChfLnNjcm9sbGluZykge1xuICAgICAgICAgICAgXy5zY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uaW50ZXJydXB0ZWQgPSBmYWxzZTtcbiAgICAgICAgXy5zaG91bGRDbGljayA9ICggXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA+IDEwICkgPyBmYWxzZSA6IHRydWU7XG5cbiAgICAgICAgaWYgKCBfLnRvdWNoT2JqZWN0LmN1clggPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggXy50b3VjaE9iamVjdC5lZGdlSGl0ID09PSB0cnVlICkge1xuICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2VkZ2UnLCBbXywgXy5zd2lwZURpcmVjdGlvbigpIF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID49IF8udG91Y2hPYmplY3QubWluU3dpcGUgKSB7XG5cbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IF8uc3dpcGVEaXJlY3Rpb24oKTtcblxuICAgICAgICAgICAgc3dpdGNoICggZGlyZWN0aW9uICkge1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZG93bic6XG5cbiAgICAgICAgICAgICAgICAgICAgc2xpZGVDb3VudCA9XG4gICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmNoZWNrTmF2aWdhYmxlKCBfLmN1cnJlbnRTbGlkZSArIF8uZ2V0U2xpZGVDb3VudCgpICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlICsgXy5nZXRTbGlkZUNvdW50KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50RGlyZWN0aW9uID0gMDtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICBjYXNlICd1cCc6XG5cbiAgICAgICAgICAgICAgICAgICAgc2xpZGVDb3VudCA9XG4gICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMuc3dpcGVUb1NsaWRlID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmNoZWNrTmF2aWdhYmxlKCBfLmN1cnJlbnRTbGlkZSAtIF8uZ2V0U2xpZGVDb3VudCgpICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlIC0gXy5nZXRTbGlkZUNvdW50KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50RGlyZWN0aW9uID0gMTtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG5cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiggZGlyZWN0aW9uICE9ICd2ZXJ0aWNhbCcgKSB7XG5cbiAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlciggc2xpZGVDb3VudCApO1xuICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcbiAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignc3dpcGUnLCBbXywgZGlyZWN0aW9uIF0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgaWYgKCBfLnRvdWNoT2JqZWN0LnN0YXJ0WCAhPT0gXy50b3VjaE9iamVjdC5jdXJYICkge1xuXG4gICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoIF8uY3VycmVudFNsaWRlICk7XG4gICAgICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zd2lwZUhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoKF8ub3B0aW9ucy5zd2lwZSA9PT0gZmFsc2UpIHx8ICgnb250b3VjaGVuZCcgaW4gZG9jdW1lbnQgJiYgXy5vcHRpb25zLnN3aXBlID09PSBmYWxzZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuZHJhZ2dhYmxlID09PSBmYWxzZSAmJiBldmVudC50eXBlLmluZGV4T2YoJ21vdXNlJykgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBfLnRvdWNoT2JqZWN0LmZpbmdlckNvdW50ID0gZXZlbnQub3JpZ2luYWxFdmVudCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgICBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMubGVuZ3RoIDogMTtcblxuICAgICAgICBfLnRvdWNoT2JqZWN0Lm1pblN3aXBlID0gXy5saXN0V2lkdGggLyBfLm9wdGlvbnNcbiAgICAgICAgICAgIC50b3VjaFRocmVzaG9sZDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy50b3VjaE9iamVjdC5taW5Td2lwZSA9IF8ubGlzdEhlaWdodCAvIF8ub3B0aW9uc1xuICAgICAgICAgICAgICAgIC50b3VjaFRocmVzaG9sZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoZXZlbnQuZGF0YS5hY3Rpb24pIHtcblxuICAgICAgICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgICAgICAgICAgIF8uc3dpcGVTdGFydChldmVudCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ21vdmUnOlxuICAgICAgICAgICAgICAgIF8uc3dpcGVNb3ZlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgICAgICAgICBfLnN3aXBlRW5kKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlTW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgZWRnZVdhc0hpdCA9IGZhbHNlLFxuICAgICAgICAgICAgY3VyTGVmdCwgc3dpcGVEaXJlY3Rpb24sIHN3aXBlTGVuZ3RoLCBwb3NpdGlvbk9mZnNldCwgdG91Y2hlcywgdmVydGljYWxTd2lwZUxlbmd0aDtcblxuICAgICAgICB0b3VjaGVzID0gZXZlbnQub3JpZ2luYWxFdmVudCAhPT0gdW5kZWZpbmVkID8gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzIDogbnVsbDtcblxuICAgICAgICBpZiAoIV8uZHJhZ2dpbmcgfHwgXy5zY3JvbGxpbmcgfHwgdG91Y2hlcyAmJiB0b3VjaGVzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VyTGVmdCA9IF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5jdXJYID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlc1swXS5wYWdlWCA6IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIF8udG91Y2hPYmplY3QuY3VyWSA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXNbMF0ucGFnZVkgOiBldmVudC5jbGllbnRZO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPSBNYXRoLnJvdW5kKE1hdGguc3FydChcbiAgICAgICAgICAgIE1hdGgucG93KF8udG91Y2hPYmplY3QuY3VyWCAtIF8udG91Y2hPYmplY3Quc3RhcnRYLCAyKSkpO1xuXG4gICAgICAgIHZlcnRpY2FsU3dpcGVMZW5ndGggPSBNYXRoLnJvdW5kKE1hdGguc3FydChcbiAgICAgICAgICAgIE1hdGgucG93KF8udG91Y2hPYmplY3QuY3VyWSAtIF8udG91Y2hPYmplY3Quc3RhcnRZLCAyKSkpO1xuXG4gICAgICAgIGlmICghXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyAmJiAhXy5zd2lwaW5nICYmIHZlcnRpY2FsU3dpcGVMZW5ndGggPiA0KSB7XG4gICAgICAgICAgICBfLnNjcm9sbGluZyA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA9IHZlcnRpY2FsU3dpcGVMZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZURpcmVjdGlvbiA9IF8uc3dpcGVEaXJlY3Rpb24oKTtcblxuICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAhPT0gdW5kZWZpbmVkICYmIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPiA0KSB7XG4gICAgICAgICAgICBfLnN3aXBpbmcgPSB0cnVlO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc2l0aW9uT2Zmc2V0ID0gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gMSA6IC0xKSAqIChfLnRvdWNoT2JqZWN0LmN1clggPiBfLnRvdWNoT2JqZWN0LnN0YXJ0WCA/IDEgOiAtMSk7XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwb3NpdGlvbk9mZnNldCA9IF8udG91Y2hPYmplY3QuY3VyWSA+IF8udG91Y2hPYmplY3Quc3RhcnRZID8gMSA6IC0xO1xuICAgICAgICB9XG5cblxuICAgICAgICBzd2lwZUxlbmd0aCA9IF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGg7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5lZGdlSGl0ID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmICgoXy5jdXJyZW50U2xpZGUgPT09IDAgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdyaWdodCcpIHx8IChfLmN1cnJlbnRTbGlkZSA+PSBfLmdldERvdENvdW50KCkgJiYgc3dpcGVEaXJlY3Rpb24gPT09ICdsZWZ0JykpIHtcbiAgICAgICAgICAgICAgICBzd2lwZUxlbmd0aCA9IF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggKiBfLm9wdGlvbnMuZWRnZUZyaWN0aW9uO1xuICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QuZWRnZUhpdCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBjdXJMZWZ0ICsgc3dpcGVMZW5ndGggKiBwb3NpdGlvbk9mZnNldDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gY3VyTGVmdCArIChzd2lwZUxlbmd0aCAqIChfLiRsaXN0LmhlaWdodCgpIC8gXy5saXN0V2lkdGgpKSAqIHBvc2l0aW9uT2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IGN1ckxlZnQgKyBzd2lwZUxlbmd0aCAqIHBvc2l0aW9uT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlIHx8IF8ub3B0aW9ucy50b3VjaE1vdmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5hbmltYXRpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uc2V0Q1NTKF8uc3dpcGVMZWZ0KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVTdGFydCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdG91Y2hlcztcblxuICAgICAgICBfLmludGVycnVwdGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoXy50b3VjaE9iamVjdC5maW5nZXJDb3VudCAhPT0gMSB8fCBfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdG91Y2hlcyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udG91Y2hPYmplY3Quc3RhcnRYID0gXy50b3VjaE9iamVjdC5jdXJYID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlcy5wYWdlWCA6IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIF8udG91Y2hPYmplY3Quc3RhcnRZID0gXy50b3VjaE9iamVjdC5jdXJZID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlcy5wYWdlWSA6IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgXy5kcmFnZ2luZyA9IHRydWU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVuZmlsdGVyU2xpZGVzID0gU2xpY2sucHJvdG90eXBlLnNsaWNrVW5maWx0ZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uJHNsaWRlc0NhY2hlICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG5cbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgJCgnLnNsaWNrLWNsb25lZCcsIF8uJHNsaWRlcikucmVtb3ZlKCk7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMpIHtcbiAgICAgICAgICAgIF8uJGRvdHMucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy4kcHJldkFycm93ICYmIF8uaHRtbEV4cHIudGVzdChfLm9wdGlvbnMucHJldkFycm93KSkge1xuICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uJG5leHRBcnJvdyAmJiBfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLm5leHRBcnJvdykpIHtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlc1xuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdzbGljay1zbGlkZSBzbGljay1hY3RpdmUgc2xpY2stdmlzaWJsZSBzbGljay1jdXJyZW50JylcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgJycpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bnNsaWNrID0gZnVuY3Rpb24oZnJvbUJyZWFrcG9pbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCd1bnNsaWNrJywgW18sIGZyb21CcmVha3BvaW50XSk7XG4gICAgICAgIF8uZGVzdHJveSgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51cGRhdGVBcnJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBjZW50ZXJPZmZzZXQ7XG5cbiAgICAgICAgY2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMik7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmXG4gICAgICAgICAgICBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmXG4gICAgICAgICAgICAhXy5vcHRpb25zLmluZmluaXRlICkge1xuXG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID09PSAwKSB7XG5cbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJykuYXR0cignYXJpYS1kaXNhYmxlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAnZmFsc2UnKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXy5jdXJyZW50U2xpZGUgPj0gXy5zbGlkZUNvdW50IC0gMSAmJiBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuXG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LmFkZENsYXNzKCdzbGljay1kaXNhYmxlZCcpLmF0dHIoJ2FyaWEtZGlzYWJsZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmVDbGFzcygnc2xpY2stZGlzYWJsZWQnKS5hdHRyKCdhcmlhLWRpc2FibGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVwZGF0ZURvdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgXy4kZG90c1xuICAgICAgICAgICAgICAgIC5maW5kKCdsaScpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgLmVuZCgpO1xuXG4gICAgICAgICAgICBfLiRkb3RzXG4gICAgICAgICAgICAgICAgLmZpbmQoJ2xpJylcbiAgICAgICAgICAgICAgICAuZXEoTWF0aC5mbG9vcihfLmN1cnJlbnRTbGlkZSAvIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnZpc2liaWxpdHkgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCBfLm9wdGlvbnMuYXV0b3BsYXkgKSB7XG5cbiAgICAgICAgICAgIGlmICggZG9jdW1lbnRbXy5oaWRkZW5dICkge1xuXG4gICAgICAgICAgICAgICAgXy5pbnRlcnJ1cHRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBfLmludGVycnVwdGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgJC5mbi5zbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBvcHQgPSBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgICAgIGwgPSBfLmxlbmd0aCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICByZXQ7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0ID09ICdvYmplY3QnIHx8IHR5cGVvZiBvcHQgPT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICAgICAgX1tpXS5zbGljayA9IG5ldyBTbGljayhfW2ldLCBvcHQpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldCA9IF9baV0uc2xpY2tbb3B0XS5hcHBseShfW2ldLnNsaWNrLCBhcmdzKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmV0ICE9ICd1bmRlZmluZWQnKSByZXR1cm4gcmV0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfO1xuICAgIH07XG5cbn0pKTtcbiJdfQ==
