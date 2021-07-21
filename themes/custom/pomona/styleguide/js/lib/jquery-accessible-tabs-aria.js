'use strict';

jQuery(document).ready(function ($) {

  /*
   * jQuery Accessible tab panel system, using ARIA
   * @version v1.6.1
   * Website: https://a11y.nicolas-hoffmann.net/tabs/
   * License MIT: https://github.com/nico3333fr/jquery-accessible-tabs-aria/blob/master/LICENSE
   */
  // Store current URL hash.
  var hash = window.location.hash.replace('#', '');

  /* Tabs ------------------------------------------------------------------------------------------------------------ */
  var $tabs = $('.js-tabs'),
      $body = $('body');

  if ($tabs.length) {
    var $tab_list = $tabs.find('.js-tablist');
    $tab_list.each(function () {
      var $this_tab_list = $(this),
          options = $this_tab_list.data(),
          $tabs_prefix_classes = typeof options.tabsPrefixClass !== 'undefined' ? options.tabsPrefixClass + '-' : '',
          $hx = typeof options.hx !== 'undefined' ? options.hx : '',
          $existing_hx = typeof options.existingHx !== 'undefined' ? options.existingHx : '',
          $this_tab_list_items = $this_tab_list.children('.js-tablist__item'),
          $this_tab_list_links = $this_tab_list.find('.js-tablist__link');

      // roles init
      $this_tab_list.attr('role', 'tablist'); // ul        
      $this_tab_list_items.attr('role', 'presentation'); // li
      $this_tab_list_links.attr('role', 'tab'); // a

      // classes init
      $this_tab_list.addClass($tabs_prefix_classes + 'tabs__list');
      $this_tab_list_items.addClass($tabs_prefix_classes + 'tabs__item');
      $this_tab_list_links.addClass($tabs_prefix_classes + 'tabs__link');

      // controls/tabindex attributes
      $this_tab_list_links.each(function () {
        var $this = $(this),
            $hx_generated_class = typeof options.tabsGeneratedHxClass !== 'undefined' ? options.tabsGeneratedHxClass : 'invisible',
            $href = $this.attr('href'),
            $controls = $($href),
            $text = $this.text();

        if ($hx !== '') {
          $controls.prepend('<' + $hx + ' class="' + $hx_generated_class + '" tabindex="0">' + $text + '</' + $hx + '>');
        }
        if ($existing_hx !== '') {
          $controls.find($existing_hx + ':first-child').attr('tabindex', 0);
        }
        if (typeof $href !== 'undefined' && $href !== '' && $href !== '#') {
          $this.attr({
            'aria-controls': $href.replace('#', ''),
            'tabindex': -1,
            'aria-selected': 'false'
          });
        }

        $this.removeAttr('href');
      });
    });

    /* Tabs content ---------------------------------------------------------------------------------------------------- */
    $('.js-tabcontent').attr({
      'role': 'tabpanel', // contents
      'aria-hidden': 'true' // all hidden
      //"tabindex": 0
    }).each(function () {
      var $this = $(this),
          $this_id = $this.attr('id'),
          $prefix_attribute = $('#label_' + $this_id).closest('.js-tablist').attr('data-tabs-prefix-class'),
          $tabs_prefix_classes = typeof $prefix_attribute !== 'undefined' ? $prefix_attribute + '-' : '';
      // label by link
      $this.attr('aria-labelledby', 'label_' + $this_id);

      $this.addClass($tabs_prefix_classes + 'tabs__content');
    });

    // search if hash is ON not disabled tab
    if (hash !== '' && $('#' + hash + '.js-tabcontent').length !== 0) {
      if ($('#label_' + hash + '.js-tablist__link:not([aria-disabled=\'true\'])').length) {
        // display not disabled
        $('#' + hash + '.js-tabcontent').removeAttr('aria-hidden');
        // selection menu
        $('#label_' + hash + '.js-tablist__link').attr({
          'aria-selected': 'true',
          'tabindex': 0
        });
      }
    }
    // search if hash is IN not disabled tab
    if (hash !== '' && $('#' + hash).parents('.js-tabcontent').length) {
      var $this_hash = $('#' + hash),
          $tab_content_parent = $this_hash.parents('.js-tabcontent'),
          $tab_content_parent_id = $tab_content_parent.attr('id');

      if ($('#label_' + $tab_content_parent_id + '.js-tablist__link:not([aria-disabled=\'true\'])').length) {
        $tab_content_parent.removeAttr('aria-hidden');
        // selection menu
        $('#label_' + $tab_content_parent_id + '.js-tablist__link').attr({
          'aria-selected': 'true',
          'tabindex': 0
        });
      }
    }

    // search if data-selected="1" is on a not disabled tab for each tab system
    $tabs.each(function () {
      var $this = $(this),
          $tab_selected = $this.find('.js-tablist__link[aria-selected="true"]'),
          $tab_data_selected = $this.find('.js-tablist__link[data-selected="1"]:not([aria-disabled="true"]):first'),
          $tab_data_selected_content = $('#' + $tab_data_selected.attr('aria-controls'));

      if ($tab_selected.length === 0 && $tab_data_selected.length !== 0) {
        $tab_data_selected.attr({
          'aria-selected': 'true',
          'tabindex': 0
        });
        $tab_data_selected_content.removeAttr('aria-hidden');
      }
    });

    // if no selected => select first not disabled
    $tabs.each(function () {
      var $this = $(this),
          $tab_selected = $this.find('.js-tablist__link[aria-selected="true"]'),
          $first_link = $this.find('.js-tablist__link:not([aria-disabled="true"]):first'),
          $first_content = $('#' + $first_link.attr('aria-controls'));

      if ($tab_selected.length === 0) {
        $first_link.attr({
          'aria-selected': 'true',
          'tabindex': 0
        });
        $first_content.removeAttr('aria-hidden');
      }
    });

    /* Events ---------------------------------------------------------------------------------------------------------- */
    /* click on a tab link */
    $body.on('click', '.js-tablist__link[aria-disabled=\'true\']', function () {
      return false;
    });
    $body.on('click', '.js-tablist__link:not([aria-disabled=\'true\'])', function (event) {
      var $this = $(this),
          $hash_to_update = $this.attr('aria-controls'),
          $tab_content_linked = $('#' + $this.attr('aria-controls')),
          $parent = $this.closest('.js-tabs'),
          options = $parent.data(),
          tabs_disable_fragments = typeof options.tabsDisableFragment !== 'undefined' ? true : false,
          $all_tab_links = $parent.find('.js-tablist__link'),
          $all_tab_contents = $parent.find('.js-tabcontent');

      // aria selected false on all links
      $all_tab_links.attr({
        'tabindex': -1,
        'aria-selected': 'false'
      });

      // add aria selected on $this
      $this.attr({
        'aria-selected': 'true',
        'tabindex': 0
      });

      // add aria-hidden on all tabs contents
      $all_tab_contents.attr('aria-hidden', 'true');

      // remove aria-hidden on tab linked
      $tab_content_linked.removeAttr('aria-hidden');

      // add fragment (timeout for transitions)
      if (tabs_disable_fragments === false) {
        setTimeout(function () {
          history.pushState(null, null, location.pathname + location.search + '#' + $hash_to_update);
        }, 1000);
      }

      event.preventDefault();
    })
    /* Key down in tabs */
    .on('keydown', '.js-tablist', function (event) {

      var $parent = $(this).closest('.js-tabs'),
          $activated = $parent.find('.js-tablist__link[aria-selected="true"]').parent(),
          $last_link = $parent.find('.js-tablist__item:last-child .js-tablist__link'),
          $first_link = $parent.find('.js-tablist__item:first-child .js-tablist__link'),
          $focus_on_tab_only = false,
          $prev = $activated,
          $next = $activated;

      // search valid previous 
      do {
        // if we are on first => activate last
        if ($prev.is('.js-tablist__item:first-child')) {
          $prev = $last_link.parent();
        }
        // else previous
        else {
            $prev = $prev.prev();
          }
      } while ($prev.children('.js-tablist__link').attr('aria-disabled') === 'true' && $prev !== $activated);

      // search valid next
      do {
        // if we are on last => activate first
        if ($next.is('.js-tablist__item:last-child')) {
          $next = $first_link.parent();
        }
        // else previous
        else {
            $next = $next.next();
          }
      } while ($next.children('.js-tablist__link').attr('aria-disabled') === 'true' && $next !== $activated);

      // some event should be activated only if the focus is on tabs (not on tabpanel)
      if ($(document.activeElement).is($parent.find('.js-tablist__link'))) {
        $focus_on_tab_only = true;
      }

      // catch keyboard event only if focus is on tab
      if ($focus_on_tab_only && !event.ctrlKey) {
        // strike up or left in the tab
        if (event.keyCode == 37 || event.keyCode == 38) {

          $prev.children('.js-tablist__link').click().focus();

          event.preventDefault();
        }
        // strike down or right in the tab
        else if (event.keyCode == 40 || event.keyCode == 39) {

            $next.children('.js-tablist__link').click().focus();

            event.preventDefault();
          } else if (event.keyCode == 36) {
            // activate first tab
            $first_link.click().focus();
            event.preventDefault();
          } else if (event.keyCode == 35) {
            // activate last tab
            $last_link.click().focus();
            event.preventDefault();
          }
      }
    }).on('keydown', '.js-tabcontent', function (event) {

      var $this = $(this),
          $selector_tab_to_focus = $this.attr('aria-labelledby'),
          $tab_to_focus = $('#' + $selector_tab_to_focus),
          $parent_item = $tab_to_focus.parent(),
          $parent_list = $parent_item.parent(),
          $first_item = $parent_list.find('.js-tablist__item:first-child'),
          $last_item = $parent_list.find('.js-tablist__item:last-child'),
          $prev_item = $parent_item,
          $next_item = $parent_item;

      // CTRL up/Left
      if ((event.keyCode == 37 || event.keyCode == 38) && event.ctrlKey) {
        $tab_to_focus.focus();
        event.preventDefault();
      }
      // CTRL PageUp
      if (event.keyCode == 33 && event.ctrlKey) {
        //$tab_to_focus.focus();

        // search valid previous 
        do {
          // if we are on first => last
          if ($prev_item.is('.js-tablist__item:first-child')) {
            $prev_item = $last_item;
          }
          // else previous
          else {
              $prev_item = $prev_item.prev();
            }
        } while ($prev_item.children('.js-tablist__link').attr('aria-disabled') === 'true' && $prev_item !== $parent_item);

        $prev_item.children('.js-tablist__link').click().focus();

        event.preventDefault();
      }
      // CTRL PageDown
      if (event.keyCode == 34 && event.ctrlKey) {
        $tab_to_focus.focus();

        // search valid next 
        do {
          // if we are on last => first
          if ($next_item.is('.js-tablist__item:last-child')) {
            $next_item = $first_item;
          }
          // else previous
          else {
              $next_item = $next_item.next();
            }
        } while ($next_item.children('.js-tablist__link').attr('aria-disabled') === 'true' && $next_item !== $parent_item);

        $next_item.children('.js-tablist__link').click().focus();

        event.preventDefault();
      }
    })
    /* click on a tab link */
    .on('click', '.js-link-to-tab', function () {
      var $this = $(this),
          $tab_to_go = $($this.attr('href')),
          $button_to_click = $('#' + $tab_to_go.attr('aria-labelledby'));

      if ($button_to_click.attr('aria-disabled') !== 'true') {
        // activate tabs
        $button_to_click.click();
        // give focus to the good button
        setTimeout(function () {
          $button_to_click.focus();
        }, 10);
      }
    });
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qcXVlcnktYWNjZXNzaWJsZS10YWJzLWFyaWEuanMiXSwibmFtZXMiOlsialF1ZXJ5IiwiZG9jdW1lbnQiLCJyZWFkeSIsIiQiLCJoYXNoIiwid2luZG93IiwibG9jYXRpb24iLCJyZXBsYWNlIiwiJHRhYnMiLCIkYm9keSIsImxlbmd0aCIsIiR0YWJfbGlzdCIsImZpbmQiLCJlYWNoIiwiJHRoaXNfdGFiX2xpc3QiLCJvcHRpb25zIiwiZGF0YSIsIiR0YWJzX3ByZWZpeF9jbGFzc2VzIiwidGFic1ByZWZpeENsYXNzIiwiJGh4IiwiaHgiLCIkZXhpc3RpbmdfaHgiLCJleGlzdGluZ0h4IiwiJHRoaXNfdGFiX2xpc3RfaXRlbXMiLCJjaGlsZHJlbiIsIiR0aGlzX3RhYl9saXN0X2xpbmtzIiwiYXR0ciIsImFkZENsYXNzIiwiJHRoaXMiLCIkaHhfZ2VuZXJhdGVkX2NsYXNzIiwidGFic0dlbmVyYXRlZEh4Q2xhc3MiLCIkaHJlZiIsIiRjb250cm9scyIsIiR0ZXh0IiwidGV4dCIsInByZXBlbmQiLCJyZW1vdmVBdHRyIiwiJHRoaXNfaWQiLCIkcHJlZml4X2F0dHJpYnV0ZSIsImNsb3Nlc3QiLCJwYXJlbnRzIiwiJHRoaXNfaGFzaCIsIiR0YWJfY29udGVudF9wYXJlbnQiLCIkdGFiX2NvbnRlbnRfcGFyZW50X2lkIiwiJHRhYl9zZWxlY3RlZCIsIiR0YWJfZGF0YV9zZWxlY3RlZCIsIiR0YWJfZGF0YV9zZWxlY3RlZF9jb250ZW50IiwiJGZpcnN0X2xpbmsiLCIkZmlyc3RfY29udGVudCIsIm9uIiwiZXZlbnQiLCIkaGFzaF90b191cGRhdGUiLCIkdGFiX2NvbnRlbnRfbGlua2VkIiwiJHBhcmVudCIsInRhYnNfZGlzYWJsZV9mcmFnbWVudHMiLCJ0YWJzRGlzYWJsZUZyYWdtZW50IiwiJGFsbF90YWJfbGlua3MiLCIkYWxsX3RhYl9jb250ZW50cyIsInNldFRpbWVvdXQiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwicGF0aG5hbWUiLCJzZWFyY2giLCJwcmV2ZW50RGVmYXVsdCIsIiRhY3RpdmF0ZWQiLCJwYXJlbnQiLCIkbGFzdF9saW5rIiwiJGZvY3VzX29uX3RhYl9vbmx5IiwiJHByZXYiLCIkbmV4dCIsImlzIiwicHJldiIsIm5leHQiLCJhY3RpdmVFbGVtZW50IiwiY3RybEtleSIsImtleUNvZGUiLCJjbGljayIsImZvY3VzIiwiJHNlbGVjdG9yX3RhYl90b19mb2N1cyIsIiR0YWJfdG9fZm9jdXMiLCIkcGFyZW50X2l0ZW0iLCIkcGFyZW50X2xpc3QiLCIkZmlyc3RfaXRlbSIsIiRsYXN0X2l0ZW0iLCIkcHJldl9pdGVtIiwiJG5leHRfaXRlbSIsIiR0YWJfdG9fZ28iLCIkYnV0dG9uX3RvX2NsaWNrIl0sIm1hcHBpbmdzIjoiOztBQUFBQSxPQUFPQyxRQUFQLEVBQWlCQyxLQUFqQixDQUF1QixVQUFVQyxDQUFWLEVBQWE7O0FBRWxDOzs7Ozs7QUFNQTtBQUNBLE1BQUlDLE9BQU9DLE9BQU9DLFFBQVAsQ0FBZ0JGLElBQWhCLENBQXFCRyxPQUFyQixDQUE2QixHQUE3QixFQUFrQyxFQUFsQyxDQUFYOztBQUVBO0FBQ0EsTUFBSUMsUUFBUUwsRUFBRSxVQUFGLENBQVo7QUFBQSxNQUNFTSxRQUFRTixFQUFFLE1BQUYsQ0FEVjs7QUFHQSxNQUFJSyxNQUFNRSxNQUFWLEVBQWtCO0FBQ2hCLFFBQUlDLFlBQVlILE1BQU1JLElBQU4sQ0FBVyxhQUFYLENBQWhCO0FBQ0FELGNBQVVFLElBQVYsQ0FBZSxZQUFZO0FBQ3pCLFVBQUlDLGlCQUFpQlgsRUFBRSxJQUFGLENBQXJCO0FBQUEsVUFDRVksVUFBVUQsZUFBZUUsSUFBZixFQURaO0FBQUEsVUFFRUMsdUJBQXVCLE9BQU9GLFFBQVFHLGVBQWYsS0FBbUMsV0FBbkMsR0FBaURILFFBQVFHLGVBQVIsR0FBMEIsR0FBM0UsR0FBaUYsRUFGMUc7QUFBQSxVQUdFQyxNQUFNLE9BQU9KLFFBQVFLLEVBQWYsS0FBc0IsV0FBdEIsR0FBb0NMLFFBQVFLLEVBQTVDLEdBQWlELEVBSHpEO0FBQUEsVUFJRUMs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WCxDQUFvQixtQkFBcEIsRUFBeUNvRCxLQUF6QyxHQUFpREMsS0FBakQ7O0FBRUEzQixjQUFNYSxjQUFOO0FBQ0Q7QUFFRixLQXZLSDtBQXdLRTtBQXhLRixLQXlLR2QsRUF6S0gsQ0F5S00sT0F6S04sRUF5S2UsaUJBektmLEVBeUtrQyxZQUFZO0FBQzFDLFVBQUlyQixRQUFRekIsRUFBRSxJQUFGLENBQVo7QUFBQSxVQUNFbUYsYUFBYW5GLEVBQUV5QixNQUFNRixJQUFOLENBQVcsTUFBWCxDQUFGLENBRGY7QUFBQSxVQUVFNkQsbUJBQW1CcEYsRUFBRSxNQUFNbUYsV0FBVzVELElBQVgsQ0FBZ0IsaUJBQWhCLENBQVIsQ0FGckI7O0FBSUEsVUFBSTZELGlCQUFpQjdELElBQWpCLENBQXNCLGVBQXRCLE1BQTJDLE1BQS9DLEVBQXVEO0FBQ3JEO0FBQ0E2RCx5QkFBaUJYLEtBQWpCO0FBQ0E7QUFDQWxCLG1CQUFXLFlBQVk7QUFDckI2QiwyQkFBaUJWLEtBQWpCO0FBQ0QsU0FGRCxFQUVHLEVBRkg7QUFHRDtBQUVGLEtBdkxIO0FBd0xEO0FBQ0YsQ0EzVUQiLCJmaWxlIjoibGliL2pxdWVyeS1hY2Nlc3NpYmxlLXRhYnMtYXJpYS5qcyIsInNvdXJjZXNDb250ZW50IjpbImpRdWVyeShkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCQpIHtcblxuICAvKlxuICAgKiBqUXVlcnkgQWNjZXNzaWJsZSB0YWIgcGFuZWwgc3lzdGVtLCB1c2luZyBBUklBXG4gICAqIEB2ZXJzaW9uIHYxLjYuMVxuICAgKiBXZWJzaXRlOiBodHRwczovL2ExMXkubmljb2xhcy1ob2ZmbWFubi5uZXQvdGFicy9cbiAgICogTGljZW5zZSBNSVQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9uaWNvMzMzM2ZyL2pxdWVyeS1hY2Nlc3NpYmxlLXRhYnMtYXJpYS9ibG9iL21hc3Rlci9MSUNFTlNFXG4gICAqL1xuICAvLyBTdG9yZSBjdXJyZW50IFVSTCBoYXNoLlxuICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJyk7XG5cbiAgLyogVGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbiAgdmFyICR0YWJzID0gJCgnLmpzLXRhYnMnKSxcbiAgICAkYm9keSA9ICQoJ2JvZHknKTtcblxuICBpZiAoJHRhYnMubGVuZ3RoKSB7XG4gICAgdmFyICR0YWJfbGlzdCA9ICR0YWJzLmZpbmQoJy5qcy10YWJsaXN0Jyk7XG4gICAgJHRhYl9saXN0LmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzX3RhYl9saXN0ID0gJCh0aGlzKSxcbiAgICAgICAgb3B0aW9ucyA9ICR0aGlzX3RhYl9saXN0LmRhdGEoKSxcbiAgICAgICAgJHRhYnNfcHJlZml4X2NsYXNzZXMgPSB0eXBlb2Ygb3B0aW9ucy50YWJzUHJlZml4Q2xhc3MgIT09ICd1bmRlZmluZWQnID8gb3B0aW9ucy50YWJzUHJlZml4Q2xhc3MgKyAnLScgOiAnJyxcbiAgICAgICAgJGh4ID0gdHlwZW9mIG9wdGlvbnMuaHggIT09ICd1bmRlZmluZWQnID8gb3B0aW9ucy5oeCA6ICcnLFxuICAgICAgICAkZXhpc3RpbmdfaHggPSB0eXBlb2Ygb3B0aW9ucy5leGlzdGluZ0h4ICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbnMuZXhpc3RpbmdIeCA6ICcnLFxuICAgICAgICAkdGhpc190YWJfbGlzdF9pdGVtcyA9ICR0aGlzX3RhYl9saXN0LmNoaWxkcmVuKCcuanMtdGFibGlzdF9faXRlbScpLFxuICAgICAgICAkdGhpc190YWJfbGlzdF9saW5rcyA9ICR0aGlzX3RhYl9saXN0LmZpbmQoJy5qcy10YWJsaXN0X19saW5rJyk7XG5cbiAgICAgIC8vIHJvbGVzIGluaXRcbiAgICAgICR0aGlzX3RhYl9saXN0LmF0dHIoJ3JvbGUnLCAndGFibGlzdCcpOyAvLyB1bCAgICAgICAgXG4gICAgICAkdGhpc190YWJfbGlzdF9pdGVtcy5hdHRyKCdyb2xlJywgJ3ByZXNlbnRhdGlvbicpOyAvLyBsaVxuICAgICAgJHRoaXNfdGFiX2xpc3RfbGlua3MuYXR0cigncm9sZScsICd0YWInKTsgLy8gYVxuXG4gICAgICAvLyBjbGFzc2VzIGluaXRcbiAgICAgICR0aGlzX3RhYl9saXN0LmFkZENsYXNzKCR0YWJzX3ByZWZpeF9jbGFzc2VzICsgJ3RhYnNfX2xpc3QnKTtcbiAgICAgICR0aGlzX3RhYl9saXN0X2l0ZW1zLmFkZENsYXNzKCR0YWJzX3ByZWZpeF9jbGFzc2VzICsgJ3RhYnNfX2l0ZW0nKTtcbiAgICAgICR0aGlzX3RhYl9saXN0X2xpbmtzLmFkZENsYXNzKCR0YWJzX3ByZWZpeF9jbGFzc2VzICsgJ3RhYnNfX2xpbmsnKTtcblxuICAgICAgLy8gY29udHJvbHMvdGFiaW5kZXggYXR0cmlidXRlc1xuICAgICAgJHRoaXNfdGFiX2xpc3RfbGlua3MuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgICAgJGh4X2dlbmVyYXRlZF9jbGFzcyA9IHR5cGVvZiBvcHRpb25zLnRhYnNHZW5lcmF0ZWRIeENsYXNzICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbnMudGFic0dlbmVyYXRlZEh4Q2xhc3MgOiAnaW52aXNpYmxlJyxcbiAgICAgICAgICAkaHJlZiA9ICR0aGlzLmF0dHIoJ2hyZWYnKSxcbiAgICAgICAgICAkY29udHJvbHMgPSAkKCRocmVmKSxcbiAgICAgICAgICAkdGV4dCA9ICR0aGlzLnRleHQoKTtcblxuICAgICAgICBpZiAoJGh4ICE9PSAnJykge1xuICAgICAgICAgICRjb250cm9scy5wcmVwZW5kKCc8JyArICRoeCArICcgY2xhc3M9XCInICsgJGh4X2dlbmVyYXRlZF9jbGFzcyArICdcIiB0YWJpbmRleD1cIjBcIj4nICsgJHRleHQgKyAnPC8nICsgJGh4ICsgJz4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoJGV4aXN0aW5nX2h4ICE9PSAnJykge1xuICAgICAgICAgICRjb250cm9scy5maW5kKCRleGlzdGluZ19oeCArICc6Zmlyc3QtY2hpbGQnKS5hdHRyKCd0YWJpbmRleCcsIDApO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgJGhyZWYgIT09ICd1bmRlZmluZWQnICYmICRocmVmICE9PSAnJyAmJiAkaHJlZiAhPT0gJyMnKSB7XG4gICAgICAgICAgJHRoaXMuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1jb250cm9scyc6ICRocmVmLnJlcGxhY2UoJyMnLCAnJyksXG4gICAgICAgICAgICAndGFiaW5kZXgnOiAtMSxcbiAgICAgICAgICAgICdhcmlhLXNlbGVjdGVkJzogJ2ZhbHNlJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgJHRoaXMucmVtb3ZlQXR0cignaHJlZicpO1xuXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8qIFRhYnMgY29udGVudCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG4gICAgJCgnLmpzLXRhYmNvbnRlbnQnKS5hdHRyKHtcbiAgICAgICdyb2xlJzogJ3RhYnBhbmVsJywgLy8gY29udGVudHNcbiAgICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJyAvLyBhbGwgaGlkZGVuXG4gICAgICAgIC8vXCJ0YWJpbmRleFwiOiAwXG4gICAgfSlcbiAgICAgIC5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAkdGhpc19pZCA9ICR0aGlzLmF0dHIoJ2lkJyksXG4gICAgICAgICAgJHByZWZpeF9hdHRyaWJ1dGUgPSAkKCcjbGFiZWxfJyArICR0aGlzX2lkKS5jbG9zZXN0KCcuanMtdGFibGlzdCcpLmF0dHIoJ2RhdGEtdGFicy1wcmVmaXgtY2xhc3MnKSxcbiAgICAgICAgICAkdGFic19wcmVmaXhfY2xhc3NlcyA9IHR5cGVvZiAkcHJlZml4X2F0dHJpYnV0ZSAhPT0gJ3VuZGVmaW5lZCcgPyAkcHJlZml4X2F0dHJpYnV0ZSArICctJyA6ICcnO1xuICAgICAgICAvLyBsYWJlbCBieSBsaW5rXG4gICAgICAgICR0aGlzLmF0dHIoJ2FyaWEtbGFiZWxsZWRieScsICdsYWJlbF8nICsgJHRoaXNfaWQpO1xuXG4gICAgICAgICR0aGlzLmFkZENsYXNzKCR0YWJzX3ByZWZpeF9jbGFzc2VzICsgJ3RhYnNfX2NvbnRlbnQnKTtcbiAgICAgIH0pO1xuXG4gICAgLy8gc2VhcmNoIGlmIGhhc2ggaXMgT04gbm90IGRpc2FibGVkIHRhYlxuICAgIGlmIChoYXNoICE9PSAnJyAmJiAkKCcjJyArIGhhc2ggKyAnLmpzLXRhYmNvbnRlbnQnKS5sZW5ndGggIT09IDApIHtcbiAgICAgIGlmICgkKCcjbGFiZWxfJyArIGhhc2ggKyAnLmpzLXRhYmxpc3RfX2xpbms6bm90KFthcmlhLWRpc2FibGVkPVxcJ3RydWVcXCddKScpLmxlbmd0aCkge1xuICAgICAgICAvLyBkaXNwbGF5IG5vdCBkaXNhYmxlZFxuICAgICAgICAkKCcjJyArIGhhc2ggKyAnLmpzLXRhYmNvbnRlbnQnKS5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbicpO1xuICAgICAgICAvLyBzZWxlY3Rpb24gbWVudVxuICAgICAgICAkKCcjbGFiZWxfJyArIGhhc2ggKyAnLmpzLXRhYmxpc3RfX2xpbmsnKS5hdHRyKHtcbiAgICAgICAgICAnYXJpYS1zZWxlY3RlZCc6ICd0cnVlJyxcbiAgICAgICAgICAndGFiaW5kZXgnOiAwXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgfVxuICAgIC8vIHNlYXJjaCBpZiBoYXNoIGlzIElOIG5vdCBkaXNhYmxlZCB0YWJcbiAgICBpZiAoaGFzaCAhPT0gJycgJiYgJCgnIycgKyBoYXNoKS5wYXJlbnRzKCcuanMtdGFiY29udGVudCcpLmxlbmd0aCkge1xuICAgICAgdmFyICR0aGlzX2hhc2ggPSAkKCcjJyArIGhhc2gpLFxuICAgICAgICAkdGFiX2NvbnRlbnRfcGFyZW50ID0gJHRoaXNfaGFzaC5wYXJlbnRzKCcuanMtdGFiY29udGVudCcpLFxuICAgICAgICAkdGFiX2NvbnRlbnRfcGFyZW50X2lkID0gJHRhYl9jb250ZW50X3BhcmVudC5hdHRyKCdpZCcpO1xuXG4gICAgICBpZiAoJCgnI2xhYmVsXycgKyAkdGFiX2NvbnRlbnRfcGFyZW50X2lkICsgJy5qcy10YWJsaXN0X19saW5rOm5vdChbYXJpYS1kaXNhYmxlZD1cXCd0cnVlXFwnXSknKS5sZW5ndGgpIHtcbiAgICAgICAgJHRhYl9jb250ZW50X3BhcmVudC5yZW1vdmVBdHRyKCdhcmlhLWhpZGRlbicpO1xuICAgICAgICAvLyBzZWxlY3Rpb24gbWVudVxuICAgICAgICAkKCcjbGFiZWxfJyArICR0YWJfY29udGVudF9wYXJlbnRfaWQgKyAnLmpzLXRhYmxpc3RfX2xpbmsnKS5hdHRyKHtcbiAgICAgICAgICAnYXJpYS1zZWxlY3RlZCc6ICd0cnVlJyxcbiAgICAgICAgICAndGFiaW5kZXgnOiAwXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNlYXJjaCBpZiBkYXRhLXNlbGVjdGVkPVwiMVwiIGlzIG9uIGEgbm90IGRpc2FibGVkIHRhYiBmb3IgZWFjaCB0YWIgc3lzdGVtXG4gICAgJHRhYnMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAkdGFiX3NlbGVjdGVkID0gJHRoaXMuZmluZCgnLmpzLXRhYmxpc3RfX2xpbmtbYXJpYS1zZWxlY3RlZD1cInRydWVcIl0nKSxcbiAgICAgICAgJHRhYl9kYXRhX3NlbGVjdGVkID0gJHRoaXMuZmluZCgnLmpzLXRhYmxpc3RfX2xpbmtbZGF0YS1zZWxlY3RlZD1cIjFcIl06bm90KFthcmlhLWRpc2FibGVkPVwidHJ1ZVwiXSk6Zmlyc3QnKSxcbiAgICAgICAgJHRhYl9kYXRhX3NlbGVjdGVkX2NvbnRlbnQgPSAkKCcjJyArICR0YWJfZGF0YV9zZWxlY3RlZC5hdHRyKCdhcmlhLWNvbnRyb2xzJykpO1xuXG4gICAgICBpZiAoJHRhYl9zZWxlY3RlZC5sZW5ndGggPT09IDAgJiYgJHRhYl9kYXRhX3NlbGVjdGVkLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAkdGFiX2RhdGFfc2VsZWN0ZWQuYXR0cih7XG4gICAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZScsXG4gICAgICAgICAgJ3RhYmluZGV4JzogMFxuICAgICAgICB9KTtcbiAgICAgICAgJHRhYl9kYXRhX3NlbGVjdGVkX2NvbnRlbnQucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4nKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGlmIG5vIHNlbGVjdGVkID0+IHNlbGVjdCBmaXJzdCBub3QgZGlzYWJsZWRcbiAgICAkdGFicy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgICR0YWJfc2VsZWN0ZWQgPSAkdGhpcy5maW5kKCcuanMtdGFibGlzdF9fbGlua1thcmlhLXNlbGVjdGVkPVwidHJ1ZVwiXScpLFxuICAgICAgICAkZmlyc3RfbGluayA9ICR0aGlzLmZpbmQoJy5qcy10YWJsaXN0X19saW5rOm5vdChbYXJpYS1kaXNhYmxlZD1cInRydWVcIl0pOmZpcnN0JyksXG4gICAgICAgICRmaXJzdF9jb250ZW50ID0gJCgnIycgKyAkZmlyc3RfbGluay5hdHRyKCdhcmlhLWNvbnRyb2xzJykpO1xuXG4gICAgICBpZiAoJHRhYl9zZWxlY3RlZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgJGZpcnN0X2xpbmsuYXR0cih7XG4gICAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZScsXG4gICAgICAgICAgJ3RhYmluZGV4JzogMFxuICAgICAgICB9KTtcbiAgICAgICAgJGZpcnN0X2NvbnRlbnQucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4nKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qIEV2ZW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG4gICAgLyogY2xpY2sgb24gYSB0YWIgbGluayAqL1xuICAgICRib2R5Lm9uKCdjbGljaycsICcuanMtdGFibGlzdF9fbGlua1thcmlhLWRpc2FibGVkPVxcJ3RydWVcXCddJywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICAgICRib2R5Lm9uKCdjbGljaycsICcuanMtdGFibGlzdF9fbGluazpub3QoW2FyaWEtZGlzYWJsZWQ9XFwndHJ1ZVxcJ10pJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAkaGFzaF90b191cGRhdGUgPSAkdGhpcy5hdHRyKCdhcmlhLWNvbnRyb2xzJyksXG4gICAgICAgICR0YWJfY29udGVudF9saW5rZWQgPSAkKCcjJyArICR0aGlzLmF0dHIoJ2FyaWEtY29udHJvbHMnKSksXG4gICAgICAgICRwYXJlbnQgPSAkdGhpcy5jbG9zZXN0KCcuanMtdGFicycpLFxuICAgICAgICBvcHRpb25zID0gJHBhcmVudC5kYXRhKCksXG4gICAgICAgIHRhYnNfZGlzYWJsZV9mcmFnbWVudHMgPSB0eXBlb2Ygb3B0aW9ucy50YWJzRGlzYWJsZUZyYWdtZW50ICE9PSAndW5kZWZpbmVkJyA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgJGFsbF90YWJfbGlua3MgPSAkcGFyZW50LmZpbmQoJy5qcy10YWJsaXN0X19saW5rJyksXG4gICAgICAgICRhbGxfdGFiX2NvbnRlbnRzID0gJHBhcmVudC5maW5kKCcuanMtdGFiY29udGVudCcpO1xuXG4gICAgICAgIC8vIGFyaWEgc2VsZWN0ZWQgZmFsc2Ugb24gYWxsIGxpbmtzXG4gICAgICAkYWxsX3RhYl9saW5rcy5hdHRyKHtcbiAgICAgICAgJ3RhYmluZGV4JzogLTEsXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogJ2ZhbHNlJ1xuICAgICAgfSk7XG5cbiAgICAgICAgLy8gYWRkIGFyaWEgc2VsZWN0ZWQgb24gJHRoaXNcbiAgICAgICR0aGlzLmF0dHIoe1xuICAgICAgICAnYXJpYS1zZWxlY3RlZCc6ICd0cnVlJyxcbiAgICAgICAgJ3RhYmluZGV4JzogMFxuICAgICAgfSk7XG5cbiAgICAgICAgLy8gYWRkIGFyaWEtaGlkZGVuIG9uIGFsbCB0YWJzIGNvbnRlbnRzXG4gICAgICAkYWxsX3RhYl9jb250ZW50cy5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGFyaWEtaGlkZGVuIG9uIHRhYiBsaW5rZWRcbiAgICAgICR0YWJfY29udGVudF9saW5rZWQucmVtb3ZlQXR0cignYXJpYS1oaWRkZW4nKTtcblxuICAgICAgICAvLyBhZGQgZnJhZ21lbnQgKHRpbWVvdXQgZm9yIHRyYW5zaXRpb25zKVxuICAgICAgaWYgKHRhYnNfZGlzYWJsZV9mcmFnbWVudHMgPT09IGZhbHNlKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIGxvY2F0aW9uLnBhdGhuYW1lICsgbG9jYXRpb24uc2VhcmNoICsgJyMnICsgJGhhc2hfdG9fdXBkYXRlKTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgICB9XG5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSlcbiAgICAgIC8qIEtleSBkb3duIGluIHRhYnMgKi9cbiAgICAgIC5vbigna2V5ZG93bicsICcuanMtdGFibGlzdCcsIGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAgIHZhciAkcGFyZW50ID0gJCh0aGlzKS5jbG9zZXN0KCcuanMtdGFicycpLFxuICAgICAgICAgICRhY3RpdmF0ZWQgPSAkcGFyZW50LmZpbmQoJy5qcy10YWJsaXN0X19saW5rW2FyaWEtc2VsZWN0ZWQ9XCJ0cnVlXCJdJykucGFyZW50KCksXG4gICAgICAgICAgJGxhc3RfbGluayA9ICRwYXJlbnQuZmluZCgnLmpzLXRhYmxpc3RfX2l0ZW06bGFzdC1jaGlsZCAuanMtdGFibGlzdF9fbGluaycpLFxuICAgICAgICAgICRmaXJzdF9saW5rID0gJHBhcmVudC5maW5kKCcuanMtdGFibGlzdF9faXRlbTpmaXJzdC1jaGlsZCAuanMtdGFibGlzdF9fbGluaycpLFxuICAgICAgICAgICRmb2N1c19vbl90YWJfb25seSA9IGZhbHNlLFxuICAgICAgICAgICRwcmV2ID0gJGFjdGl2YXRlZCxcbiAgICAgICAgICAkbmV4dCA9ICRhY3RpdmF0ZWQ7XG5cbiAgICAgICAgLy8gc2VhcmNoIHZhbGlkIHByZXZpb3VzIFxuICAgICAgICBkbyB7XG4gICAgICAgICAgLy8gaWYgd2UgYXJlIG9uIGZpcnN0ID0+IGFjdGl2YXRlIGxhc3RcbiAgICAgICAgICBpZiAoJHByZXYuaXMoJy5qcy10YWJsaXN0X19pdGVtOmZpcnN0LWNoaWxkJykpIHtcbiAgICAgICAgICAgICRwcmV2ID0gJGxhc3RfbGluay5wYXJlbnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZWxzZSBwcmV2aW91c1xuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgJHByZXYgPSAkcHJldi5wcmV2KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHdoaWxlICgkcHJldi5jaGlsZHJlbignLmpzLXRhYmxpc3RfX2xpbmsnKS5hdHRyKCdhcmlhLWRpc2FibGVkJykgPT09ICd0cnVlJyAmJiAkcHJldiAhPT0gJGFjdGl2YXRlZCk7XG5cbiAgICAgICAgLy8gc2VhcmNoIHZhbGlkIG5leHRcbiAgICAgICAgZG8ge1xuICAgICAgICAgIC8vIGlmIHdlIGFyZSBvbiBsYXN0ID0+IGFjdGl2YXRlIGZpcnN0XG4gICAgICAgICAgaWYgKCRuZXh0LmlzKCcuanMtdGFibGlzdF9faXRlbTpsYXN0LWNoaWxkJykpIHtcbiAgICAgICAgICAgICRuZXh0ID0gJGZpcnN0X2xpbmsucGFyZW50KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGVsc2UgcHJldmlvdXNcbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICRuZXh0ID0gJG5leHQubmV4dCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoJG5leHQuY2hpbGRyZW4oJy5qcy10YWJsaXN0X19saW5rJykuYXR0cignYXJpYS1kaXNhYmxlZCcpID09PSAndHJ1ZScgJiYgJG5leHQgIT09ICRhY3RpdmF0ZWQpO1xuXG4gICAgICAgIC8vIHNvbWUgZXZlbnQgc2hvdWxkIGJlIGFjdGl2YXRlZCBvbmx5IGlmIHRoZSBmb2N1cyBpcyBvbiB0YWJzIChub3Qgb24gdGFicGFuZWwpXG4gICAgICAgIGlmICgkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpLmlzKCRwYXJlbnQuZmluZCgnLmpzLXRhYmxpc3RfX2xpbmsnKSkpIHtcbiAgICAgICAgICAkZm9jdXNfb25fdGFiX29ubHkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2F0Y2gga2V5Ym9hcmQgZXZlbnQgb25seSBpZiBmb2N1cyBpcyBvbiB0YWJcbiAgICAgICAgaWYgKCRmb2N1c19vbl90YWJfb25seSAmJiAhZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgIC8vIHN0cmlrZSB1cCBvciBsZWZ0IGluIHRoZSB0YWJcbiAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSAzNyB8fCBldmVudC5rZXlDb2RlID09IDM4KSB7XG5cbiAgICAgICAgICAgICRwcmV2LmNoaWxkcmVuKCcuanMtdGFibGlzdF9fbGluaycpLmNsaWNrKCkuZm9jdXMoKTtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gc3RyaWtlIGRvd24gb3IgcmlnaHQgaW4gdGhlIHRhYlxuICAgICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gNDAgfHwgZXZlbnQua2V5Q29kZSA9PSAzOSkge1xuXG4gICAgICAgICAgICAkbmV4dC5jaGlsZHJlbignLmpzLXRhYmxpc3RfX2xpbmsnKS5jbGljaygpLmZvY3VzKCk7XG5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDM2KSB7XG4gICAgICAgICAgICAvLyBhY3RpdmF0ZSBmaXJzdCB0YWJcbiAgICAgICAgICAgICRmaXJzdF9saW5rLmNsaWNrKCkuZm9jdXMoKTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDM1KSB7XG4gICAgICAgICAgICAvLyBhY3RpdmF0ZSBsYXN0IHRhYlxuICAgICAgICAgICAgJGxhc3RfbGluay5jbGljaygpLmZvY3VzKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgIH0pXG4gICAgICAub24oJ2tleWRvd24nLCAnLmpzLXRhYmNvbnRlbnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICRzZWxlY3Rvcl90YWJfdG9fZm9jdXMgPSAkdGhpcy5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKSxcbiAgICAgICAgICAkdGFiX3RvX2ZvY3VzID0gJCgnIycgKyAkc2VsZWN0b3JfdGFiX3RvX2ZvY3VzKSxcbiAgICAgICAgICAkcGFyZW50X2l0ZW0gPSAkdGFiX3RvX2ZvY3VzLnBhcmVudCgpLFxuICAgICAgICAgICRwYXJlbnRfbGlzdCA9ICRwYXJlbnRfaXRlbS5wYXJlbnQoKSxcbiAgICAgICAgICAkZmlyc3RfaXRlbSA9ICRwYXJlbnRfbGlzdC5maW5kKCcuanMtdGFibGlzdF9faXRlbTpmaXJzdC1jaGlsZCcpLFxuICAgICAgICAgICRsYXN0X2l0ZW0gPSAkcGFyZW50X2xpc3QuZmluZCgnLmpzLXRhYmxpc3RfX2l0ZW06bGFzdC1jaGlsZCcpLFxuICAgICAgICAgICRwcmV2X2l0ZW0gPSAkcGFyZW50X2l0ZW0sXG4gICAgICAgICAgJG5leHRfaXRlbSA9ICRwYXJlbnRfaXRlbTtcblxuICAgICAgICAvLyBDVFJMIHVwL0xlZnRcbiAgICAgICAgaWYgKChldmVudC5rZXlDb2RlID09IDM3IHx8IGV2ZW50LmtleUNvZGUgPT0gMzgpICYmIGV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgICAkdGFiX3RvX2ZvY3VzLmZvY3VzKCk7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDVFJMIFBhZ2VVcFxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSAzMyAmJiBldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgLy8kdGFiX3RvX2ZvY3VzLmZvY3VzKCk7XG5cbiAgICAgICAgICAvLyBzZWFyY2ggdmFsaWQgcHJldmlvdXMgXG4gICAgICAgICAgZG8ge1xuICAgICAgICAgICAgLy8gaWYgd2UgYXJlIG9uIGZpcnN0ID0+IGxhc3RcbiAgICAgICAgICAgIGlmICgkcHJldl9pdGVtLmlzKCcuanMtdGFibGlzdF9faXRlbTpmaXJzdC1jaGlsZCcpKSB7XG4gICAgICAgICAgICAgICRwcmV2X2l0ZW0gPSAkbGFzdF9pdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZWxzZSBwcmV2aW91c1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICRwcmV2X2l0ZW0gPSAkcHJldl9pdGVtLnByZXYoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgd2hpbGUgKCRwcmV2X2l0ZW0uY2hpbGRyZW4oJy5qcy10YWJsaXN0X19saW5rJykuYXR0cignYXJpYS1kaXNhYmxlZCcpID09PSAndHJ1ZScgJiYgJHByZXZfaXRlbSAhPT0gJHBhcmVudF9pdGVtKTtcblxuICAgICAgICAgICRwcmV2X2l0ZW0uY2hpbGRyZW4oJy5qcy10YWJsaXN0X19saW5rJykuY2xpY2soKS5mb2N1cygpO1xuXG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDVFJMIFBhZ2VEb3duXG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09IDM0ICYmIGV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgICAkdGFiX3RvX2ZvY3VzLmZvY3VzKCk7XG5cbiAgICAgICAgICAvLyBzZWFyY2ggdmFsaWQgbmV4dCBcbiAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBhcmUgb24gbGFzdCA9PiBmaXJzdFxuICAgICAgICAgICAgaWYgKCRuZXh0X2l0ZW0uaXMoJy5qcy10YWJsaXN0X19pdGVtOmxhc3QtY2hpbGQnKSkge1xuICAgICAgICAgICAgICAkbmV4dF9pdGVtID0gJGZpcnN0X2l0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbHNlIHByZXZpb3VzXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgJG5leHRfaXRlbSA9ICRuZXh0X2l0ZW0ubmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB3aGlsZSAoJG5leHRfaXRlbS5jaGlsZHJlbignLmpzLXRhYmxpc3RfX2xpbmsnKS5hdHRyKCdhcmlhLWRpc2FibGVkJykgPT09ICd0cnVlJyAmJiAkbmV4dF9pdGVtICE9PSAkcGFyZW50X2l0ZW0pO1xuXG4gICAgICAgICAgJG5leHRfaXRlbS5jaGlsZHJlbignLmpzLXRhYmxpc3RfX2xpbmsnKS5jbGljaygpLmZvY3VzKCk7XG5cbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICAgIH0pXG4gICAgICAvKiBjbGljayBvbiBhIHRhYiBsaW5rICovXG4gICAgICAub24oJ2NsaWNrJywgJy5qcy1saW5rLXRvLXRhYicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAkdGFiX3RvX2dvID0gJCgkdGhpcy5hdHRyKCdocmVmJykpLFxuICAgICAgICAgICRidXR0b25fdG9fY2xpY2sgPSAkKCcjJyArICR0YWJfdG9fZ28uYXR0cignYXJpYS1sYWJlbGxlZGJ5JykpO1xuXG4gICAgICAgIGlmICgkYnV0dG9uX3RvX2NsaWNrLmF0dHIoJ2FyaWEtZGlzYWJsZWQnKSAhPT0gJ3RydWUnKSB7XG4gICAgICAgICAgLy8gYWN0aXZhdGUgdGFic1xuICAgICAgICAgICRidXR0b25fdG9fY2xpY2suY2xpY2soKTtcbiAgICAgICAgICAvLyBnaXZlIGZvY3VzIHRvIHRoZSBnb29kIGJ1dHRvblxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJGJ1dHRvbl90b19jbGljay5mb2N1cygpO1xuICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgfVxuXG4gICAgICB9KTtcbiAgfVxufSk7Il19
