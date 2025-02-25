package fa.pjb.back.repository;

import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SchoolOwnerRepository extends JpaRepository<SchoolOwner,Integer> {
  Optional<SchoolOwner> findByUserId(Integer userId);
}
