package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "School_Facilities")
public class FacilitiesOfSchool {
    @Id
    @Column(name = "fid", nullable = false)
    private Integer fid;

    @MapsId("schoolId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

}