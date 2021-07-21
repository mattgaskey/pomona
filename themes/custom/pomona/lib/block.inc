<?php

/**
 * Implements hook_theme_suggestions_HOOK_alter() for form templates.
 */
function pomona_theme_suggestions_block_alter(array &$suggestions, array $variables) {
  // Block suggestions for custom block bundles.
  if (isset($variables['elements']['content']['#block_content'])) {
    array_splice($suggestions, 1, 0, 'block__block_content__' . $variables['elements']['content']['#block_content']->bundle());
  }
}

/**
 * Implements theme_preprocess_block().
 */
function pomona_preprocess_block(&$variables) {
  // Helper variable.
  //ksm($variables['label']);
  // $variables['content']['label_raw'] = $variables['label'];
  $block = '';
  if (isset($variables['content']['#block_content'])) {
    $block = $variables['block'] = $variables['content']['#block_content'];
  }

  // Expose the plain-text value of the color name on the
  // accent_color field. These color names should match the
  // color names in the Fractal styleguide, and we provide
  // this in plain text to the paragraph template so the
  // color names can be used in css classes.
  if ($block && $block->hasField('field_accent_color')) {
    $color = $block->get('field_accent_color')->first();
    if($color) {
      $variables['raw_accent_color'] = $color->getValue()['value'];
    }
  }

  // Explode the legacy view name into its two parts
  if ($block && $block->hasField('field_legacy_view_name')) {
    $view = $block->get('field_legacy_view_name')->first()->value;
    if($view) {
      $parts = explode('|', $view);
      $variables['view_name'] = $parts[0];
      $variables['view_variant'] = $parts[1] == 'default' ? 'block_2' : $parts[1];
    }
  }

  // Extract the view arguments if present
  if ($block && $block->hasField('field_arguments')) {
    $args = $block->get('field_arguments')->first()->value;
    if ($args) {
      $variables['view_args'] = $args;
    }
  }

  if ($block && $block->hasField('field_primary_contact')) {
    if ($block->field_primary_contact->entity->field_e_mail->value) {
      $email_override = $block->field_primary_contact->entity->field_e_mail->value;
      $block->field_primary_contact->entity->field_primary_contact->entity->field_e_mail->value = $email_override;
    }
    if ($block->field_primary_contact->entity->field_phone->value) {
      $phone_override = $block->field_primary_contact->entity->field_phone->value;
      $block->field_primary_contact->entity->field_primary_contact->entity->field_office_phone->value = $phone_override;
    }
  }
}
