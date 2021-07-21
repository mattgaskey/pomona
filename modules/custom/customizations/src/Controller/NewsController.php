<?php

namespace Drupal\customizations\Controller;

use Drupal\Core\Controller\ControllerBase;
use JsonSchema\Uri\Retrievers;
/**
 * Fetch and rewrite Claremont news feed.
 */
class NewsController extends ControllerBase {

  private function fetch_news($url){
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $output = curl_exec($ch);
    curl_close($ch);
    
    $search = ['/<response>/i','/<\/response>/','/<item[ key=\"\d+\"]*>/i','/<\/item>/i'];
    $replace = ['<news>','</news>','<story>','</story>'];
    $output = preg_replace($search,$replace,$output);
    return $output;
  }


  public function claremontnews() {
    $output = $this->fetch_news(\Drupal::request()->getSchemeAndHttpHost()."/claremont-news-story-export-pre.xml");
    header('Content-Type: application/xml; charset=utf-8');
    die ($output);
  }

  public function newsstoryexport() {
    $output = $this->fetch_news(\Drupal::request()->getSchemeAndHttpHost()."/news-story-xml-to-rss-export-pre.xml");
    header('Content-Type: application/xml; charset=utf-8');
    die ($output);
  }


}
