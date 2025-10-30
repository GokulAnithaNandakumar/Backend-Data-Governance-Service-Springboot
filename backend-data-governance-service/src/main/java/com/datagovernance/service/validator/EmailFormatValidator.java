package com.datagovernance.service.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Custom email format validator
 */
@Component
public class EmailFormatValidator implements ConstraintValidator<ValidEmail, String> {

    @Value("${app.data-governance.validation.email-format}")
    private String emailPattern;

    private Pattern pattern;

    @Override
    public void initialize(ValidEmail constraintAnnotation) {
        if (emailPattern != null) {
            pattern = Pattern.compile(emailPattern);
        }
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || email.isEmpty()) {
            return true; // Let @NotBlank handle empty validation
        }

        if (pattern != null) {
            return pattern.matcher(email).matches();
        }

        // Fallback to basic email validation
        return email.contains("@") && email.contains(".");
    }
}