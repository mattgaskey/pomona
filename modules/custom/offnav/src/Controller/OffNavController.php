<?php 
namespace Drupal\offnav\Controller;

use Drupal\Core\Controller\ControllerBase;
use \Drupal\block\Entity\Block;

class OffNavController extends ControllerBase {
  private function getRegion($region) {
    $theme = \Drupal::theme()->getActiveTheme()->getName();

    $regionProps = [
      'theme' => $theme,
      'region' => $region
    ];
    
    $blocks = \Drupal::entityTypeManager()->getStorage('block')->loadByProperties($regionProps);
    
    if(empty($blocks) || count($blocks) === 0 ) return;

    uasort($blocks, 'Drupal\block\Entity\Block::sort');
    $build = [];
    foreach ($blocks as $key => $block) {
      if ($block->access('view')) {
        $block = Block::load($key);
        $build[$key] = \Drupal::entityTypeManager()->getViewBuilder('block')->view($block);
      }
    }

    return $build;
  }

  public function mobile1() {    
    return $this->getRegion('offcanvas_first');
  }

  public function mobile2() {    
    return $this->getRegion('offcanvas_second');
  }
}