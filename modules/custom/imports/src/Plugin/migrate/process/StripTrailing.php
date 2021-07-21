<?php

namespace Drupal\imports\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;
 
/**
 * Strips the trailing character from a string if it exists
 *
 * @MigrateProcessPlugin(
 *   id = "strip_trailing"
 * )
 */
class StripTrailing extends ProcessPluginBase {
 
  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    if (empty($this->configuration['character'])) {
      throw new MigrateException('character is empty');
    }
    return rtrim($value, $this->configuration['character']);
  }
 
}