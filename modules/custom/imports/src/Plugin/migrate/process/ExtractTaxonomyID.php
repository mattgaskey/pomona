<?php

/**
 * @file
 * Contains \Drupal\imports\Plugin\migrate\process\ExtractTaxonomyID.
 */

namespace Drupal\imports\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;
use Drupal\migrate\MigrateException;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\migrate_plus\Plugin\migrate\process\EntityLookup;

/**
 * This plugin changes the current value by using it for an entity property search
 * and returning an entity id.
 *
 * @MigrateProcessPlugin(
 *   id = "extract_taxonomy_id"
 * )
 */
class ExtractTaxonomyID extends ProcessPluginBase {
  /**
   * {@inheritdoc}
   */
    
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    $v = (is_array($value)) ? $value['ID'] : $value;
    return $v;
  }
}
