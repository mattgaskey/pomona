<?php

/**
 * @file
 * Contains \Drupal\directory_redirect\EventSubscriber\DirectoryRedirectSubscriber.
 */

namespace Drupal\directory_redirect\EventSubscriber;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class DirectoryRedirectSubscriber implements EventSubscriberInterface {
  const FIELD_NAME = "field_show_profile_page";
  const MODULE_NAME = "directory_redirect";

  public function checkForRedirection(GetResponseEvent $event) {
      $baseUrl = $event->getRequest()->getBaseUrl();

      $route_match = \Drupal::routeMatch();

      // Check to make sure we're on a page (not form) view
      if($route_match->getRouteName() !== 'entity.node.canonical') return;
      $node = $route_match->getParameter('node');

      $type= $node->get('type')->getString();
      if($type === "person") {
        // if this is a person content type and the profile page checkbox 
        // is not checked, we redirect to the directory.
        try {
          if ($node->hasField(self::FIELD_NAME)) {
            $has_profile = $node->get(self::FIELD_NAME)->getString();
            if(empty($has_profile)) {
              $event->setResponse(new RedirectResponse($baseUrl.'/people'));
            }
          } else {
            $warning = "People content type missing field_profile_page";
            \Drupal::logger(self::MODULE_NAME)->error($warning);  
          }
        } catch (Exception $e) {
          \Drupal::logger(self::MODULE_NAME)->error($e->getMessage());
          if (function_exists('ksm')) {
            ksm($e->getMessage);
          }
        }
      }
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events[KernelEvents::REQUEST][] = array('checkForRedirection');
    return $events;
  }

}