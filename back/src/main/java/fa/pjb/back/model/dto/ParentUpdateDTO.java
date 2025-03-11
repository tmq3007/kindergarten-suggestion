package fa.pjb.back.model.dto;

import fa.pjb.back.model.entity.Media;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;

@Builder
public record ParentUpdateDTO(

        @Nullable
        String username,

        @NotBlank(message = "Fullname cannot be empty")
        @Length(min = 1, max = 255, message = "Fullname must be between 1 and 50 characters")
        String fullname,

        @NotNull
         @Length(min = 1, max = 255, message = "Email must be between 1 and 50 characters")
        @Pattern(regexp = ".+@.+\\..+", message = "Invalid email format")
        String email,

        @NotNull
        String role,

        Boolean status,

        @NotBlank(message = "Phone cannot be empty")
        @Pattern(regexp = "^\\+\\d{1,4}[-\\s]?\\d{4,14}$", message = "Invalid phone format")
        String phone,

        @NotNull(message = "Date of birth cannot be null")
        LocalDate dob,

        @Nullable
        String district,

        @Nullable
        String ward,

        @Nullable
        String province,

        @Nullable
        String street,

        @Nullable
        Media media
) {
}
