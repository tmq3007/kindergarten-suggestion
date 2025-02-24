package fa.pjb.back.model.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor

@FieldDefaults(level = AccessLevel.PRIVATE)
 public class ParentDTO extends UserDTO {
    Integer id;
    String fullName;
     String district;
     String ward;
     String province;
     String street;

}

