package fa.pjb.back.repository;

import fa.pjb.back.model.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolOwnerRepository extends JpaRepository<School,Integer> {
}
