<?php

/**
 * @file
 * Contains \Drupal\imports\Plugin\migrate\process\EntityLookupMulti.
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
 *   id = "entity_lookup_multi"
 * )
 */
class EntityLookupMulti extends EntityLookup implements ContainerFactoryPluginInterface {
  /**
   * {@inheritdoc}
   */
    
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    $result = null;
    if (!empty($this->configuration['bundles']) && is_array($this->configuration['bundles'])) {
      $bundles = $this->configuration['bundles'];
      foreach($bundles as $bundle) {
        $this->configuration['bundle'] = $bundle;
        $result = parent::transform($value, $migrate_executable, $row, $destination_property);
        if(!empty($result)) {
          break;
        }
      }
      return $result;
    } else {
      return parent::transform($value, $migrate_executable, $row, $destination_property);  
    }
  }
}

?>