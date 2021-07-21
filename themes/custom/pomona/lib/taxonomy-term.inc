<?php

/**
 * Implements hook_preprocess_taxonomy_term().
 */
function newcity_preprocess_taxonomy_term(array &$variables) {
  $term = $variables['term'];
  $vid = $term->getVocabularyId();

  // Page region injection.
  // Allowed view modes:
  $current_view_mode = $variables['view_mode'];
  $allowed_view_modes = ['full'];
  $allowed_regions = ['breadcrumbs'];

  if (in_array($current_view_mode, $allowed_view_modes)) {
    \Drupal::service('newcity_customizations.theme')->addRegionsToBuild($allowed_regions, $variables);
  }
}
