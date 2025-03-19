package fa.pjb.back.repository;

import fa.pjb.back.model.entity.RequestCounselling;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestCounsellingRepository extends JpaRepository<RequestCounselling, Integer> {

    List<RequestCounselling> findByStatus(byte status);
}
