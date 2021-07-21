(function($) {
  function add_spinner(target) {
    var opts = {
      lines: 13, // The number of lines to draw
      length: 20, // The length of each line
      width: 10, // The line thickness
      radius: 30, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#20438F', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    };
    var spinner = new Spinner(opts).spin(target.get(0));
  }

  function startUp() {

    var queue = 2;
    var people = [];

    function success_response(response) {
      // Push the people into our queue. They'll be processed in the
      // complete callback when all callbacks have returned.
      for(var i = 0; i < response.length; i++) {
        people.push(response[i]);
      }
    }

    function complete_response() {
      // When queue hits zero, all callbacks have returned.
      if (!--queue) {
        // Hide the letters until a response
        $('.directory-wrapper .letter').hide();
        // Remove all the people
        $('.directory-wrapper .person').remove();

        // Sort the results since we could have searched both
        people.sort(function(a, b) {
          if (a.FullName == b.FullName) {
            return 0;
          }
          return a.FullName < b.FullName ? -1 : 1;
        });

        // Loop over the results for output
        for (var i = 0; i < people.length; i++) {
          var person = people[i];
          var letter = person.FullName.substring(0, 1).toUpperCase();
          if (letter < 'A' || letter > 'Z') {
            letter = '#';
          }
          $('.directory-wrapper .letter')
            .filter(function() { return $(this).data('letter') == letter;})
            .show()
            .append(directory_person(person));
        }
        $('.directory-wrapper').show();
        // $('.directory-spinner-wrapper').remove();

        $('.directory-max-results').remove();
        $('.directory-empty-results').remove();
        if (people.length >= 25) {
          $('<div class="directory-max-results font-serif text-xl">' + Drupal.t('* You have retrieved the maximum number of results. More results may be available, so you may want to make your search more specific.') + '</div>')
            .appendTo($('.directory-wrapper'));
        } else if (people.length == 0) {
          $('<div class="directory-empty-results font-serif text-xl">' + Drupal.t('We\'re sorry but we found no results for your search. Please try your search again. If you continue to receive this message, please alert <a class="text-cyan" href="mailto:webupdate@pomona.edu">webupdate@pomona.edu</a>.') + '</div>')
            .appendTo($('.directory-wrapper'));
        }
      }
    }

    // Add our loading spinner
    $('form.directory-form').submit(function() {
      // add_spinner($('<div class="directory-spinner-wrapper" />').insertAfter('.directory-wrapper'));

      var first_name = $(this).find('input.first-name').val();
      var last_name = $(this).find('input.last-name').val();
      var faculty = $(this).find('input.faculty').is(':checked');
      var students = $(this).find('input.students').is(':checked');

      queue = 0;
      faculty && queue++;
      students && queue++;

      if (!queue) {
        queue = 2;
      }

      // Reset the people queue.
      people = [];

      if (students || queue == 2) {
        $.ajax({
          url: "https://jicsweb.pomona.edu/api/students",
          jsonp: "callback",
          dataType: "jsonp",
          data: {
            first: first_name,
            last: last_name
          },
          success: success_response,
          complete: complete_response
        });
      }

      if (faculty || queue == 2) {
        $.ajax({
          url: "https://jicsweb.pomona.edu/api/employees",
          jsonp: "callback",
          dataType: "jsonp",
          data: {
            first: first_name,
            last: last_name
          },
          success: success_response,
          complete: complete_response
        });
      }

      return false;
    });
  }

  startUp();

  function directory_person(person) {
    var output = $('<div class="person mb-30 flex-fill pl-40 xl:pl-0 md:flex-1/2 lg:flex-1/3" />');
    person.FullName && output.append($('<div class="name text-brown-300 text-xl mb-10">' + person.FullName + '</div>'));
    person.Phone && output.append($('<div class="phone text-brown-300 text-lg">' + person.Phone.replace(/\./g, '-') + '</div>'));
    person.Email && output.append($('<div class="email text-blue text-lg border-b-2 border-brown-100 inline-block hover:border-transparent"><a href="mailto:' + person.Email + '">' + person.Email + '</a></div>'));
    person.OfficeAddress && output.append($('<div class="office-address text-brown-300 text-lg">' + person.OfficeAddress + '</div>'));
    person.Office && output.append($('<div class="office text-brown-300 text-lg">' + person.Office + '</div>'));
    return output;
  }
})(jQuery);