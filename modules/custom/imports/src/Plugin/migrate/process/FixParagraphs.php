<?php

namespace Drupal\imports\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;
use Drupal\migrate\MigrateSkipProcessException;
use Drupal\migrate\MigrateException;

/**
* Remove blank paragraphs, convert divs to paragraphs
*
* @MigrateProcessPlugin(
*   id = "fix_paragraphs"
* )
*/
class FixParagraphs extends ProcessPluginBase {

  /**
   * div -> p
   *
   * @param string $value
   * @return string
   */
  protected function replaceDivs($value) {
    $value = str_replace(['<div>', '</div>'], ['<p>', '</p>'], $value);
    return $value;
  }

  /**
   * remove paragraphs without any content
   *
   * @param string $value
   * @return string
   */
  protected function removeBlanks($value) {
    $value = preg_replace("/<p>(?:&nbsp;|\s)*<\/p>/", "", $value);
    return $value;
  }

  /**
  * {@inheritdoc}
  */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    
    if (empty($value)) {
      throw new MigrateException('Required content needed');
    }
    
    $value = $this->replaceDivs($value);
    $value = $this->removeBlanks($value);
    
    return $value;
  }
  
}