<?php

namespace Drupal\customizations\Plugin\Filter;

use Drupal\filter\FilterProcessResult;
use Drupal\filter\Plugin\FilterBase;
use Drupal\filter\Plugin\Filter\FilterUrl;


/**
 * @Filter(
 *   id = "link_urls_except_non_tld_email",
 *   title = @Translation("Convert URLs into links, leave non-TLD @ alone"),
 *   description = @Translation("Makes sure email filters work"),
 *   type = Drupal\filter\Plugin\FilterInterface::TYPE_TRANSFORM_REVERSIBLE,
 *   settings={"filter_url_length" = 72}
 * )
 */
class EmailFilter extends FilterUrl {
    public function process($text, $langcode) {
        $text = parent::process($text, $langcode);
        $text = preg_replace('/\<a href\=\"mailto\:\w+@\w+\"\>(\w+@\w+)\<\/a\>/','$1',$text);
        return new FilterProcessResult($text);
    }
}
