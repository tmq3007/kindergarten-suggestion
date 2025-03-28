package fa.pjb.back.model.dto;

import fa.pjb.back.model.vo.MediaVO;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@Builder
public record UserDetailDTO(
    @NotNull(message = "ID cannot be null")
    Integer id,

    @NotBlank(message = "Username cannot be empty")
    String username,

    @NotBlank(message = "Full name cannot be empty")
    String fullname,

    @NotBlank(message = "Email cannot be empty")
    String email,

    @NotBlank(message = "Role cannot be null or empty")
    String role,

    @NotNull(message = "Status cannot be null")
    Boolean status,

    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    @NotBlank(message = "Phone cannot be empty")
    String phone,

    @NotBlank(message = "Date of birth cannot be empty")
    String dob,

    @Nullable
    String expectedSchool,

    @Nullable
    @Size(min = 10, max = 10, message = "Business registration number must have 10 characters")
    String business_registration_number,

    @Nullable
    List<MediaVO> imageList
) {
}