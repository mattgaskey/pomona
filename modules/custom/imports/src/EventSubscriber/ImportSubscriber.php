<?php 
namespace Drupal\imports\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Drupal\migrate\Event\MigrateEvents;
use Drupal\migrate\Event\MigrateImportEvent;
use Drupal\migrate\Event\MigratePostRowSaveEvent;
use Drupal\migrate\Plugin\Migration;
use Drupal\node\Entity\Node;

/* 
 * this event subscriber listens to migration events and keeps track 
 * of entered/updated node ids, then removes / unpublishes content
 * in the system that are not present in the current data import.
 * 
 * This only affects migrations that have the appropriate function
 * names defined, so to add another processor to the list you can
 * just copy and rename the existing functions, then tweak them
 * for the additional functionality you may need. 
 */
class VCOMImportSubscriber implements EventSubscriberInterface {

  private $class_dest_ids = [];
  private $event_dest_ids = [];
  private $emergency_dest_ids = [];

  // Which events we are listening to, and then which function needs
  // to be called. Here we are assigning generic handlers to the
  // import, post import, and post row save events. 
  public static function getSubscribedEvents() {
    $events[MigrateEvents::PRE_IMPORT][] = ['onPreImport'];
    $events[MigrateEvents::POST_IMPORT][] = ['onPostImport'];
    $events[MigrateEvents::POST_ROW_SAVE][] = ['onPostRowSave'];
    return $events;
  }

  // Generic handlers
  // -------
  // Our generic handlers find out which migration is being listened
  // to, and then attempt to call migration-specific handlers for 
  // this event.
  
  // Runs at the start of every import
  public function onPreImport(MigrateImportEvent $event) {
    $migration = $event->getMigration();
    $fn = 'preprocess_' . $migration->getPluginId();
    if (method_exists($this,$fn)) {
      $this->$fn($migration);
    }
  }

  // Runs on each successfully saved row
  public function onPostRowSave(MigratePostRowSaveEvent $event) {
    $migration = $event->getMigration();
    $fn = 'postsave_' . $migration->getPluginId();
    if (method_exists($this,$fn)) {
      $this->$fn($event->getDestinationIdValues());
    }
  }  

  // Runs at the end of every import
  public function onPostImport(MigrateImportEvent $event) {
    $migration = $event->getMigration();
    $fn = 'postprocess_' . $migration->getPluginId();
    if (method_exists($this,$fn)) {
      $this->$fn($migration);
    }
  }

  // Course handlers
  // -------
  // These handle the import and purge of course material from the database

  // Initialize the list of imported destination IDs
  // Ensure this migration always runs in "update" mode
  public function preprocess_classes(Migration $migration) {
    // Initialize the list of imported destination IDs
    // Ensure this migration always runs in "update" mode
    $this->class_dest_ids = [];    
    $migration->getIdMap()->prepareUpdate();
  }

  // When a row is saved, add the destination values to the
  // saved values
  public function postsave_classes(array $destValues) {
    $merged = array_merge($this->class_dest_ids, $destValues);
    $this->class_dest_ids = $merged;
  }

  // At the end of the import, we compare the list of ids of 
  // courses we touched with the list of courses in the system.
  // Then we unpublish some, purge the really old ones. 
  public function postprocess_classes(Migration $migration) {
    $connection = \Drupal::database();

    // List of all published courses
    $nids = \Drupal::entityQuery('node')
      ->condition('type','course')
      ->condition('status',1)
      ->execute();

    // Find out which ones were published but not in the 
    // current import and unpublish those. 
    $unpublishable = array_diff($nids,$this->class_dest_ids);

    // Flag these as unpublished
    foreach($unpublishable as $upnid) {
      if (is_numeric($upnid)) {
        $upnid = intval($upnid);
        $node = Node::load($upnid);
        if($node && $node->bundle() == 'course') {
          $node->setPublished(FALSE);
          $node->set('moderation_state','draft');
          $node->save();
        }
      }
    }

    // Deletes course nodes were unpublished and older than 90 days 
    $purgeAge = strtotime('-90 days');
    $purgable = \Drupal::entityQuery('node')
      ->condition('type','course')
      ->condition('status','0')
      ->condition('changed',$purgeAge,'<')
      ->execute();

    $storage_handler = \Drupal::entityTypeManager()->getStorage("node");
    $entities = $storage_handler->loadMultiple($purgable);
    $storage_handler->delete($entities);
  }

  // Event handlers
  // -------
  // These handle the import and purge of emergency nptification material from the database

  // Initialize the list of imported destination IDs
  // Ensure this migration always runs in "update" mode
  public function preprocess_events(Migration $migration) {
    // \Drupal::logger('imports')->notice("Beginning monitored event import");
    $this->event_dest_ids = [];
    $migration->getIdMap()->prepareUpdate();
  }

  // At the end of the import, we compare the list of ids of emergencies 
  // we touched with the list of emergencies in the system. Then we unpublish 
  // some, purge the really old ones. 
  public function postsave_events(array $destValues) {
    $incoming = $destValues;
    $merged = array_merge($this->event_dest_ids, $destValues);
    $this->event_dest_ids = $merged;
  }
  
  public function postprocess_events(Migration $migration) {
    $connection = \Drupal::database();

    // Also make sure content is published
    $event_ids = \Drupal::entityQuery('node')
      ->condition('type','event')
      ->execute();

    //$processed = array_column($nids,'nid');
    $unpublishable = array_diff($event_ids,$this->event_dest_ids);
    // \Drupal::logger('imports')->notice("unpublishable " . count($unpublishable));

    // Because these are basic entities, not nodes, we need to just delete them
    //
    // If we need to keep them around, we could add an "expired" flag to this
    // and toggle that flag instead, then tweak the block view on emergencies
    $storage_handler = \Drupal::entityTypeManager()->getStorage("node");
    $entities = $storage_handler->loadMultiple($unpublishable);
    $storage_handler->delete($entities);
  } 
  
  // Emergency handlers
  // -------
  // These handle the import and purge of emergency nptification material from the database

  // Initialize the list of imported destination IDs
  // Ensure this migration always runs in "update" mode
  public function preprocess_emergency(Migration $migration) {
    $this->emergency_dest_ids = [];
    $migration->getIdMap()->prepareUpdate();
  }

  // At the end of the import, we compare the list of ids of emergencies 
  // we touched with the list of emergencies in the system. Then we unpublish 
  // some, purge the really old ones. 
  public function postsave_emergency(array $destValues) {
    $incoming = $destValues;
    $merged = array_merge($this->emergency_dest_ids, $destValues);
    $this->emergency_dest_ids = $merged;
  }
  
  public function postprocess_emergency(Migration $migration) {
    $connection = \Drupal::database();

    // Also make sure content is published
    $emergency_ids = \Drupal::entityQuery('emergency')
      ->condition('type','global_alert')
      ->execute();

    //$processed = array_column($nids,'nid');
    $unpublishable = array_diff($emergency_ids,$this->emergency_dest_ids);
    
    // Because these are basic entities, not nodes, we need to just delete them
    //
    // If we need to keep them around, we could add an "expired" flag to this
    // and toggle that flag instead, then tweak the block view on emergencies
    $storage_handler = \Drupal::entityTypeManager()->getStorage("emergency");
    $entities = $storage_handler->loadMultiple($unpublishable);
    $storage_handler->delete($entities);
  }  
}