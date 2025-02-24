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
@Table(name = "Utilities")
public class Utility {
    @Id
    @Column(name = "uid", nullable = false)
    private Integer fid;

    @Size(max = 255)
    @NotNull
    @Column(name = "name")
    private String name;

    @ManyToMany(mappedBy = "utilities")
    private Set<School> schools;
}
