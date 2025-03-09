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
@Table(name = "Utilities")
public class Utility {
    @Id
    @Column(name = "uid", nullable = false)
    private Integer uid;

    @Size(max = 255)
    @Column(name = "name", nullable = false)
    private String name;

    @ManyToMany(mappedBy = "utilities", fetch = FetchType.LAZY)
    private Set<School> schools;
}
