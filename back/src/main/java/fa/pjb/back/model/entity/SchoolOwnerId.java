package fa.pjb.back.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.Objects;

@Getter
@Setter
@Embeddable
public class SchoolOwnerId implements java.io.Serializable {
    @NotNull
    @Column(name = "User_ID", nullable = false)
    private Integer userId;

    @NotNull
    @Column(name = "School_ID", nullable = false)
    private Integer schoolId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        SchoolOwnerId entity = (SchoolOwnerId) o;
        return Objects.equals(this.schoolId, entity.schoolId) &&
                Objects.equals(this.userId, entity.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(schoolId, userId);
    }

}