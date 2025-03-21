package fa.pjb.back.model.vo;

import fa.pjb.back.model.entity.Media;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;
@Builder
public record ParentVO(
        Integer id,
        String username,
        String fullname,
        String password,
        String email,
        String role,
        Boolean status,
        String phone,
        LocalDate dob,
        String district,
        String ward,
        String province,
        String street,
        MediaVO media
) {
}
