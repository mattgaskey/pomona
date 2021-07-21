<?php

use Drupal\Core\Render\Element;

/**
 * Implements theme_preprocess_paragraph().
 */
function pomona_preprocess_paragraph(&$variables) {
  $paragraph = $variables['paragraph'];
  $type = $paragraph->bundle();
  $variables['type'] = $type;

  if($paragraph->hasField('field_lightbox')) {
    $lightboxValue = $paragraph->get('field_lightbox')->first()->getValue();
    if($lightboxValue && $lightboxValue['value'] === '1') {
      $variables['has_lightbox'] = true;
    } else {
      $variables['has_lightbox'] = false;
    }
  }

  if ($paragraph->hasField('field_slideshow_type')) {
    $slideshowTypeRaw = $paragraph->get('field_slideshow_type')->first()->getValue();
    switch($slideshowTypeRaw['value']) {
      case "1":
        $st = 'highlight';
        break;
      case "2":
        $st = 'tabbed';
      break;
      case "3":
        $st = 'presentation';
      break;
      default:
       $st = 'simple';
    }
    $variables['content']['field_paragraphs']['slideshowType'] = $st;
  }

  // Expose a boolean in the parent paragraph that describes whether 
  // or not we have a caption, which affects more than just the 
  // output of a single field in some cases.
  if ($paragraph->hasField('field_caption')) {
    $caption = $paragraph->get('field_caption')->first();
    $variables['has_caption'] = !empty($caption);
  }

  // Expose a boolean in the parent paragraph that describes whether 
  // or not we have a link, which affects more than just the 
  // output of a single field in some cases.
  if ($paragraph->hasField('field_link')) {
    $link = $paragraph->get('field_link')->first();
    $variables['has_link'] = !empty($link);
  }

  // Extract the title without any wrappers so we can
  // choose classnames, tags in the larger template without
  // overriding so many field templates
  if ($paragraph->hasField('field_title')) {
    $title = $paragraph->get('field_title')->first();
    if($title) {
      $variables['raw_title'] = $title->getValue()['value'];
    }
  }

  // Determine whether or not an accordion should start openend. This
  // value is not displayed to the user but used to affect markup…
  if ($paragraph->hasField('field_first_panel_open')) {
    $first_panel_open = $paragraph->get('field_first_panel_open')->first();
    $variables['raw_accordion_opened'] = ($first_panel_open->getValue()['value'] === "1") ? "true" : "false";
  }

  // Expose the plain-text value of the color name on the
  // accent_color field. These color names should match the
  // color names in the Fractal styleguide, and we provide
  // this in plain text to the paragraph template so the
  // color names can be used in css classes.
  if ($paragraph->hasField('field_accent_color')) {
    $color = $paragraph->get('field_accent_color')->first();
    if($color) {
      $variables['raw_accent_color'] = $color->getValue()['value'];
    }
  }

  // Expose the raw value of a twitter account name
  // to paragraphs that have that field.
  if ($paragraph->hasField('field_twitter')) {
    $tweets = $paragraph->get('field_twitter')->first();
    if($tweets) {
      $variables['raw_twitter'] = $tweets->getValue()['value'];
    }
  }  

  // Expose the uri of the link field to the parent
  // paragraph; useful for card patterns.
  if ($paragraph->hasField('field_link')) {
    $link = $paragraph->get('field_link')->first();
    if(!empty($link)) {
      $variables['linktouri'] = $link->getValue()['uri'];
    }
  }

  // Expose the url of remote video media in insets
  // Pass it to the field_media chlid
  if ($paragraph->hasField('field_media') && $paragraph->field_media->entity->field_media_oembed_video) {
    $link = $paragraph->field_media->entity->field_media_oembed_video->value;
    if(!empty($link)) {
      $variables['remotevideouri'] = $link;
    } 
  }

  // Expose the url of image media in insets
  // Pass it to the field_media chlid
  if ($paragraph->hasField('field_media') && $paragraph->field_media->entity->field_media_image) {
    $link = $paragraph->field_media->entity->field_media_image->entity->uri->value;
    if(!empty($link)) {
      $variables['imageuri'] = file_create_url($link);
    }
  }

  // Expose a boolean to templates that show
  // whether or not a slide as a video set.
  if ($paragraph->hasField('field_slide_video')) {
    $video = $paragraph->get('field_slide_video')->first();
    $variables['has_video'] = !empty($video);
  }

  // Extract a list of term ids from field_term_category
  // and join them into a comma-delimited string.
  // This preps the property for use as a view argument
  // in drupal_view() template calls. paragraph--news-inset, 
  // for example.
  if ($paragraph->hasField('field_term_category')) {
    $terms = $paragraph->get('field_term_category')->getValue();
    $terms_ids = array_column($terms,'target_id');
    $variables['term_ids'] = implode(',',$terms_ids);
  }  
  
  // Let the child entities know if there's a heading on the Paragraph.
  if ($paragraph->field_heading && $paragraph->field_heading->value) {
    if (isset($variables['content']['field_collection_items'])) {
      foreach (Element::children($variables['content']['field_collection_items']) as $key) {
        $variables['content']['field_collection_items'][$key]['#attributes']['data-has-parent-heading'] = 1;
      }
    }
  }

  // Let children know if they are two-up.
  if ($paragraph->field_two_up && $paragraph->field_two_up->value) {
    if (isset($variables['content']['field_collection_items'])) {
      foreach (Element::children($variables['content']['field_collection_items']) as $key) {
        $variables['content']['field_collection_items'][$key]['#attributes']['data-is-two-up'] = 1;
      }
    }
  }

  // Let grid item know what type of parent paragraph it belongs to
  if ($paragraph->field_grid_items) {
    foreach (Element::children($variables['content']['field_grid_items']) as $key) {
      $variables['content']['field_grid_items'][$key]['#attributes']['list-type'] = $paragraph->bundle();
    }
  }
  // Add feature theming.
  if ($type == 'feature_panel') {
    if (isset($variables['content']['field_content_reference'])) {
      foreach (Element::children($variables['content']['field_content_reference']) as $key) {
        if ($paragraph->field_scheme->entity && $paragraph->field_scheme->entity->field_scheme) {
          $variables['content']['field_content_reference'][$key]['#attributes']['data-variant'][] = $paragraph->field_scheme->entity->field_scheme->value;
        }
        if ($paragraph->field_fancy->value) {
          $variables['content']['field_content_reference'][$key]['#attributes']['data-variant'][] = 'feature--fancy';
        }
        if ($paragraph->field_flip->value) {
          $variables['content']['field_content_reference'][$key]['#attributes']['data-variant'][] = 'feature--aside-reversed';
        }
      }
    }
  }

  // Alert expiration.
  if ($type == 'alert') {
    if (count($paragraph->field_expires_on)) {
      // Blow out the cache.
      $variables['#cache']['max-age'] = 0;
      if (strtotime($paragraph->field_expires_on->value) < \Drupal::time()->getCurrentTime()) {
        $variables['expired'] = TRUE;
      }
    }
  }

  $func = 'pomona_preprocess_paragraph_' . $type;
  if(function_exists($func)) {
    $func($variables);
  }

  // Add in the node title just in case.
  if ($entity = $paragraph->getParentEntity()) {
    if ($entity instanceof Drupal\node\Entity\Node) {
      $variables['node_title'] = $entity->getTitle();
    }
  }

  // Inject breadcrumbs in the page header.
  if (in_array($variables['type'], ['simple'])) {
    \Drupal::service('newcity_customizations.theme')->addRegionsToBuild(['breadcrumbs'], $variables);
  }
}

function pomona_preprocess_paragraph_accordion_item(&$variables) {
  try {
    $isOpen = ($variables['content']['field_display_accordion_open']['0']['#markup'] === 1);
    $variables['accordion_pane_open'] = ($isOpen) ? "true" : "false";
  } catch (Exception $e) {
    $variables['accordion_pane_open'] = "false";
  }
}

function pomona_preprocess_paragraph_additional_tabs(&$variables) {
  if(isset($variables['content']['field_sidebar_blocks'])) {
    $sidebar_blocks = $variables['content']['field_sidebar_blocks'];
    $variables['has_sidebar_items'] = (count($sidebar_blocks['#items']) > 0);
  } else {
    $variables['has_sidebar_items'] = false;
  }
}

function pomona_preprocess_paragraph_detailed_slide(&$variables) {
  if(!empty($variables['content']['field_slide_url']['#items'])) {
    $buttons = $variables['content']['field_slide_url']['#items'];
    $total = $buttons->count();
    $links = [];
    for ($i = 0; $i < $total; $i++) {
      $links[] = $buttons->get($i)->getValue();
    }
    $variables['buttons'] = json_decode(json_encode($links));
  }
  if(isset($variables['content']['field_caption_title'])) {
    $caption_title = $variables['content']['field_caption_title'][0]['#context']['value'];
    $variables['caption_title'] = $caption_title;
  }
}

function pomona_preprocess_paragraph_social_media(&$variables) {
  $p = $variables['elements'];
  $fields = ['facebook_url','twitter_url','linkedin_url','instagram_url','youtube_url'];
  $accounts = [];
  foreach($fields as $f) {
    $fv = $p['field_' . $f];
    if(!empty($fv) && !empty($fv[0])) {
      $accounts[] = $fv;
    }
  }
  $variables['accounts'] = $accounts;
}
