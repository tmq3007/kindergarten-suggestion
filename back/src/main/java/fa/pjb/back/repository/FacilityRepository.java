package fa.pjb.back.repository;

import fa.pjb.back.model.entity.Facility;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Set;

public interface FacilityRepository extends JpaRepository<Facility, Long> {

    @EntityGraph(attributePaths = {})
    @Query("SELECT f FROM Facility f WHERE f.fid IN :fids")
    Set<Facility> findAllByFidIn(@Param("fids") Set<Integer> fids);

}
