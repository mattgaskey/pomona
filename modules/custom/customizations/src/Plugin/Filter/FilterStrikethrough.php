<?php

namespace Drupal\customizations\Plugin\Filter;

use Drupal\filter\FilterProcessResult;
use Drupal\filter\Plugin\FilterBase;


/**
 * @Filter(
 *   id = "filter_strike",
 *   title = @Translation("Strike Filter"),
 *   description = @Translation("Replaces s tags with del tags in output"),
 *   type = Drupal\filter\Plugin\FilterInterface::TYPE_TRANSFORM_REVERSIBLE,
 * )
 */
class FilterStrikethrough extends FilterBase {
    public function process($text, $langcode) {
        $pattern = '/(<\/?)(s)(>)/';
        $replacement = '${1}del${3}';
        $text = preg_replace($pattern, $replacement, $text);
        return new FilterProcessResult($text);
    }
}