<?php

/**
 * Implements hook_preprocess_field().
 */
function pomona_preprocess_field(&$variables) {
  // Mark media fields with their types.
  if ($variables['field_name'] == 'field_media') {
    $types = [];
    foreach ($variables['items'] as $item) {
      $media = $item['content']['#media'];
      if ($media) {
        $types[] = $media->bundle();
      }
    }
    if (!isset($variables['attributes']['class'])) {
      $variables['attributes']['class'] = [];
    }
    $variables['attributes']['class'] += array_unique($types);
  }

  if(!empty($variables['element']['slideshowType'])) {
    $variables['slideshowType'] = $variables['element']['slideshowType'];
  }

  // Modify Youtube Oembed markup.
  if ($variables['field_name'] == 'field_media_oembed_video') {
    $media = $variables['element']['#object'];
    $variables['attributes']['class'][] = 'responsive-embed';
    $query_params = [
      'modestbranding' => 1,
      'showinfo' => 0,
      'rel' => 0,
    ];
    foreach ($variables['items'] as $i => $item) {
      if (isset($item['content']['#context']['media'])) {
        $embed = $item['content']['#context']['media'];
        if (strpos($embed, 'title=') === FALSE) {
          $embed = str_replace('<iframe', '<iframe title="Embedded video"', $embed);
        }
        $embed = str_replace('?feature=oembed', '?' . http_build_query($query_params), $embed);
        $variables['items'][$i]['content']['#context']['media'] = $embed;
      }
    }
  }
}
