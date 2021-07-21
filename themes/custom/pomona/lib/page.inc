<?php

/**
 * Implements hook_theme_suggestions_page_alter().
 */
function pomona_theme_suggestions_page_alter(array &$suggestions, array $variables) {

  $entity_type_manager = \Drupal::entityTypeManager();
  $header_media_id = NULL;

  if ($node = \Drupal::request()->attributes->get('node')) {
    // Add content type suggestions.
    $type = $node->getType();
    array_splice($suggestions, 1, 0, 'page__node__' . $type);
  } 

  // Add a View page suggestion.
  if ($view_id = \Drupal::request()->attributes->get('view_id')) {
    array_splice($suggestions, 1, 0, 'page__view');
    array_splice($suggestions, 1, 0, 'page__view__' . $view_id);
  }
}

function pomona_preprocess_page(array &$variables) {
  $variables['type'] = ($node = \Drupal::request()->attributes->get('node')) ? $node->getType() : 'non-node';
  $variables['page_uri'] = \Drupal::request()->getRequestUri();
}