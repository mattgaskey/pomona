<?php

namespace Drupal\customizations\Plugin\Filter;

use Drupal\filter\FilterProcessResult;
use Drupal\filter\Plugin\FilterBase;


/**
 * @Filter(
 *   id = "filter_lsep",
 *   title = @Translation("L-Sep Filter"),
 *   description = @Translation("Removes L-Sep characters from output"),
 *   type = Drupal\filter\Plugin\FilterInterface::TYPE_TRANSFORM_REVERSIBLE,
 * )
 */
class FilterCustomizations extends FilterBase {
    public function process($text, $langcode) {
        $text = str_replace("\xe2\x80\xa8", '', $text);
        return new FilterProcessResult($text);
    }
}