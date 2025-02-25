package fa.pjb.back.model.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
@SuperBuilder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SchoolOwnerDTO extends UserDTO {
    Integer id;
    SchoolDTO school; // Chứa thông tin của School
}
