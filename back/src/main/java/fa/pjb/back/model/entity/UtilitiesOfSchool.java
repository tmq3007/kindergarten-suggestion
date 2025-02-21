package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "utilities_of_school")
public class UtilitiesOfSchool {
    @EmbeddedId
    private UtilitiesOfSchoolId id;

    @MapsId("schoolId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "School_ID", nullable = false)
    private School school;

}