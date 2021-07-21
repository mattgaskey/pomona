<?php

namespace Drupal\summary_validate\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Validates the LessThanMaxlength constraint.
 */
class LessThanMaxlengthValidator extends ConstraintValidator {

  /**
   * {@inheritdoc}
   */
  public function validate($items, Constraint $constraint) {
    foreach ($items as $item) {
      // First check the length of the value.
      if (strlen($item->value) > 251) {
        // The value is too long, so a violation, aka error, is applied.
        // The type of violation applied comes from the constraint description
        // in step 1.
        $this->context->addViolation($constraint->tooLong, ['%value' => $item->value]);
      }
    }
  }

}