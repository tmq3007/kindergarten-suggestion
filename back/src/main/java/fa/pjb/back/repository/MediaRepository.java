package fa.pjb.back.repository;

import fa.pjb.back.model.entity.Media;
import fa.pjb.back.model.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepository extends JpaRepository<Media,Long> {
    void deleteAllBySchool(School school);
}
