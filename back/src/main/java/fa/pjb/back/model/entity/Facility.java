package fa.pjb.back.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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
    @NotNull
    @Column(name = "name")
    private String name;

    @ManyToMany(mappedBy = "facilities")
    private Set<School> schools;
}
