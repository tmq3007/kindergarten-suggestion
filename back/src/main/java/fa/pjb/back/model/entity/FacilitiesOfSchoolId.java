package fa.pjb.back.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.Objects;

@Getter
@Setter
@Embeddable
public class FacilitiesOfSchoolId implements java.io.Serializable {
    private static final long serialVersionUID = 27431567151552051L;
    @NotNull
    @Column(name = "UID", nullable = false)
    private Byte uid;

    @NotNull
    @Column(name = "School_ID", nullable = false)
    private Integer schoolId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        FacilitiesOfSchoolId entity = (FacilitiesOfSchoolId) o;
        return Objects.equals(this.uid, entity.uid) &&
                Objects.equals(this.schoolId, entity.schoolId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(uid, schoolId);
    }

}