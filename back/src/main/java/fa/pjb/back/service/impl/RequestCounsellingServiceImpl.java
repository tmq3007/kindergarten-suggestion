package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._14xx_data.MissingDataException;
import fa.pjb.back.event.model.CounsellingRequestUpdateEvent;
import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.dto.RequestCounsellingUpdateDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.mapper.RequestCounsellingMapper;
import fa.pjb.back.model.mapper.RequestCounsellingProjection;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.RequestCounsellingService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final ApplicationEventPublisher eventPublisher;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // Check if principal is an instance of User entity
        if (principal instanceof User user) {
            return user;
        } else {
            throw new AuthenticationFailedException("Cannot authenticate");
        }
    }

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
    public Page<RequestCounsellingVO> getAllRequests(int page, int size, String searchBy, String keyword) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("dueDate").descending());

        Specification<RequestCounselling> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.trim().isEmpty() && searchBy != null) {
                String searchValue = "%" + keyword.toLowerCase().trim() + "%";
                switch (searchBy) {
                    case "name":
                        predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchValue));
                        break;
                    case "email":
                        predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), searchValue));
                        break;
                    case "phone":
                        predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("phone")), searchValue));
                        break;
                    case "schoolName":
                        Join<RequestCounselling, School> schoolJoin = root.join("school");
                        predicates.add(criteriaBuilder.like(criteriaBuilder.lower(schoolJoin.get("name")), searchValue));
                        break;
                    default:
                        predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchValue));
                        break;
                }
            }

            return predicates.isEmpty() ? null : criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<RequestCounsellingProjection> requestPage = requestCounsellingRepository.findAllProjected(specification, pageable);
        return requestPage.map(requestCounsellingMapper::toRequestCounsellingVOFromProjection);
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

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SCHOOL_OWNER')")
    @Override
    @Transactional
    public void updateRequestCounselling(RequestCounsellingUpdateDTO requestCounsellingUpdateDTO) {

        User user = getCurrentUser();
        String username = user.getUsername();

        RequestCounselling requestCounselling = requestCounsellingRepository.findById(requestCounsellingUpdateDTO.requestCounsellingId())
                .orElseThrow(() -> new MissingDataException("Request counselling not found"));

        String request_email = requestCounselling.getEmail();


        requestCounselling.setStatus(Byte.parseByte("1"));
        requestCounselling.setResponse(requestCounsellingUpdateDTO.response());

        eventPublisher.publishEvent(new CounsellingRequestUpdateEvent(request_email, username, requestCounsellingUpdateDTO.response()));

    }

}