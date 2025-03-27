package fa.pjb.back.repository;

import fa.pjb.back.model.entity.Media;
import fa.pjb.back.model.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MediaRepository extends JpaRepository<Media, Long> {

    @Transactional
    void deleteAllBySchool(School school);

    List<Media> getAllBySchool(School school);

}
