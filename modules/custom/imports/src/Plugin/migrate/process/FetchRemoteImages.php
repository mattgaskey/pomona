<?php

namespace Drupal\imports\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;
use Drupal\migrate\MigrateSkipProcessException;
use Drupal\migrate\MigrateException;
use Drupal\media\Entity\Media;
use Drupal\file\Entity\File;

/**
 * Parses content for image references, downloads images, creates file/media entities, updates content
 *
 * @MigrateProcessPlugin(
 *   id = "fetchremoteimages"
 * )
 */

class FetchRemoteImages extends ProcessPluginBase {

    var $remote_site = 'http://news.vcom.edu';

    /**
     * Given URL of remote image, downloads image, creates associated file and media entities, returns uuid of media entity
     */
    private function save_image($remote_image,$alt){
        $image = new RemoteImage($remote_image);
        $media_entity = $image->save_image_locally($alt);
        return $media_entity->uuid();
    }


    /**
     * Given a media entity uuid and alignment, generates a Drupal-entity tag suitable for embedding in visual editor.
     */
    private function generate_drupal_entity_markup($uuid,$alignment=null){
        
        $view_mode = 'media.half_width';
        
        // create data_align attribute, if applicable
        $data_align='';
        if ($alignment) $data_align='data-align="'.$alignment.'"';

        // create appropriate view mode based on alignment
        if (strlen($data_align)){
            $view_mode = 'view_mode:media.half_width';
        }else{
            $view_mode = 'view_mode:media.full';
        }
        
        // generate drupal entity and return
        $output = '<drupal-entity '.$data_align.' data-embed-button="media" data-entity-embed-display="'.$view_mode.'" data-entity-type="media" data-entity-uuid="'.$uuid.'"></drupal-entity>';
        return $output;

    }


    /**
     * Checks a style string to determine if there's a left, right, or no float, returns correct float
     */
    private function determine_alignment($style){

        if (preg_match("/float:\s*left/",$style)){
            $alignment='left';
        }elseif (preg_match("/float:\s*right/",$style)) {
            $alignment='right';
        }else {
            $alignment=null;
        }
        return $alignment;

    }


    /**
     * Returns array of image tags within a block of HTML content
     */
    private function find_images($content){
        $result=[];
        preg_match_all('/<img[^>]+>/i',$content, $result); 
        if (isset($result[0])){
            return $result[0];
        } else {
            return [];
        }
    }


    /**
     * Replaces image tags with drupal entity tags, fetching the images from remote location and saving locally
     */
    private function fetch_and_replace_images($content){
        
        $updated_content = $content;
        $images = $this->find_images($content);

        foreach ($images as $image_tag){  

            $doc = new \DOMDocument();
            @$doc->loadHTML($image_tag);
            $tags = $doc->getElementsByTagName('img');
            foreach ($tags as $tag) {
                if (substr($tag->getAttribute('src'), 0, 1)=='/'){
                    $url_to_filename = $this->remote_site.$tag->getAttribute('src');
                }else{
                    $url_to_filename = $tag->getAttribute('src');
                }
                echo "\n".'fetching '.$url_to_filename;
                $alt = $tag->getAttribute('alt');
                $uuid = $this->save_image($url_to_filename,$alt);
                $style = $tag->getAttribute('style');
                
                
                $alignment = $this->determine_alignment($style);
                $replace = $this->generate_drupal_entity_markup($uuid,$alignment);
                
                $updated_content = str_replace($image_tag,$replace,$updated_content);
            }
        }
        
        return $updated_content;    

    } 


  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    
    if (empty($value)) {
        throw new MigrateException('Required content needed');
    }
    
    return $this->fetch_and_replace_images($value);
    
  }

}
