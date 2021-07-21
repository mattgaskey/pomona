<?php
# modules/custom/my_custom_module/src/Plugin/migrate/process/Youtube.php
namespace Drupal\imports\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;

/**
 * Custom process plugin to convert youtube scheme uri to video url.
 *
 * @MigrateProcessPlugin(
 *   id = "vimeo_uri"
 * )
 */
class VimeoURI extends ProcessPluginBase {

  const SCHEME = 'vimeo://v/';
  const BASE_URL = 'https://vimeo.com/';

  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    // Convert vimeo scheme uri to video url.
    if (strpos($value, static::SCHEME) !== FALSE) {
      $value = static::BASE_URL . str_replace(static::SCHEME, '', $value);
    }
    else {
      $value = NULL;
    }
    return $value;
  }

}