package fa.pjb.back.model.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record UserCreateDTO(
        Integer id,

        @NotBlank(message = "Username cannot be empty")
        String username,

        @NotBlank(message = "Full name cannot be empty")
        String fullname,

        @NotBlank(message = "Password cannot be empty")
        String password,

        @NotBlank(message = "Email cannot be empty")
        String email,

        @NotBlank(message = "Role cannot be null or empty")
        String role,

        @NotNull(message = "Status cannot be null or empty")
        Boolean status,

        @Size(max = 20, message = "Phone number cannot exceed 20 characters")
        @NotBlank(message = "Phone cannot be empty")
        String phone,

        @NotNull(message = "Date of birth cannot be null")
        LocalDate dob,

        @Nullable
        String expectedSchool
) {
}
