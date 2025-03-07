package fa.pjb.back.repository;

import fa.pjb.back.model.entity.SchoolOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SchoolOwnerRepository extends JpaRepository<SchoolOwner, Integer> {
    Optional<SchoolOwner> findByUserId(Integer userId);
}
