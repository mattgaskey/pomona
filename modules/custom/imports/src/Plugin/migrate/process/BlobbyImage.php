<?php

namespace Drupal\imports\Plugin\migrate\process;

use Drupal\migrate\MigrateException;
use Drupal\media\Entity\Media;
use Drupal\file\Entity\File;

/**
 * Class to manage pulling in of remote image
 */
class BlobbyImage {
    // stores the URL of a remote image
    var $remote_image = null;
    var $uri = null;

    /**
     * Constructor
     */
    public function __construct($remote_image=null,$uri=null){
        $this->remote_image=$remote_image;
        $this->uri = $uri;
    }

    /**
     * Saves a remote image as a file, then creates image media entity
     * 
     * @return 
     * The created or found media entity
     */
    public function save_image_locally($alt=''){
        $file = $this->remote_image;
        $file_id = (int)$file->id();

        // check to see if this image already exists as a file entity
        $files = \Drupal::entityTypeManager()->getStorage('file')->loadByProperties(['uri' => $this->uri]);
        if (count($files)>0){
            $first_file = array_shift(array_slice($files, 0, 1)); 
            $file_id = (int)$first_file->id();
        }else{
            $file_id = null;
        }

        $media = \Drupal::entityTypeManager()->getStorage('media')->loadByProperties(['field_media_image.target_id' => $file_id]);

        // if so, load media entity
        if (count($media)>0){
            $media_entity = array_shift(array_slice($media, 0, 1)); 
            $media_id = (int)$media_entity->id();
        } else {
            $media_id = null;
            $media_entity = Media::create([
                'bundle' => 'image',
                'uid' => \Drupal::currentUser()->id(),
                'langcode' => \Drupal::languageManager()->getDefaultLanguage()->getId(),
                'field_media_image' => [
                    'target_id' => $file_id,
                    'alt' => substr($alt,512)
                ],
            ]);
        }

        $media_entity->save();
        

        // return media entity
        return $media_entity;
    }

}
