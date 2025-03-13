package fa.pjb.back.model.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;

import java.util.Set;

public record SchoolUpdateDTO(
        Integer id,
        @NotBlank(message = "School name is required")
        String name,

        @NotNull(message = "School type is required")
        @Min(value = 0, message = "Invalid school type")
        @Max(value = 4, message = "Invalid school type")
        Byte schoolType,

        @Size(max = 255)
        String website,

        @NotBlank(message = "Province is required")
        String province,

        @NotBlank(message = "District is required")
        String district,

        @NotBlank(message = "Ward is required")
        String ward,

        @Size(max = 255)
        @NotNull
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
        Byte receivingAge,

        @NotNull(message = "Education method is required")
        @Min(value = 0, message = "Invalid education method")
        @Max(value = 6, message = "Invalid education method")
        Byte educationMethod,

        @Min(value = 0, message = "Fee must be at least 0")
        Integer feeFrom,

        @Min(value = 0, message = "Fee must be at least 0")
        Integer feeTo,

        @Size(max = 8, message = "Invalid facilities selection")
        Set<@Min(0) @Max(7) Integer> facilities,

        @Size(max = 7, message = "Invalid utilities selection")
        Set<@Min(0) @Max(6) Integer> utilities,

        Set<Integer> schoolOwners,

        @Lob
        String description
) {
}
