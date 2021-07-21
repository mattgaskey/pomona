<?php

namespace Drupal\imports\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;
use Drupal\migrate\MigrateSkipProcessException;
use Drupal\migrate\MigrateException;
use Drupal\file\FileInterface;
use Drupal\media\Entity\Media;
use Drupal\Core\Database\Database;
use Drupal\Component\Utility\Unicode;

/**
 * Gets passed a image and/or a youtube video URL.  
 * If Youtube exists, that will be the featured media, otherwise it will be image.
 *
 * @MigrateProcessPlugin(
 *   id = "addmedia"
 * )
 */


class AddMedia extends ProcessPluginBase {

  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    
    $media=null;
    $media_source = isset($value[0]) ? $value[0] : '';
    $media_alt = isset($value[1]) ? $value[1] : '';
    $media_destination = $this->configuration['media_destination'];

    if ($media_source == '') return null;

    $filename = basename($media_source);

    if (file_prepare_directory($media_destination, FILE_CREATE_DIRECTORY)) {
      if (filter_var($media_source, FILTER_VALIDATE_URL)) {
        $file_contents = file_get_contents($media_source);
      }
      $new_destination = $media_destination . $filename;
      if (!empty($file_contents)) {
        if($file = file_save_data($file_contents, $new_destination, FILE_EXISTS_REPLACE)) {
          $mimetype = $file->getMimeType();
          if(stristr($mimetype,'image')) {
            $media = Media::create([
              'bundle' => 'image',
              'uid' => \Drupal::currentUser()->id(),
              'langcode' => \Drupal::languageManager()->getDefaultLanguage()->getId(),
              'field_media_image' => [
                'target_id' => $file->id(),
                'alt' => $media_alt
              ]
            ]);
            $media->save();  
          } elseif (stristr($mimetype,'pdf')) {
            $media = Media::create([
              'bundle' => 'pdf',
              'uid' => \Drupal::currentUser()->id(),
              'langcode' => \Drupal::languageManager()->getDefaultLanguage()->getId(),
              'field_media_file' => [
                'target_id' => $file->id()
              ]
            ]);
            $media->save();  
          }
        }
      }
    }

    return $media;
    
    if (empty($value)) {
        throw new MigrateException('Required content needed');
    }

    // If Youtube ID exists, create entity and set it as the featured media
    if (strlen($value[1])){
        $youtube = new Youtube($value[1]);
        $media_id = $youtube->save();
    // If Youtube ID doesn't exist, save remote image instead, and make that the featured media
    }else{
        $remote_image = new RemoteImage();
        $media_id = $remote_image->save_from_image_tag($value[0]);
    }

    // Return ID of created media entity
    return $media_id;
    
  }

}
