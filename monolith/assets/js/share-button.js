{
  const $ = jQuery;
  $('.share-button button').on('click', function(e) {
    const $control = $(this);
    const $controlled = $control.parent().find('.share-button__buttons');
    $control.toggleClass(['btn-cyan', 'btn-blue']);
    $controlled.toggleClass('hidden');
  });
  
}