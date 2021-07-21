(()=> {
  
  const $ = jQuery;

  // Check device accessibility settings to see if reduce motion
  // has been turned on. If it has, then don't auto-advance slides.
  const reducedMotionState = (window.matchMedia) 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // These are all auto-advancing slideshows with a dot
  // interface (no arrows). Several selectors use the
  // same JS config but might have somewhat different
  // CSS styling.
  function simpleSlideshow() {
    $('.slideshow--simple, .slideshow--research').on('init', (e, slick) => {
      $('.slick-dots, .slick-arrow').on('click', function() {
        $('.slideshow--simple, .slideshow--research').slick('slickPause');
      });
    });
    $('.slideshow--simple, .slideshow--research').slick({
      dots: true,
      arrows: false,
      fade: true,
      lazyLoad: true,
      autoplay: !reducedMotionState,
      autoplaySpeed: 7000,
      focusOnSelect: true
    });
  }

  function presentationSlideshow() {
    $('.slideshow--presentation').on('init', (e, slick) => {
      $('.slick-dots, .slick-arrow').on('click', function() {
        $('.slideshow--presentation').slick('slickPause');
      });
    });
    $('.slideshow--presentation').slick({
      dots: false,
      arrows: false,
      fade: true,
      lazyLoad: true,
      autoplay: !reducedMotionState,
      autoplaySpeed: 7000,
      focusOnSelect: true
    });
  }  

  function arrowSlideshow() {
    $('.slideshow--top, .slideshow--detail').on('init', (e, slick) => {
      $('.slick-dots, .slick-arrow').on('click', function() {
        $('.slideshow--top, .slideshow--detail').slick('slickPause');
      });
    });
    $('.slideshow--top, .slideshow--detail').slick({
      dots: false,
      arrows: true,
      fade: true,
      autoplay: !reducedMotionState,
      autoplaySpeed: 7000,
      focusOnSelect: true
    });
  }

  function tabbedSlideshow() {
    $('.slideshow--tabbed').on('init', (e, slick) => {
      const $dots = $(slick.$dots[0]).find('button');
      const $slides = slick.$slides;
      
      $dots.each((index) => {
        const label = $($slides[index]).find('h2').text();
        const dot = $($dots[index]);
        dot.text(label);
      });

      $('.slick-dots, .slick-arrow').on('click', function() {
        $('.slideshow--tabbed').slick('slickPause');
      });
    });
    $('.slideshow--tabbed').slick({
      dots: true,
      arrows: true,
      fade: true,
      autoplay: !reducedMotionState,
      autoplaySpeed: 7000,
      focusOnSelect: true
    });
  }  

  function highlightSlideshow() {
    $('.slideshow--highlight').on('init', (e, slick) => {
      $('.slick-dots, .slick-arrow').on('click', function() {
        $('.slideshow--highlight').slick('slickPause');
      });
    });
    let detailSlide = $('.slide--detail-slide');
    let sliderDots = true;
    if (detailSlide.length > 0) {
      sliderDots = false;
    }
    console.log(sliderDots);
    $('.slideshow--highlight').slick({
      dots: sliderDots,
      arrows: true,
      fade: true,
      autoplay: true,
      autoplay: !reducedMotionState,
      autoplaySpeed: 7000,
      focusOnSelect: true
    });
  }

  function initAllSlideshows() {
    simpleSlideshow();
    arrowSlideshow();
    highlightSlideshow();
    presentationSlideshow();
    tabbedSlideshow();
  }

  $(document).ready( function(){
    initAllSlideshows();
  });
})();