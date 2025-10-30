package com.datagovernance.service.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Custom email validation annotation
 */
@Documented
@Constraint(validatedBy = EmailFormatValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidEmail {
    String message() default "Email format is invalid";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}