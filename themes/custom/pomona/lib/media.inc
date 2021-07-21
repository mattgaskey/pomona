<?php

/**
 * Implements hook_preprocess_entity_embed_container().
 */
function newcity_preprocess_entity_embed_container(&$variables) {
  // Add the view mode as a class.
  $variables['attributes']['class'][] = $variables['element']['entity']['#view_mode'];
}
