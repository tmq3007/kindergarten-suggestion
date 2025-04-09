package fa.pjb.back.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class ReviewId implements Serializable {
    private static final long serialVersionUID = 671746391953050993L;
    @NotNull
    @Column(name = "school_id", nullable = false)
    private Integer schoolId;

    @NotNull
    @Column(name = "parent_id", nullable = false)
    private Integer parentId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ReviewId entity = (ReviewId) o;
        return Objects.equals(this.schoolId, entity.schoolId) &&
                Objects.equals(this.parentId, entity.parentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(schoolId, parentId);
    }

}