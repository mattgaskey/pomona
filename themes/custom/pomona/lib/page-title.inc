<?php

use Drupal\node\Entity\Node;

function pomona_preprocess_page_title(&$variables) {
  if ($display_id = \Drupal::request()->attributes->get('display_id')) {
    if ($display_id == "misc") {
      $variables['title'] = 'Directory';
    }
  }
}