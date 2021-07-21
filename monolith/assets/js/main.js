(($) => {

  // Check device accessibility settings to see if reduce motion
  // has been turned on. If it has, then don't auto-advance slides.
  const reducedMotionState = (window.matchMedia) ?
    window.matchMedia('(prefers-reduced-motion: reduce)').matches :
    false;

  // Hiraku docs: https://appleple.github.io/hiraku/
  const offcanvas = () => {
    new Hiraku('.offcanvas-left', {
      btn: '#offcanvas-btn-left',
      fixedHeader: '#header',
      direction: 'left',
      width: '250px'
    });


    new Hiraku('.offcanvas-right', {
      btn: '#offcanvas-btn-right',
      fixedHeader: '#header',
      direction: 'right',
      width: '250px'
    });
  }

  // Set up magnific lightbox
  // magnific docs: https://dimsemenov.com/plugins/magnific-popup/
  const lightbox = () => {
    $('.lightbox-trigger').magnificPopup({
      type: 'image',
      closeOnContentClick: true,
      closeBtnInside: true,
      image: {
        verticalFit: true
      },
    });

    $('.video-trigger').magnificPopup({
      disableOn: 700,
      type: 'iframe',
      mainClass: 'mfp-fade',
      removalDelay: 160,
      preloader: false,
      fixedContentPos: false
    });
  }

  const playPauseVideo = ($video, $button, $force = null) => {
    if (!$video.paused || $force === "pause") {
      $video.pause();
      $button.find('.label').text("Play")
      $button.find('.fas').removeClass('fa-pause').addClass('fa-play');
    } else {
      $video.play();
      $button.find('.label').text("Pause");
      $button.find('.fas').removeClass('fa-play').addClass('fa-pause');
    }
  };

  const featurevideo = () => {
    const $videoContainer = $('.feature-video');
    // The video automatically starts in a paused state
    // if the browser reports the "reduce motion" accessibility
    // feature has been turned on.
    $videoContainer.each(function () {
      if (reducedMotionState) {
        const $video = $(this).find('video');
        $video.removeAttr('autoplay');
        playPauseVideo($video.get(0), $(this).find('button'), "pause");
      }
    }).on('click', 'button', (event) => {
      const $button = $(event.target).parents('button');
      console.log($button);
      const $video = $(event.delegateTarget).find('video').get(0);
      playPauseVideo($video, $button);
    });
  }

  const accordion = () => {
    const accordions = $('.js-accordion');
    accordions.map((idx, acc) => {
      const $accordion = $(acc);
      const accordionOpened = $accordion.parents("[data-accordion-start-opened]").data('accordion-start-opened');
      if (accordionOpened) {
        $accordion.find('.js-accordion__panel').eq(0).data({
          'accordion-opened': true
        }).attr('data-accordion-opened', true);
      };
      $accordion.find('.accordion__panel').on('transitionend',() => {
        console.log("Transition End");
      })
      $accordion.accordion();
    });
  }

  const accordionToTabs = () => {
    $('.profileTabs').accordionortabs({
      centerTabs: true,
      minCenterTabs: 3
    });
  }

  const formstackResponse = () => {
    /* START formstack internal posting */
    //For any pages with an embedded Formstack form, this removes a problematic class.
    $( ".fsForm .selectBox").removeClass( "selectBox-disabled" )
    
    // Submit Handler
    $(".pom-formstack-submit-internal .fsForm").submit(function () {
      const theForm = $(this);
      const formID = theForm.attr("id");
      let formMessage = theForm.closest('div.pom-formstack-submit-internal').attr('data-submitted-message');
      if (typeof formMessage === 'undefined' || formMessage == '') {
        formMessage = 'Thank you! Your form has been submitted.';
      }
      setTimeout(function () {
        if ((theForm.find('.fsError')).length == 0) {
          theForm.closest(".fsBody").hide().before("<p>" + formMessage + "</p>");
        }
      }, 500);
    });
    
    // Submit Button Click Handler
    $("div.pom-formstack-submit-internal .fsSubmitButton").click(function () {
      console.log("FormstackClick");
      var tempID = jQuery(this).closest(".fsForm").attr("id");
      if (jQuery("#pom-fsHiddenIframe_" + tempID).length == 0) {
        jQuery(this).closest(".fsForm").after("<iframe id='pom-fsHiddenIframe_" + tempID + "' name='pom-fsHiddenIframe_" + tempID + "' style='display: none;'></iframe>");
      }
      jQuery(this).closest(".fsForm").attr('target', 'pom-fsHiddenIframe_' + tempID);
    });
    /* END formstack internal posting */
  }

  const formstackExternalResponse = () => {
    if(jQuery("div.pom-formstack-submit-external").length) {
      if (jQuery.url.param("submitted") == "submitted") {
        var formMessage = jQuery('div.pom-formstack-submit-external').attr('data-submitted-message');
         if(typeof formMessage === 'undefined' || formMessage == ''){
         formMessage = 'Thank you! Your form has been submitted.';
         }
        jQuery("#main-content .page-title").after('<p class="submitted-message">'+formMessage+'</p>');
          }
      }  
  }

  const accessibleMenuLinks = () => {
    let footerLinks = $('footer nav .menu .menu__item a');
    let quicklinks = $('header .quicklinks nav#block-quicklinks-2 .menu .menu__item a');
    let pagesFor = $('header .quicklinks nav#block-audiencenavigation-2 .menu .menu__item a');
    $.each(footerLinks, function(i, v) {
      let label = 'Pomona College - ' + v.text;
      $(this).attr('aria-label', label);
    });
    $.each(quicklinks, function(i, v) {
      let label = 'Quicklink - Pomona College ' + v.text;
      $(this).attr('aria-label', label);
    });
    $.each(pagesFor, function(i, v) {
      let label = 'Quicklink - Pages For ' + v.text;
      $(this).attr('aria-label', label);
    });
  }

  // Trigger Enhance
  $(document).ready(function () {
    offcanvas();
    lightbox();
    featurevideo();
    accordion();
    accordionToTabs();
    formstackResponse();
    formstackExternalResponse();
    accessibleMenuLinks();

    $(".editorial table").rtResponsiveTables();
  });

})(jQuery);