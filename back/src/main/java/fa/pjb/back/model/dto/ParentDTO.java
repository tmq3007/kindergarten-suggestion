package fa.pjb.back.model.dto;

import lombok.*;
import lombok.experimental.SuperBuilder;

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
