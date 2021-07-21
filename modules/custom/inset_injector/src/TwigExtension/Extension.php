<?php

namespace Drupal\inset_injector\TwigExtension;

use Drupal\Core\Render\Element;
use Drupal\taxonomy\Entity\Term;
use Drupal\image\Entity\ImageStyle;
use Drupal\Core\TypedData\Plugin\DataType\ItemList;
use Drupal\Core\Entity\ContentEntityBase;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\Core\Render\Markup;
use Twig_Environment;
use Twig_Extension;

/**
 * Newcity theme support.
 */
class Extension extends Twig_Extension {
  /**
   * Gets a unique identifier for this Twig extension.
   */
  public function getName() {
    return 'inset_injector.twig_extensions';
  }

  /**
   * Generates a list of all Twig filters that this extension defines.
   */
  public function getFilters() {
    return [
      // remove HTML comments from markup
      new \Twig_SimpleFilter('inject', [$this, 'injectField'])
    ];
  }

  /**
   * Generates a list of all Twig functions that this extension defines.
   */
  public function getFunctions()
  {
    return [];
  }


  private function _prepInsets($insets) {
    if(!isset($insets['#items'])) {
      return [];
    }
    $inset_raw = $insets['#items'];
    $num_insets = $inset_raw->count();
    $insets_processed = [];

    for($i = 0; $i < $num_insets; $i++) {
      $pid = $inset_raw->get($i)->getValue();
      $p = Paragraph::load($pid['target_id']);
      $paragraphType = $p->type->entity->id;
      $paragraphIndex = $p->get('field_media_paragraph_placement')->value;
      $hasAlignment = $p->hasField('field_media_alignment');
      $paragraphAlign = $hasAlignment ? $p->get('field_media_alignment')->value : 'full';
      $insets_processed[] = [
        "position" => $paragraphIndex,
        "alignment" => $paragraphAlign,
        "type" => $paragraphType,
        "view" => render($insets[$i])
      ];
    }

    return $insets_processed;  
  }

  /* 
   * Preps accordion data by rendering the accordions and logging which
   * paragraph number they are supposed to appear above. All accordions
   * that do not have a paragraph number assigned are also concatenated
   * and returned for placement at the end of the body.
   */
  private function _prepAccordions($accordions) {
    if(!isset($accordions['#items'])) {
      return [[],""];
    }
    $accordions_raw = $accordions['#items'];
    $num_accordions = $accordions_raw->count();
    $accordions_processed = [];

    $remainder = "";

    for($i = 0; $i < $num_accordions; $i++) { 
      $pid = $accordions_raw->get($i)->getValue();
      $p = Paragraph::load($pid['target_id']);
      $paragraphIndex = $p->get('field_media_paragraph_placement')->value;

      $temp = [
        "position" => $paragraphIndex,
        "view" => render($accordions[$i])
      ];

      if($paragraphIndex === null) {
        $remainder .= render($accordions[$i]);
      } elseif ($paragraphIndex >= 0)  {
        $accordions_processed[] = [
          "position" => $paragraphIndex,
          "view" => render($accordions[$i])
        ];
      }      
    }

    return [ $accordions_processed, $remainder ];
  }

  /* 
   * Returns all of the insets at a specific paragraph position
   * in a single string. Depends heavily on the field structure
   * set in the insets field -- they must each have a paragraph
   * position and an alignment indicator
   */ 
  private function _insets_at_position($insets,$pos) {
    $str = "";
    foreach($insets as $inset) {
      ['alignment' => $alignment, 'position' => $position, 'type' => $type, 'view' => $view] = $inset;
      if ($position != $pos) continue;
      $className = "inset inset--{$alignment} inset--{$type}";
      $markup = $view->__toString();
      // convert to an aside. Ideally this would use a template to do so,
      // but we're shelving that exercise for another day.
      $str .= "<aside class=\"${className}\">{$markup}</aside>";
    }
    return $str;    
  }

  /* 
   * Concatinates all of the accordions at a specified position.
   */
  private function _accordions_at_position($accordions,$pos) {
    $str = "";
    foreach($accordions as $accordion) {
      ['position' => $position, 'view' => $view] = $accordion;
      if ($position != $pos) continue;
      $str .= $view->__toString();
    }
    return $str;
  }

  /* 
   * This twig function takes "destination" as the filtered value and "insets" as an array 
   * of inset objects. This is designed specifically to operate on the "body" field and 
   * "insets" field -- if it needs to be used in other instances, this will probably need
   * a lot more expansion.
   */
  public function injectField($source, $insets, $accordions = []) {
    if(gettype($source) === 'array') {
      $rendered = render($source);
      $destination = ($rendered === '') ? '' : $rendered->__toString();
    } else {
      $destination = $source;
    }
    if($destination === '') return $source; // Handle empty body text, for example on the home page.
    $insets = $this->_prepInsets($insets);
    list($accordionsPos,$accordionsRemainder) = $this->_prepAccordions($accordions);
    $destination_array = explode("<p",$destination);
    $paragraphs = count($destination_array);
    $workingString = "";
    for($i = 0; $i < $paragraphs; $i++) {
      $insetString = $this->_insets_at_position($insets, $i);
      $accordionsString = $this->_accordions_at_position($accordionsPos, $i);
      if($i === 0) {
        $workingString .= $destination_array[$i];
      } else {
        $workingString .= $insetString . $accordionsString . '<p' . $destination_array[$i];
      }
    }
    $workingString .= $accordionsRemainder;
    return Markup::create($workingString);
  }
}


