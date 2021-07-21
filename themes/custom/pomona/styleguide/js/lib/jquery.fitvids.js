'use strict';

/*global jQuery */
/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/

(function ($) {

  "use strict";

  $.fn.fitVids = function (options) {
    var settings = {
      customSelector: null
    };

    if (!document.getElementById('fit-vids-style')) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName('head')[0];
      var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      var div = document.createElement('div');
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    if (options) {
      $.extend(settings, options);
    }

    return this.each(function () {
      var selectors = ["iframe[src*='player.vimeo.com']", "iframe[src*='youtube.com']", "iframe[src*='youtube-nocookie.com']", "iframe[src*='kickstarter.com'][src*='video.html']", "object", "embed"];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not("object object"); // SwfObj conflict patch

      $allVideos.each(function () {
        var $this = $(this);
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) {
          return;
        }
        var height = this.tagName.toLowerCase() === 'object' || $this.attr('height') && !isNaN(parseInt($this.attr('height'), 10)) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if (!$this.attr('id')) {
          var videoID = 'fitvid' + Math.floor(Math.random() * 999999);
          $this.attr('id', videoID);
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', aspectRatio * 100 + "%");
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
  // Works with either jQuery or Zepto
})(window.jQuery || window.Zepto);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qcXVlcnkuZml0dmlkcy5qcyJdLCJuYW1lcyI6WyIkIiwiZm4iLCJmaXRWaWRzIiwib3B0aW9ucyIsInNldHRpbmdzIiwiY3VzdG9tU2VsZWN0b3IiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiaGVhZCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiY3NzIiwiZGl2IiwiY3JlYXRlRWxlbWVudCIsImlubmVySFRNTCIsImFwcGVuZENoaWxkIiwiY2hpbGROb2RlcyIsImV4dGVuZCIsImVhY2giLCJzZWxlY3RvcnMiLCJwdXNoIiwiJGFsbFZpZGVvcyIsImZpbmQiLCJqb2luIiwibm90IiwiJHRoaXMiLCJ0YWdOYW1lIiwidG9Mb3dlckNhc2UiLCJwYXJlbnQiLCJsZW5ndGgiLCJoZWlnaHQiLCJhdHRyIiwiaXNOYU4iLCJwYXJzZUludCIsIndpZHRoIiwiYXNwZWN0UmF0aW8iLCJ2aWRlb0lEIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwid3JhcCIsInJlbW92ZUF0dHIiLCJ3aW5kb3ciLCJqUXVlcnkiLCJaZXB0byJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQVNBLENBQUMsVUFBVUEsQ0FBVixFQUFhOztBQUVaOztBQUVBQSxJQUFFQyxFQUFGLENBQUtDLE9BQUwsR0FBZSxVQUFVQyxPQUFWLEVBQW9CO0FBQ2pDLFFBQUlDLFdBQVc7QUFDYkMsc0JBQWdCO0FBREgsS0FBZjs7QUFJQSxRQUFHLENBQUNDLFNBQVNDLGNBQVQsQ0FBd0IsZ0JBQXhCLENBQUosRUFBK0M7QUFDN0M7QUFDQSxVQUFJQyxPQUFPRixTQUFTRSxJQUFULElBQWlCRixTQUFTRyxvQkFBVCxDQUE4QixNQUE5QixFQUFzQyxDQUF0QyxDQUE1QjtBQUNBLFVBQUlDLE1BQU0sa09BQVY7QUFDQSxVQUFJQyxNQUFNTCxTQUFTTSxhQUFULENBQXVCLEtBQXZCLENBQVY7QUFDQUQsVUFBSUUsU0FBSixHQUFnQix3Q0FBd0NILEdBQXhDLEdBQThDLFVBQTlEO0FBQ0FGLFdBQUtNLFdBQUwsQ0FBaUJILElBQUlJLFVBQUosQ0FBZSxDQUFmLENBQWpCO0FBQ0Q7O0FBRUQsUUFBS1osT0FBTCxFQUFlO0FBQ2JILFFBQUVnQixNQUFGLENBQVVaLFFBQVYsRUFBb0JELE9BQXBCO0FBQ0Q7O0FBRUQsV0FBTyxLQUFLYyxJQUFMLENBQVUsWUFBVTtBQUN6QixVQUFJQyxZQUFZLENBQ2QsaUNBRGMsRUFFZCw0QkFGYyxFQUdkLHFDQUhjLEVBSWQsbURBSmMsRUFLZCxRQUxjLEVBTWQsT0FOYyxDQUFoQjs7QUFTQSxVQUFJZCxTQUFTQyxjQUFiLEVBQTZCO0FBQzNCYSxrQkFBVUMsSUFBVixDQUFlZixTQUFTQyxjQUF4QjtBQUNEOztBQUVELFVBQUllLGFBQWFwQixFQUFFLElBQUYsRUFBUXFCLElBQVIsQ0FBYUgsVUFBVUksSUFBVixDQUFlLEdBQWYsQ0FBYixDQUFqQjtBQUNBRixtQkFBYUEsV0FBV0csR0FBWCxDQUFlLGVBQWYsQ0FBYixDQWZ5QixDQWVxQjs7QUFFOUNILGlCQUFXSCxJQUFYLENBQWdCLFlBQVU7QUFDeEIsWUFBSU8sUUFBUXhCLEVBQUUsSUFBRixDQUFaO0FBQ0EsWUFBSSxLQUFLeUIsT0FBTCxDQUFhQyxXQUFiLE9BQStCLE9BQS9CLElBQTBDRixNQUFNRyxNQUFOLENBQWEsUUFBYixFQUF1QkMsTUFBakUsSUFBMkVKLE1BQU1HLE1BQU4sQ0FBYSw0QkFBYixFQUEyQ0MsTUFBMUgsRUFBa0k7QUFBRTtBQUFTO0FBQzdJLFlBQUlDLFNBQVcsS0FBS0osT0FBTCxDQUFhQyxXQUFiLE9BQStCLFFBQS9CLElBQTRDRixNQUFNTSxJQUFOLENBQVcsUUFBWCxLQUF3QixDQUFDQyxNQUFNQyxTQUFTUixNQUFNTSxJQUFOLENBQVcsUUFBWCxDQUFULEVBQStCLEVBQS9CLENBQU4sQ0FBdkUsR0FBc0hFLFNBQVNSLE1BQU1NLElBQU4sQ0FBVyxRQUFYLENBQVQsRUFBK0IsRUFBL0IsQ0FBdEgsR0FBMkpOLE1BQU1LLE1BQU4sRUFBeEs7QUFBQSxZQUNJSSxRQUFRLENBQUNGLE1BQU1DLFNBQVNSLE1BQU1NLElBQU4sQ0FBVyxPQUFYLENBQVQsRUFBOEIsRUFBOUIsQ0FBTixDQUFELEdBQTRDRSxTQUFTUixNQUFNTSxJQUFOLENBQVcsT0FBWCxDQUFULEVBQThCLEVBQTlCLENBQTVDLEdBQWdGTixNQUFNUyxLQUFOLEVBRDVGO0FBQUEsWUFFSUMsY0FBY0wsU0FBU0ksS0FGM0I7QUFHQSxZQUFHLENBQUNULE1BQU1NLElBQU4sQ0FBVyxJQUFYLENBQUosRUFBcUI7QUFDbkIsY0FBSUssVUFBVSxXQUFXQyxLQUFLQyxLQUFMLENBQVdELEtBQUtFLE1BQUwsS0FBYyxNQUF6QixDQUF6QjtBQUNBZCxnQkFBTU0sSUFBTixDQUFXLElBQVgsRUFBaUJLLE9BQWpCO0FBQ0Q7QUFDRFgsY0FBTWUsSUFBTixDQUFXLCtDQUFYLEVBQTREWixNQUE1RCxDQUFtRSw0QkFBbkUsRUFBaUdqQixHQUFqRyxDQUFxRyxhQUFyRyxFQUFxSHdCLGNBQWMsR0FBZixHQUFvQixHQUF4STtBQUNBVixjQUFNZ0IsVUFBTixDQUFpQixRQUFqQixFQUEyQkEsVUFBM0IsQ0FBc0MsT0FBdEM7QUFDRCxPQVpEO0FBYUQsS0E5Qk0sQ0FBUDtBQStCRCxHQWpERDtBQWtERjtBQUNDLENBdkRELEVBdURJQyxPQUFPQyxNQUFQLElBQWlCRCxPQUFPRSxLQXZENUIiLCJmaWxlIjoibGliL2pxdWVyeS5maXR2aWRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypnbG9iYWwgalF1ZXJ5ICovXG4vKmpzaGludCBicm93c2VyOnRydWUgKi9cbi8qIVxuKiBGaXRWaWRzIDEuMVxuKlxuKiBDb3B5cmlnaHQgMjAxMywgQ2hyaXMgQ295aWVyIC0gaHR0cDovL2Nzcy10cmlja3MuY29tICsgRGF2ZSBSdXBlcnQgLSBodHRwOi8vZGF2ZXJ1cGVydC5jb21cbiogQ3JlZGl0IHRvIFRoaWVycnkgS29ibGVudHogLSBodHRwOi8vd3d3LmFsaXN0YXBhcnQuY29tL2FydGljbGVzL2NyZWF0aW5nLWludHJpbnNpYy1yYXRpb3MtZm9yLXZpZGVvL1xuKiBSZWxlYXNlZCB1bmRlciB0aGUgV1RGUEwgbGljZW5zZSAtIGh0dHA6Ly9zYW0uem95Lm9yZy93dGZwbC9cbipcbiovXG5cbihmdW5jdGlvbiggJCApe1xuXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gICQuZm4uZml0VmlkcyA9IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuICAgIHZhciBzZXR0aW5ncyA9IHtcbiAgICAgIGN1c3RvbVNlbGVjdG9yOiBudWxsXG4gICAgfTtcblxuICAgIGlmKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZml0LXZpZHMtc3R5bGUnKSkge1xuICAgICAgLy8gYXBwZW5kU3R5bGVzOiBodHRwczovL2dpdGh1Yi5jb20vdG9kZG1vdHRvL2ZsdWlkdmlkcy9ibG9iL21hc3Rlci9kaXN0L2ZsdWlkdmlkcy5qc1xuICAgICAgdmFyIGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICB2YXIgY3NzID0gJy5mbHVpZC13aWR0aC12aWRlby13cmFwcGVye3dpZHRoOjEwMCU7cG9zaXRpb246cmVsYXRpdmU7cGFkZGluZzowO30uZmx1aWQtd2lkdGgtdmlkZW8td3JhcHBlciBpZnJhbWUsLmZsdWlkLXdpZHRoLXZpZGVvLXdyYXBwZXIgb2JqZWN0LC5mbHVpZC13aWR0aC12aWRlby13cmFwcGVyIGVtYmVkIHtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0OjA7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTt9JztcbiAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSAnPHA+eDwvcD48c3R5bGUgaWQ9XCJmaXQtdmlkcy1zdHlsZVwiPicgKyBjc3MgKyAnPC9zdHlsZT4nO1xuICAgICAgaGVhZC5hcHBlbmRDaGlsZChkaXYuY2hpbGROb2Rlc1sxXSk7XG4gICAgfVxuXG4gICAgaWYgKCBvcHRpb25zICkge1xuICAgICAgJC5leHRlbmQoIHNldHRpbmdzLCBvcHRpb25zICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyIHNlbGVjdG9ycyA9IFtcbiAgICAgICAgXCJpZnJhbWVbc3JjKj0ncGxheWVyLnZpbWVvLmNvbSddXCIsXG4gICAgICAgIFwiaWZyYW1lW3NyYyo9J3lvdXR1YmUuY29tJ11cIixcbiAgICAgICAgXCJpZnJhbWVbc3JjKj0neW91dHViZS1ub2Nvb2tpZS5jb20nXVwiLFxuICAgICAgICBcImlmcmFtZVtzcmMqPSdraWNrc3RhcnRlci5jb20nXVtzcmMqPSd2aWRlby5odG1sJ11cIixcbiAgICAgICAgXCJvYmplY3RcIixcbiAgICAgICAgXCJlbWJlZFwiXG4gICAgICBdO1xuXG4gICAgICBpZiAoc2V0dGluZ3MuY3VzdG9tU2VsZWN0b3IpIHtcbiAgICAgICAgc2VsZWN0b3JzLnB1c2goc2V0dGluZ3MuY3VzdG9tU2VsZWN0b3IpO1xuICAgICAgfVxuXG4gICAgICB2YXIgJGFsbFZpZGVvcyA9ICQodGhpcykuZmluZChzZWxlY3RvcnMuam9pbignLCcpKTtcbiAgICAgICRhbGxWaWRlb3MgPSAkYWxsVmlkZW9zLm5vdChcIm9iamVjdCBvYmplY3RcIik7IC8vIFN3Zk9iaiBjb25mbGljdCBwYXRjaFxuXG4gICAgICAkYWxsVmlkZW9zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgaWYgKHRoaXMudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnZW1iZWQnICYmICR0aGlzLnBhcmVudCgnb2JqZWN0JykubGVuZ3RoIHx8ICR0aGlzLnBhcmVudCgnLmZsdWlkLXdpZHRoLXZpZGVvLXdyYXBwZXInKS5sZW5ndGgpIHsgcmV0dXJuOyB9XG4gICAgICAgIHZhciBoZWlnaHQgPSAoIHRoaXMudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnb2JqZWN0JyB8fCAoJHRoaXMuYXR0cignaGVpZ2h0JykgJiYgIWlzTmFOKHBhcnNlSW50KCR0aGlzLmF0dHIoJ2hlaWdodCcpLCAxMCkpKSApID8gcGFyc2VJbnQoJHRoaXMuYXR0cignaGVpZ2h0JyksIDEwKSA6ICR0aGlzLmhlaWdodCgpLFxuICAgICAgICAgICAgd2lkdGggPSAhaXNOYU4ocGFyc2VJbnQoJHRoaXMuYXR0cignd2lkdGgnKSwgMTApKSA/IHBhcnNlSW50KCR0aGlzLmF0dHIoJ3dpZHRoJyksIDEwKSA6ICR0aGlzLndpZHRoKCksXG4gICAgICAgICAgICBhc3BlY3RSYXRpbyA9IGhlaWdodCAvIHdpZHRoO1xuICAgICAgICBpZighJHRoaXMuYXR0cignaWQnKSl7XG4gICAgICAgICAgdmFyIHZpZGVvSUQgPSAnZml0dmlkJyArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSo5OTk5OTkpO1xuICAgICAgICAgICR0aGlzLmF0dHIoJ2lkJywgdmlkZW9JRCk7XG4gICAgICAgIH1cbiAgICAgICAgJHRoaXMud3JhcCgnPGRpdiBjbGFzcz1cImZsdWlkLXdpZHRoLXZpZGVvLXdyYXBwZXJcIj48L2Rpdj4nKS5wYXJlbnQoJy5mbHVpZC13aWR0aC12aWRlby13cmFwcGVyJykuY3NzKCdwYWRkaW5nLXRvcCcsIChhc3BlY3RSYXRpbyAqIDEwMCkrXCIlXCIpO1xuICAgICAgICAkdGhpcy5yZW1vdmVBdHRyKCdoZWlnaHQnKS5yZW1vdmVBdHRyKCd3aWR0aCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG4vLyBXb3JrcyB3aXRoIGVpdGhlciBqUXVlcnkgb3IgWmVwdG9cbn0pKCB3aW5kb3cualF1ZXJ5IHx8IHdpbmRvdy5aZXB0byApO1xuIl19
