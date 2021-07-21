<?php

/**
 * Implements theme_preprocess_eck_entity().
 */
function newcity_preprocess_eck_entity(&$variables) {
  $entity = $variables['eck_entity'];
  // Backwards compatibility.
  $variables['eck'] = $entity;
  $variables['plain_title'] = (isset($entity->title)) ?
      strip_tags($entity->title[0]->value) :
      '';
}
