package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "School_Utilities")
public class UtilitiesOfSchool {

    @Id
    @Column(name = "uid", nullable = false)
    private Integer uid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

}