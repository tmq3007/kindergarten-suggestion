package fa.pjb.back.model.dto;

import fa.pjb.back.model.vo.MediaVO;
import jakarta.validation.constraints.*;
import java.util.List;
import jakarta.annotation.Nullable;
import org.springframework.web.multipart.MultipartFile;

public record UserUpdateDTO(

        int id,

        @NotBlank(message = "Full Name cannot be null or empty")
        String fullname,

        @NotBlank(message = "Username cannot be null or empty")
        String username,

        @NotBlank(message = "Email cannot be null or empty")
        @Email(message = "Invalid email format. Example: user@example.com")
        String email,

        @NotBlank(message = "Date of Birth cannot be null or empty")
        String dob,

        @NotBlank(message = "Phone number cannot be null or empty")
        @Pattern(regexp = "^\\+\\d{1,4}[-\\s]?\\d{4,14}$", message = "Invalid phone format")
        String phone,

        @NotBlank(message = "Role cannot be null or empty")
        String role,

    @NotNull(message = "Status cannot be null") // Đổi @NotBlank thành @NotNull
    Boolean status,

    @Nullable // Optional, không bắt buộc
    String expectedSchool,

    @Nullable // Optional, không bắt buộc
    @Size(min = 10, max = 10, message = "Business registration number must have 10 characters")
    String business_registration_number,

    @Nullable // Optional, không bắt buộc
    List<MultipartFile> imageList
) {
}