<?php

namespace Drupal\imports\Plugin\migrate\process;

use Drupal\migrate\MigrateException;
use Drupal\media\Entity\Media;
use Drupal\video_embed_media\Plugin\media\Source\VideoEmbedField;

/**
 * Youtube - generate hosted video entities from Youtube video IDs
 */

 class Youtube {

  // Youtube video ID
  var $youtube_id = null; 

  /**
   * Constructor - optionally sets Youtube video ID
   */
  public function __construct($youtube_id=null){
    $this->youtube_id=$youtube_id;
  }


  /**
   * Creates a hosted video media entity given a Youtube video ID
   * 
   * @return 
   * The ID of the created entity
   */
  public function save() {
    
    // Throw exception if Youtube video ID is not set
    if (empty($this->youtube_id)) {
        throw new MigrateException('Required content needed');
    }
    
    // Create and save entity
    $entity = Media::create([
      'bundle' => 'hosted_video',
      'field_media_video_embed_field' => [['value' => 'https://www.youtube.com/watch?v='.$this->youtube_id]],
    ]);
    $entity->save();

    // Return entity ID
    return $entity->id();
    
  }

}