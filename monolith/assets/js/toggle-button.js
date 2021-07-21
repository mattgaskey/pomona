(()=> {
  const $ = jQuery;
  
  function toggleTheThings() {
    $('.collapsing-block').on('click', '.toggle', function(e) {
      
      const $control = $(this);
      const $controlled = $control.parents('.collapsing-block').find('.reveal');
      const $sibControl = $control.parents('.collapsing-block').siblings('.collapsing-block');
      const $sibButton = $sibControl.find('button.toggle');
      const $sibling = $sibControl.find('.reveal');
      const sibVisible = $sibling.is(':visible');
      const focusOn = $control.parents('.collapsing-block').find('input.focus-on');
      
      const afterToggle = () => {
        const visible = $controlled.is(':visible');
        $control.attr( {'aria-expanded': visible } );
        $controlled.attr( {'hidden' : !visible } );
        if(visible && focusOn) {
          $(focusOn).focus();
        }
        if (sibVisible) {
          $sibButton.attr( {'aria-expanded': !sibVisible } );
          $sibling.attr( {'hidden' : !sibVisible } );
        }
      };

      // Respect the operating system accessibility setting for reduced motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      $controlled.slideToggle((mediaQuery.matches) ? 0 : 250, afterToggle);
      if (sibVisible) {
        $sibling.slideToggle((mediaQuery.matches) ? 0 : 250, afterToggle);
      }
    });
  }

  $(document).ready( function(){
    toggleTheThings();
  });
})();