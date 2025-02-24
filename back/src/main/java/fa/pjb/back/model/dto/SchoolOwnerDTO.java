package fa.pjb.back.model.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SchoolOwnerDTO extends UserDTO {
    Integer id;
    SchoolDTO school; // Chứa thông tin của School
}
