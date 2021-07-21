<?php

use Drupal\menu_link_content\Entity\MenuLinkContent;

/**
 * Implements TEMPLATE_preprocess_views_exposed_form().
 */
function newcity_preprocess_views_exposed_form(&$variables) {
  $form = &$variables['form'];
  if (isset($form['start_date'])) {
    $form['#attached']['library'][] = 'newcity/mini-calendar';
  }
}

function pomona_preprocess_views_view(&$variables) {
  $view = $variables['view'];
  $id = $view->storage
    ->id();
  $variables['id'] = $id;
  $variables['display_id'] = $view->current_display;
  $variables['arg_0'] = $view->args[0];
  if ($view->id() == 'a_z_directory' && $view->current_display == 'misc') {
    // Get A-Z Link from main menu.
    $directory_uri = \Drupal::request()->getRequestUri();
    $chunks = explode('/', $directory_uri);
    $system_uri = 'route:view.a_z_directory.misc;arg_0=' . end($chunks);
    $equery = \Drupal::entityQuery('menu_link_content')
      ->condition('link.uri', $system_uri)
      ->condition('menu_name', 'main');
    $result = $equery->execute();
    $menu_link_id = (!empty($result)) ? reset($result) : FALSE;
    if ($menu_link_id) {
      // Get the link title to use as the h2 for the view page.
      $menu_link = MenuLinkContent::load($menu_link_id);
      $variables['arg_1'] = $menu_link->getTitle();
    }
  }
}
