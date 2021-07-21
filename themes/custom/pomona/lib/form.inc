<?php

use Drupal\Core\Form\FormStateInterface;

/**
 * Implements hook_form_alter().
 */
function pomona_form_alter(&$form, FormStateInterface $form_state, $form_id) {
  if ($form_id == 'views_exposed_form' && $form_state->getStorage('view')['view']->id() == 'news') {
    // Disable auto submit for search text field.
    if (isset($form['keys'])) {
      $form['keys']['#attributes']['data-bef-auto-submit-exclude'] = '1';
    }
  }
}