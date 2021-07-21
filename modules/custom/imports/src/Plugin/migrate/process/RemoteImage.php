<?php

namespace Drupal\imports\Plugin\migrate\process;

use Drupal\migrate\MigrateException;
use Drupal\media\Entity\Media;
use Drupal\file\Entity\File;

/**
 * Class to manage pulling in of remote image
 */
class RemoteImage {
    // stores the URL of a remote image
    var $remote_image = null;

    /**
     * Constructor
     */
    public function __construct($remote_image=null){
        $this->remote_image=$remote_image;
    }

    /**
     * Given an img tag, parses out src attribute and then saves the image locally
     * 
     * @return 
     * The ID of the created entity
     */
    public function save_from_image_tag($image_tag) {
        
        //require an actual img tag
        if (empty($image_tag)) {
            throw new MigrateException('Required content needed');
        }
        
        // patternmatch src attribute
        preg_match('/< *img[^>]*src *= *["\']?([^"\']*)/i', $image_tag, $matches, PREG_OFFSET_CAPTURE);
        $this->remote_image = $matches[1][0];

        // create or find local media entity for image
        $local_media = $this->save_image_locally();

        // return ID of media entity
        return $local_media->id();
        
    }

    /**
     * Check server headers for mimetype of file 
     * 
     * @return 
     * mimetype as string
     */
    private function getRemoteMimeType($url) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_exec($ch);
    
        # get the content type
        return curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    }

    /**
     * Determine appropriate image extension given mime type
     * 
     * @return 
     * Filename extension as string
     */
    private function get_image_extension($url){
        $mime = $this->getRemoteMimeType($this->getRemoteMimeType($url));
        if (is_numeric(strpos($mime,'png'))){
            return 'png';
        } elseif (is_numeric(strpos($mime,'gif'))){
            return 'gif';
        } else {
            return 'jpg';
        }
    }

    /**
     * Check to see if a remote image filename has an extension or not
     * 
     * @return 
     * Boolean
     */
    private function image_has_extension($filename){
        $last_three = substr(strtolower($filename),-3);
        if ($last_three == 'jpg' || $last_three == 'peg' || $last_three == 'png' || $last_three == 'gif'){
            return true;
        }else{
            return false;
        }
    }

    /**
     * Generates an alternate filename if the remote imagename doesn't have an extension or is too large.
     * Otherwise just returns the filename as is.
     * 
     * @return 
     * Filename string
     */
    private function generate_filename($remote_image) {
        $filesystem = \Drupal::service('file_system');
        $filename = $filesystem->basename($remote_image);
        
        //if file has no extension or is bigger than 50 characters
        if (!$this->image_has_extension($filename) || strlen($filename) > 50){
            //get the remote mime type, determine appropriate extension
            $extension = $this->get_image_extension($remote_image);
            //create hash of basename, add correct extension
            $filename = md5($filename).'.'.$extension;
        }
        
        return $filename;
        
    }

    /**
     * Saves a remote image as a file, then creates image media entity
     * 
     * @return 
     * The created or found media entity
     */
    public function save_image_locally($alt=''){
        // initializations
        $uri = 'public://'.$this->generate_filename($this->remote_image);

        // check to see if this image already exists as a file entity
        $files = \Drupal::entityTypeManager()->getStorage('file')->loadByProperties(['uri' => $uri]);
        if (count($files)>0){
            $first_file = array_shift(array_slice($files, 0, 1)); 
            $file_id = (int)$first_file->id();
        }else{
            $file_id = null;
        }

        // if not, create as file entity
        if (!$file_id){
            system_retrieve_file($this->remote_image,$uri,false);
            $filesystem = \Drupal::service('file_system');
            // Create file entity.
            $image = File::create();
            $image->setFileUri($uri);
            $image->setOwnerId(\Drupal::currentUser()->id());
            $image->setMimeType(\Drupal::service('file.mime_type.guesser')->guess($uri));
            $image->setFileName($this->generate_filename($this->remote_image));
            $image->setPermanent();
            $image->save();
            $file_id = $image->id();
        
        } else { 
            //if so, load existing file entity
            $image = $first_file;
        }

        // check to see if it's been loaded as a media entity connected to that file
        $media = \Drupal::entityTypeManager()->getStorage('media')->loadByProperties(['field_media_image.target_id' => $file_id]);

        // if so, load media entity
        if (count($media)>0){
            $media_entity = array_shift(array_slice($media, 0, 1)); 
            $media_id = (int)$media_entity->id();
        }else{
            $media_id = null;
        }

        // if not, create media entity
        if (!$media_id){

            $media_entity = Media::create([
            'bundle' => 'image',
            'uid' => \Drupal::currentUser()->id(),
            'langcode' => \Drupal::languageManager()->getDefaultLanguage()->getId(),
            'field_media_image' => [
                'target_id' => $image->id(),
                'alt' => substr($alt,512)
            ],
            ]);

            $media_entity->save();
        }

        // return media entity
        return $media_entity;
    }

}
