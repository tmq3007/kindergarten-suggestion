package fa.pjb.back.repository;

import fa.pjb.back.model.entity.Facility;
import fa.pjb.back.model.entity.Utility;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Set;

public interface UtilityRepository extends JpaRepository<Utility, Long> {
    @EntityGraph(attributePaths = {})
    @Query("SELECT u FROM Utility u WHERE u.uid IN :uids")
    Set<Utility> findAllByUidIn(@Param("uids") Set<Integer> uids);
}
