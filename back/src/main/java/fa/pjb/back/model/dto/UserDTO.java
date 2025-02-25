package fa.pjb.back.model.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
 @FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDTO {
    Integer id;

    String username;

    String fullName;

    String password;

    String email;

    String role;

    Boolean status;

    String phone;

    LocalDate dob;

}
