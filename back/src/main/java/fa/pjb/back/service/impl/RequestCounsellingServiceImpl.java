package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._14xx_data.MissingDataException;
import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.mapper.RequestCounsellingMapper;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.RequestCounsellingService;
import jakarta.persistence.criteria.Predicate;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@AllArgsConstructor
@Service
public class RequestCounsellingServiceImpl implements RequestCounsellingService {

    private final RequestCounsellingRepository requestCounsellingRepository;
    private final ParentRepository parentRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolMapper schoolMapper;
    private final RequestCounsellingMapper requestCounsellingMapper;

    @Override
    public RequestCounsellingVO createRequestCounselling(RequestCounsellingDTO request) {
        Parent parent = null;
        if (request.userId() != null) {
            parent = parentRepository.findParentByUserId(request.userId());
            if (parent == null) {
                throw new UserNotFoundException();
            }
        }

        Optional<School> school = schoolRepository.findSchoolBySchoolId(request.schoolId());
        if (school.isEmpty()) {
            throw new SchoolNotFoundException();
        }

        RequestCounselling entity = RequestCounselling.builder()
                .parent(parent)
                .school(school.get())
                .inquiry(request.inquiry())
                .status(request.status())
                .email(request.email())
                .phone(request.phone())
                .name(request.name())
                .due_date(request.dueDate())
                .build();

        RequestCounselling savedEntity = requestCounsellingRepository.save(entity);
        log.info("Created counseling request with ID: {}", savedEntity.getId());

        // Set parentName if parent exists
        String parentName = null;
        String phone = savedEntity.getPhone();
        String name = savedEntity.getName();
        if (parent != null) {
            parentName = parent.getUser().getFullname();
            name = parentName; // Use parentName as name (for fullName on frontend)
            phone = parent.getUser().getPhone();
        }
        return requestCounsellingMapper.toRequestCounsellingVO(savedEntity);
    }

    @Override
    public Page<RequestCounsellingVO> getAllRequests(
            int page, int size, Byte status, String email, String name, String phone,
            String schoolName, LocalDateTime dueDate) {

        Pageable pageable = PageRequest.of(page - 1, size);
        Specification<RequestCounselling> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (email != null && !email.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("email"), email));
            }
            if (name != null && !name.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("name"), name));
            }
            if (phone != null && !phone.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("phone"), phone));
            }
            if (schoolName != null && !schoolName.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("school").get("name"), schoolName));
            }
            if (dueDate != null) {
                predicates.add(criteriaBuilder.equal(root.get("dueDate"), dueDate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        // Fetch the paginated data with parent and school
        Page<RequestCounselling> requestPage = requestCounsellingRepository.findAll(specification, pageable);

        // Map the entities to VOs
        return requestPage.map(this::convertToVO);
    }

    private RequestCounsellingVO convertToVO(RequestCounselling request) {
        // Fetch parentName and phone from Parent if parent exists
        String phone = request.getPhone();
        String name = request.getName();

        // Fetch schoolName from School if school exists
        String schoolName = null;
        if (request.getSchool() != null) {
            schoolName = request.getSchool().getName();
        }

        // Build the RequestCounsellingVO
        return RequestCounsellingVO.builder()
                .id(request.getId())
                .schoolName(schoolName != null ? schoolName : "Unknown")
                .inquiry(request.getInquiry())
                .status(request.getStatus())
                .email(request.getEmail())
                .phone(phone)
                .name(name)
                .dueDate(request.getDue_date())
                .build();
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SCHOOL_OWNER')")
    @Override
    public RequestCounsellingVO getRequestCounselling(Integer requestCounsellingId) {
        RequestCounselling requestCounselling = requestCounsellingRepository.findByIdWithParent(requestCounsellingId);
        if (requestCounselling == null) {
            throw new MissingDataException("Request counselling not found");
        }

        return requestCounsellingMapper.toRequestCounsellingVO(requestCounselling);
    }

}