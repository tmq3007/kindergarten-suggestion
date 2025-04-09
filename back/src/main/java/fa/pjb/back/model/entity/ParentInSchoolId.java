package fa.pjb.back.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class ParentInSchoolId implements Serializable {
    private static final long serialVersionUID = 8196444628012954392L;
    @NotNull
    @Column(name = "school_id", nullable = false)
    private Integer schoolId;

    @NotNull
    @Column(name = "parent_id", nullable = false)
    private Integer parentId;

    @NotNull
    @Column(name = "`from`", nullable = false)
    private LocalDate fromKey;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ParentInSchoolId entity = (ParentInSchoolId) o;
        return Objects.equals(this.schoolId, entity.schoolId) &&
                Objects.equals(this.fromKey, entity.fromKey) &&
                Objects.equals(this.parentId, entity.parentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(schoolId, fromKey, parentId);
    }

}