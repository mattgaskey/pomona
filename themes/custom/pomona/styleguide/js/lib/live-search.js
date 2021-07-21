'use strict';

/*
Live list searching script
Filters a list in real time based on a simple text search.
Requires jQuery.

To use:
Include an <input> box with the class '.live-search-box' and
a list (ordered or unordered) with the class '.live-search-list'

Initialize with:
liveSearch.init();

Derived from a tutorial found at
https://www.html5andbeyond.com/live-search-a-html-list-using-jquery-no-plugin-needed/
*/
var liveSearch = {};

liveSearch.init = function init() {
    $('.live-search-list li').each(function () {
        $(this).attr('data-search-term', $(this).text().toLowerCase());
    });

    $('.live-search-box').on('keyup', function () {

        var searchTerm = $(this).val().toLowerCase();

        $('.live-search-list li').each(function () {

            if ($(this).filter('[data-search-term *= ' + searchTerm + ']').length > 0 || searchTerm.length < 1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    return "Live Search Initialized";
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9saXZlLXNlYXJjaC5qcyJdLCJuYW1lcyI6WyJsaXZlU2VhcmNoIiwiaW5pdCIsIiQiLCJlYWNoIiwiYXR0ciIsInRleHQiLCJ0b0xvd2VyQ2FzZSIsIm9uIiwic2VhcmNoVGVybSIsInZhbCIsImZpbHRlciIsImxlbmd0aCIsInNob3ciLCJoaWRlIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7QUFlQSxJQUFJQSxhQUFhLEVBQWpCOztBQUVBQSxXQUFXQyxJQUFYLEdBQWtCLFNBQVNBLElBQVQsR0FBZ0I7QUFDOUJDLE1BQUUsc0JBQUYsRUFBMEJDLElBQTFCLENBQStCLFlBQVk7QUFDdkNELFVBQUUsSUFBRixFQUFRRSxJQUFSLENBQWEsa0JBQWIsRUFBaUNGLEVBQUUsSUFBRixFQUFRRyxJQUFSLEdBQWVDLFdBQWYsRUFBakM7QUFDSCxLQUZEOztBQUlBSixNQUFFLGtCQUFGLEVBQXNCSyxFQUF0QixDQUF5QixPQUF6QixFQUFrQyxZQUFZOztBQUUxQyxZQUFJQyxhQUFhTixFQUFFLElBQUYsRUFBUU8sR0FBUixHQUFjSCxXQUFkLEVBQWpCOztBQUVBSixVQUFFLHNCQUFGLEVBQTBCQyxJQUExQixDQUErQixZQUFZOztBQUV2QyxnQkFBSUQsRUFBRSxJQUFGLEVBQVFRLE1BQVIsQ0FBZSwwQkFBMEJGLFVBQTFCLEdBQXVDLEdBQXRELEVBQTJERyxNQUEzRCxHQUFvRSxDQUFwRSxJQUF5RUgsV0FBV0csTUFBWCxHQUFvQixDQUFqRyxFQUFvRztBQUNoR1Qsa0JBQUUsSUFBRixFQUFRVSxJQUFSO0FBQ0gsYUFGRCxNQUVPO0FBQ0hWLGtCQUFFLElBQUYsRUFBUVcsSUFBUjtBQUNIO0FBRUosU0FSRDtBQVNILEtBYkQ7O0FBZUEsV0FBTyx5QkFBUDtBQUVILENBdEJEIiwiZmlsZSI6ImxpYi9saXZlLXNlYXJjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5MaXZlIGxpc3Qgc2VhcmNoaW5nIHNjcmlwdFxuRmlsdGVycyBhIGxpc3QgaW4gcmVhbCB0aW1lIGJhc2VkIG9uIGEgc2ltcGxlIHRleHQgc2VhcmNoLlxuUmVxdWlyZXMgalF1ZXJ5LlxuXG5UbyB1c2U6XG5JbmNsdWRlIGFuIDxpbnB1dD4gYm94IHdpdGggdGhlIGNsYXNzICcubGl2ZS1zZWFyY2gtYm94JyBhbmRcbmEgbGlzdCAob3JkZXJlZCBvciB1bm9yZGVyZWQpIHdpdGggdGhlIGNsYXNzICcubGl2ZS1zZWFyY2gtbGlzdCdcblxuSW5pdGlhbGl6ZSB3aXRoOlxubGl2ZVNlYXJjaC5pbml0KCk7XG5cbkRlcml2ZWQgZnJvbSBhIHR1dG9yaWFsIGZvdW5kIGF0XG5odHRwczovL3d3dy5odG1sNWFuZGJleW9uZC5jb20vbGl2ZS1zZWFyY2gtYS1odG1sLWxpc3QtdXNpbmctanF1ZXJ5LW5vLXBsdWdpbi1uZWVkZWQvXG4qL1xudmFyIGxpdmVTZWFyY2ggPSB7fTtcblxubGl2ZVNlYXJjaC5pbml0ID0gZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAkKCcubGl2ZS1zZWFyY2gtbGlzdCBsaScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLmF0dHIoJ2RhdGEtc2VhcmNoLXRlcm0nLCAkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpKTtcbiAgICB9KTtcblxuICAgICQoJy5saXZlLXNlYXJjaC1ib3gnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIHNlYXJjaFRlcm0gPSAkKHRoaXMpLnZhbCgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgJCgnLmxpdmUtc2VhcmNoLWxpc3QgbGknKS5lYWNoKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKCQodGhpcykuZmlsdGVyKCdbZGF0YS1zZWFyY2gtdGVybSAqPSAnICsgc2VhcmNoVGVybSArICddJykubGVuZ3RoID4gMCB8fCBzZWFyY2hUZXJtLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnNob3coKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5oaWRlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gICAgcmV0dXJuIFwiTGl2ZSBTZWFyY2ggSW5pdGlhbGl6ZWRcIjtcbiAgICBcbn07Il19
