package fa.pjb.back.model.dto;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import jakarta.validation.constraints.*;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.List;


@ValidFeeRange
public record AddSchoolDTO(
        @NotBlank(message = "School name is required")
        String name,

        @NotNull(message = "School type is required")
        @Min(value = 0, message = "Invalid school type")
        @Max(value = 4, message = "Invalid school type")
        Integer schoolType,

        String website,

        // Address Fields
        @NotBlank(message = "Province is required")
        String province,

        @NotBlank(message = "District is required")
        String district,

        @NotBlank(message = "Ward is required")
        String ward,

        String street,

        @NotBlank(message = "Email is required")
        @Pattern(regexp = ".+@.+\\..+", message = "Invalid email format")
        String email,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+\\d{1,4}[-\\s]?\\d{4,14}$", message = "Invalid phone format")
        String phone,

        @NotNull(message = "Child age is required")
        @Min(value = 0, message = "Invalid child age")
        @Max(value = 2, message = "Invalid child age")
        Integer receivingAge,

        @NotNull(message = "Education method is required")
        @Min(value = 0, message = "Invalid education method")
        @Max(value = 6, message = "Invalid education method")
        Integer educationMethod,

        // Fee Range
        @Min(value = 0, message = "Fee must be at least 0")
        Integer feeFrom,

        @Min(value = 0, message = "Fee must be at least 0")
        Integer feeTo,

        // Facilities and Utilities (Checkbox Groups)
        @Size(max = 8, message = "Invalid facilities selection")
        List<@Min(0) @Max(7) Integer> facilities,

        @Size(max = 7, message = "Invalid utilities selection")
        List<@Min(0) @Max(6) Integer> utilities,

        String description // School introduction

) {
}


//Custom validations fee from and fee to
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = FeeRangeValidator.class)
@interface ValidFeeRange {
    String message() default "Fee From must be less than Fee To";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

class FeeRangeValidator implements ConstraintValidator<ValidFeeRange, AddSchoolDTO> {
    @Override
    public boolean isValid(AddSchoolDTO school, ConstraintValidatorContext context) {
        if (school.feeFrom() != null && school.feeTo() != null) {
            return school.feeFrom() < school.feeTo();
        }
        return true; // Allow null values
    }
}

