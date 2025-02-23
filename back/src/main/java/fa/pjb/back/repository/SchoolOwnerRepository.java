package fa.pjb.back.repository;

import fa.pjb.back.model.entity.SchoolOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchoolOwnerRepository extends JpaRepository<SchoolOwner, Integer> {
}
