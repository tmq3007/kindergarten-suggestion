package fa.pjb.back.repository;

import fa.pjb.back.model.entity.RequestCounselling;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RequestCounsellingRepository extends JpaRepository<RequestCounselling, Integer> {

    List<RequestCounselling> findByStatus(byte status);
    List<RequestCounselling> findBySchoolIdAndStatus(Integer school_id, @NotNull Byte status);

    @Query("SELECT rc FROM RequestCounselling rc LEFT JOIN FETCH rc.parent WHERE rc.id = :requestCounsellingId")
    RequestCounselling findByIdWithParent(@Param("requestCounsellingId") Integer id);
}
