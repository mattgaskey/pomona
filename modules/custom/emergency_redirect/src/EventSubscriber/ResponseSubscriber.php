<?php

namespace Drupal\emergency_redirect\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\Event;
use Drupal\Core\Routing\CurrentRouteMatch;
use Drupal\node\NodeInterface;
use Drupal\Core\Cache\CacheableRedirectResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;

/** Class ResponseSubscriber.
 * 
 * @package Drupal\emergency_redirect
 */

class ResponseSubscriber implements EventSubscriberInterface {
    /**
   * Drupal\Core\Routing\CurrentRouteMatch definition.
   *
   * @var Drupal\Core\Routing\CurrentRouteMatch
   */
  protected $routeMatch;
  protected $viewResult;

  /**
   * Constructor.
   */
  public function __construct(CurrentRouteMatch $current_route_match) {
    $this->routeMatch = $current_route_match;
    $view = \Drupal\views\Views::getView('campus_alerts');

    // Check the page alert takeover view for results.
    if (!empty($view)) {
      $view->setDisplay('takeover');
      $view->execute();
      $this->viewResult = $view->result;  
    } else {
      $this->viewResult = [];  
    }
  }

  /**
   * {@inheritdoc}
   */
  static function getSubscribedEvents() {
    $events['kernel.response'] = ['handle'];

    return $events;
  }

  /**
   * This method is called whenever the kernel.response event is
   * dispatched.
   *
   * @param GetResponseEvent $event
   */
  public function handle(Event $event) {
    if (count($this->viewResult) > 0) {
      $route_name = $this->routeMatch->getRouteName();
      $emergencyPage = $this->viewResult[0]->nid;

      // cases here in the switch statement are
      // route names for which we want to redirect.
      // for public-facing pages, that's node pages
      // and view pages. If others are discovered,
      // add them as cases below entity.node.canonical
      // and do NOT separate with a "Break." We WANT
      // the cases to fall through.
      switch ($route_name) {
        case 'entity.node.canonical':
          // For nodes, we need to short-circuit the
          // redirect if the node we are visiting is
          // the same as the one we are redirecting to
          $node = $this->routeMatch->getParameter('node');
          $thisPage = $node->id();
          if($emergencyPage === $thisPage) return;
        case 'entity.view.collection':
          $event->setResponse(RedirectResponse::create('/node/' . $emergencyPage));
          break;
      }  
    } else {
      // a nice enhancement would be to redirect away from the emergency alert page
      // when it is no longer active.
      return;
    };
  }

  /**
   * Determines whether we should send a RedirectResponse for this node.
   */
   protected function redirectApplies(NodeInterface $node) {


    // One should have logic here returning TRUE or FALSE for whether we should redirect this response.
    return FALSE;
  }

  protected function getRedirect(NodeInterface $node) {
    // We can cache this response when this is fixed: https://www.drupal.org/node/2573807
    // $response = CacheableRedirectResponse::create($url);
    // $response->addCacheableDependency($node);
    // return $response;
    return RedirectResponse::create("");
  }
}
