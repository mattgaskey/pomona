<?php

/**
 * Implements hook_preprocess_node().
 */
function pomona_preprocess_node(array &$variables) {
  $node = $variables['node'];
  $type = $node->bundle();

  $url = $node->url();
  $variables['url'] = $url;
  // Sometimes, we need the url path from the browser instead of the router
  $current_path = \Drupal::service('path.current')->getPath();
  $variables['current_path'] = $current_path;

  // Figure out if the user is admin or content admin
  $user = $variables['user'];
  $roles = $user->getAccount()->getRoles();
  $is_admin = in_array('content_ad', $roles) || in_array('administrator', $roles);
  $variables['can_redirect'] = $is_admin;

  // The 'class' field on a node, when present, may drive the
  // layout options for the node. 
  $nodeClass = ($node->hasField('field_class')) ? $node->get('field_class') : null;
  if(!empty($nodeClass) && !empty($nodeClass->first()) && $nodeClassValue = $nodeClass->first()->getValue()) {
    $variables['node_class'] = $nodeClassValue['value'];
    $variables['node_layout'] = "@pomona/includes/node__${variables[node_class]}.twig";
  }

  if ($url == '/admissions-aid') {
    $variables['node_special'] = 'admissions';
  }
  if($url == '/alumni-families') {
    $variables['node_special'] = 'alumni-families';
  }

  // Extract the title without any wrappers so we can
  // choose classnames, tags in the larger template without
  // overriding so many field templates
  $variables['raw_title'] = $node->label();

  // Check for presence/ absence of media
  if ($node->hasField('field_media')) {
    $node_media = $node->get('field_media')->first();
    $variables['has_image'] = ($node_media !== NULL);
  }

  // Check for presence/ absence of video
  if ($node->hasField('field_slide_video')) {
    $node_video = $node->get('field_slide_video')->first();
    $variables['has_video'] = ($node_video !== NULL);
    if($variables['has_video']) {
      $node_video_entity = $node->get('field_slide_video')->referencedEntities()[0];
      $variables['video_type'] = $node_video_entity->bundle();
    } else {
      $variables['video_type'] = '';
    }
  }

  // Sometimes the body copy is present, sometimes it is not.
  $bodyContent = ($node->hasField('body')) ? $node->get('body') : null;
  $variables['has_body'] = (!empty($bodyContent) && !empty($bodyContent->first()));

  $variables['is_front'] = \Drupal::service('path.matcher')->isFrontPage();  

  // Call the preprocessor for this content type, if it exists.
  $fn = "pomona_preprocess_" . $type;
  
  if(function_exists($fn)) {
    $fn($variables);
  }

  $variables['#cache']['contexts'][] = 'url.path.is_front';
}

// Preprocessor for the campus alert page
function pomona_preprocess_campus_alerts(&$variables) {
  $f = $variables['node']->getFields(false);
  $variables['show_banner_alert'] = ('1' === $f['field_enable_banner_alert']->first()->getValue()['value']);
  $variables['show_page_alert'] = ('1' === $f['field_enable_page_alert']->first()->getValue()['value']);
}

// Preprocessor for the person content type
function pomona_preprocess_person(&$variables) {
  if ($variables['view_mode'] !== 'full') return;
  $f = $variables['node']->getFields(false);
  
  // Check every field and see whether or not it has content,
  // set a 'has_' boolean for each
  foreach($f as $name => $value) {
    if (!strstr($name, 'field')) continue;
    $variables['has_' . $name] = (!$value->isEmpty());
  }

  // set some booleans to see whether or not each tab has content.
  // If you change the fields attached to these tabs, you will need
  // to change the associated logic.   
  $tabs = [
    'expertise' => [
      $f['field_expertise'],
      $f['field_person_areas_of_expertise'],
      $f['field_research_interests']
    ],
    'work' => [
      $f['field_work_body'],
      $f['field_person_media_gallery']  
    ],
    'education' => [
      $f['field_education'],
      $f['field_professional_experience'],
      $f['field_qualifications_certificati'],
      $f['field_recent_courses']
    ],
    'awards' => [
      $f['field_awards_text']
    ],
    'additional' => [
      $f['field_additional_tabs']
    ]
  ];

  foreach($tabs as $tab => $tabfields) {
    $variables['has_' . $tab] = array_reduce($tabfields,'nullChecker', false);
  }

  $variables['has_tabs'] = false;
  foreach(array_keys($tabs) as $tab) {
    $variables['has_tabs'] = $variables['has_tabs'] || $variables['has_' . $tab];
  }
}

// Preprocesser for the office content type
function pomona_preprocess_office(&$variables) {
  if ($variables['view_mode'] !== 'office_contact') return;
  $node = $variables['node'];
  if ($node->field_phone->value) {
    $phone_override = $node->field_phone->value;
    if ($node->field_primary_contact) {
      $node->field_primary_contact->entity->field_office_phone->value = $phone_override;
    }
  }
  if ($node->field_e_mail->value) {
    $email_override = $node->field_e_mail->value;
    if ($node->field_primary_contact) {
      $node->field_primary_contact->entity->field_e_mail->value = $email_override;
    }
  }

}

function nullChecker($carry, $item) {
  return $carry || !$item->isEmpty();
}


use Drupal\Core\Template\Attribute; // this should be at the top of your MY_THEME.theme file

// Preprocessor for breadcrumbs
// Add the node title to the end of altered breadrumbs
// from easy_breadcrumb module rules
function pomona_preprocess_breadcrumb(&$variables) {
  $uri = \Drupal::request()->getRequestUri();
  $pattern = '/news\/\d{4}|academics\/majors\/.+/';
  $add_title = preg_match($pattern, $uri);
  
  if ($variables['breadcrumb'] && $add_title) {
    $request = \Drupal::request();
    $route_match = \Drupal::routeMatch();
    $page_title = \Drupal::service('title_resolver')->getTitle($request, $route_match->getRouteObject());
    
    if (!empty($page_title)) {
      $variables['breadcrumb'][] = [
        'text' => $page_title,
        'attributes' => new Attribute(['class' => ['active']])
      ];
    }
  }
}
