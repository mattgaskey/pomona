<?php

namespace Drupal\summary_validate\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;

/**
 * Checks that the submitted value is a unique integer.
 *
 * @Constraint(
 *   id = "LessThanMaxlength",
 *   label = @Translation("Less than maxlength", context = "Validation"),
 *   type = "string"
 * )
 */
class LessThanMaxlength extends Constraint {

  // The message that will be shown if the value is longer than the maxlength.
  public $tooLong = 'The summary text is longer than the maximum allowed length for this field';

}