package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "facilities_of_school")
public class FacilitiesOfSchool {
    @EmbeddedId
    private FacilitiesOfSchoolId id;

    @MapsId("schoolId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "School_ID", nullable = false)
    private School school;

}