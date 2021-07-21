<?php

namespace Drupal\imports\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;
 
/**
 * Determine the most recent entity revision id given an entity id
 *
 * @MigrateProcessPlugin(
 *   id = "key_wrapper"
 * )
 */
class MigrateProcessKeyWrapper extends ProcessPluginBase {
 
  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    // echo $value."\n";
    $nested_value['value'] = $value;
    return $nested_value;
  }
 
}