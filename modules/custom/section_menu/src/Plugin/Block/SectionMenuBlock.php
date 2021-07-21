<?php

namespace Drupal\section_menu\Plugin\Block;

use Drupal\system\Plugin\Block\SystemMenuBlock;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;
use Drupal\Core\Template\Attribute;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Access\AccessResultInterface;

/**
 * Provides a 'SectionMenuBlock' block.
 *
 * @Block(
 *  id = "section_menu_block",
 *  admin_label = @Translation("Section menu block"),
 * )
 */
class SectionMenuBlock extends SystemMenuBlock {

  protected $menuName = 'main';

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    // Not configurable.
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    // Do nothing.
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    // @TODO: potentially make this a configuration option.
    $section_head_field = 'field_is_section_landing';

    $parameters = $this->menuTree->getCurrentRouteMenuTreeParameters($this->menuName);
    $active_trail = array_values($parameters->activeTrail);

    $storage = \Drupal::entityManager()->getStorage('menu_link_content');

    // Find the closest section head by moving up through the active trail.
    $section_head = NULL;
    while (count($active_trail)) {
      $current = array_shift($active_trail);
      $uuid = str_replace('menu_link_content:', '', $current);
      $links = $storage->loadByProperties([
        'uuid' => $uuid,
      ]);
      if (!$links) {
        break;
      }
      $link = reset($links);
      if ($link->hasField($section_head_field) && $link->$section_head_field->value) {
        $section_head = $link;
        break;
      }
    }

    $tree = [];
    if ($section_head) {
      $menu_root = 'menu_link_content:' . $section_head->uuid();

      $title = [
        'url' => $section_head->getUrlObject()->toString(),
        'title' => $section_head->getTitle(),
      ];

      // Rebuild with the section head root.
      $parameters->setRoot($menu_root);
      $parameters->minDepth = 1;
      $tree = $this->menuTree->load($this->menuName, $parameters);
      $manipulators = [
        ['callable' => 'menu.default_tree_manipulators:checkAccess'],
        ['callable' => 'menu.default_tree_manipulators:generateIndexAndSort'],
      ];
      $tree = $this->menuTree->transform($tree, $manipulators);
    }

    // A lot of this is from https://api.drupal.org/api/drupal/core!lib!Drupal!Core!Menu!MenuLinkTree.php/8.8.x.
    $build = [];
    $tree_access_cacheability = new CacheableMetadata();
    $tree_link_cacheability = new CacheableMetadata();
    $build['#items'] = $this->buildTree($tree, $tree_access_cacheability, $tree_link_cacheability);
    $tree_cacheability = $tree_access_cacheability
      ->merge($tree_link_cacheability);
    $tree_cacheability
      ->applyTo($build);

    // Make sure drupal_render() does not re-order the links.
    $build['#sorted'] = TRUE;

    $build['#linked_title'] = $title;
    $build['#theme'] = 'section_menu_block';

    $build['#cache']['tags'][] = 'config:system.menu.' . $this->menuName;
    $build['#contextual_links']['menu'] = [
      'route_parameters' => ['menu' => $this->menuName],
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function blockAccess(AccountInterface $account) {
    $build = $this->build();
    // Borrowed from menu_block -- hide if no links.
    if (empty($build['#items'])) {
      return AccessResult::forbidden();
    }
    return parent::blockAccess($account);
  }

  /**
   * Recursive menu builder.
   */
  protected function buildTree($tree, CacheableMetadata $tree_access_cacheability, CacheableMetadata $tree_link_cacheability) {
    $items = [];
    foreach ($tree as $uuid => $element) {

      // From https://api.drupal.org/api/drupal/core%21lib%21Drupal%21Core%21Menu%21MenuLinkTree.php/8.8.x
      // Gather the access cacheability of every item in the menu link tree,
      // including inaccessible items. This allows us to render cache the menu
      // tree, yet still automatically vary the rendered menu by the same cache
      // contexts that the access results vary by.
      // However, if $data->access is not an AccessResultInterface object, this
      // will still render the menu link, because this method does not want to
      // require access checking to be able to render a menu tree.
      if ($element->access instanceof AccessResultInterface) {
        $tree_access_cacheability = $tree_access_cacheability
          ->merge(CacheableMetadata::createFromObject($element->access));
      }

      // Gather the cacheability of every item in the menu link tree. Some links
      // may be dynamic: they may have a dynamic text (e.g. a "Hi, <user>" link
      // text, which would vary by 'user' cache context), or a dynamic route
      // name or route parameters.
      $tree_link_cacheability = $tree_link_cacheability
        ->merge(CacheableMetadata::createFromObject($element->link));

      // Only render accessible links.
      if ($element->access instanceof AccessResultInterface && !$element->access
        ->isAllowed()) {
        continue;
      }

      $link = $element->link;
      $url = $link->getUrlObject();
      if (!$url) {
        continue;
      }

      if (!$link->isEnabled()) {
        continue;
      }

      $options = $link->getOptions();
      $menu_class = $options['attributes']['class'];

      $item = [
        'url' => $url->toString(),
        'title' => $element->link->getTitle(),
        'attributes' => new Attribute(),
        'menu_class' => $menu_class,
      ];

      $item['in_active_trail'] = FALSE;

      if ($element->subtree) {
        $item['below'] = $this->buildTree($element->subtree, $tree_access_cacheability, $tree_link_cacheability);
        if ($element->inActiveTrail) {
          $item['in_active_trail'] = TRUE;
        }
      }

      if ($element->inActiveTrail) {
        $item['in_active_trail'] = TRUE;
      }

      $current_path = \Drupal::request()->getRequestUri();
      $item['is_active'] = FALSE;
      if ($item['url'] == $current_path) {
        $item['is_active'] = TRUE;
      }

      $items[] = $item;
    }
    return $items;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheTags() {
    return [
      'config:system.menu.' . $this->menuName,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() {
    return [
      'route.menu_active_trails:' . $this->menuName,
    ];
  }

}
