package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "Facilities_of_School")
public class FacilitiesOfSchool {
    @EmbeddedId
    private FacilitiesOfSchoolId id;

    @MapsId("schoolId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "School_ID", nullable = false)
    private School school;

}