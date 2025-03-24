package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Set;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "Facilities")
public class Facility {

    @Id
    @Column(name = "fid", nullable = false)
    private Integer fid;

    @Size(max = 255)
    @Column(name = "name", nullable = false)
    private String name;

    @ManyToMany(mappedBy = "facilities", fetch = FetchType.LAZY)
    private Set<School> schools;

}
