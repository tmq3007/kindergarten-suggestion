package fa.pjb.back.model.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ParentDTO extends UserDTO {
   Integer id;
   String district;
   String ward;
   String province;
   String street;
}
