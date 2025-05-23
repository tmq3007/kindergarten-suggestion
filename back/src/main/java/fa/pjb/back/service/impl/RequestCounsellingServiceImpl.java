package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._12xx_auth.AuthenticationFailedException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.common.exception._14xx_data.MissingDataException;
import fa.pjb.back.event.model.CounsellingRequestUpdateEvent;
import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.dto.RequestCounsellingUpdateDTO;
import fa.pjb.back.model.entity.*;
import fa.pjb.back.model.mapper.RequestCounsellingMapper;
import fa.pjb.back.model.mapper.RequestCounsellingProjection;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.ParentRequestListVO;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.repository.ReviewRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.RequestCounsellingService;
import fa.pjb.back.service.UserService;
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
import org.springframework.security.authorization.AuthorizationDeniedException;
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
    private final RequestCounsellingMapper requestCounsellingMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final UserService userService;
    private final SchoolMapper schoolMapper;
    private final ReviewRepository reviewRepository;

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

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Override
    public RequestCounsellingVO getRequestCounsellingByAdmin(Integer requestCounsellingId) {
        RequestCounselling requestCounselling = requestCounsellingRepository.findByIdWithParent(requestCounsellingId);
        if (requestCounselling == null) {
            throw new MissingDataException("Request counselling not found");
        }

        return requestCounsellingMapper.toRequestCounsellingVO(requestCounselling);
    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Override
    public RequestCounsellingVO getRequestCounsellingBySchoolOwner(Integer requestCounsellingId) {

        RequestCounselling requestCounselling = requestCounsellingRepository.findByIdWithParent(requestCounsellingId);
        if (requestCounselling == null) {
            throw new MissingDataException("Request counselling not found");
        }

        SchoolOwner currentSchoolOwner = userService.getCurrentSchoolOwner();
        boolean isRequestManagedBySchoolOwner = requestCounsellingRepository.isRequestManagedByOwner(requestCounsellingId, currentSchoolOwner.getId());
        if (!isRequestManagedBySchoolOwner) {
            throw new AuthorizationDeniedException("You don't have permission to manage this request");
        }

        return requestCounsellingMapper.toRequestCounsellingVO(requestCounselling);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Override
    @Transactional
    public void updateRequestCounsellingByAdmin(RequestCounsellingUpdateDTO requestCounsellingUpdateDTO) {

        String currentRequestCounsellingResponse = requestCounsellingUpdateDTO.response();

        RequestCounselling requestCounselling = requestCounsellingRepository.findById(requestCounsellingUpdateDTO.requestCounsellingId())
                .orElseThrow(() -> new MissingDataException("Request counselling not found"));

        String request_email = requestCounselling.getEmail();


        requestCounselling.setStatus(Byte.parseByte("1"));
        requestCounselling.setResponse(currentRequestCounsellingResponse);

        eventPublisher.publishEvent(new CounsellingRequestUpdateEvent(request_email, currentRequestCounsellingResponse));

    }

    @PreAuthorize("hasRole('ROLE_SCHOOL_OWNER')")
    @Override
    @Transactional
    public void updateRequestCounsellingBySchoolOwner(RequestCounsellingUpdateDTO requestCounsellingUpdateDTO) {

        Integer currentRequestCounsellingId = requestCounsellingUpdateDTO.requestCounsellingId();
        String currentRequestCounsellingResponse = requestCounsellingUpdateDTO.response();

        RequestCounselling requestCounselling = requestCounsellingRepository.findById(currentRequestCounsellingId)
                .orElseThrow(() -> new MissingDataException("Request counselling not found"));

        SchoolOwner currentSchoolOwner = userService.getCurrentSchoolOwner();
        boolean isRequestManagedBySchoolOwner = requestCounsellingRepository.isRequestManagedByOwner(currentRequestCounsellingId, currentSchoolOwner.getId());
        if (!isRequestManagedBySchoolOwner) {
            throw new AuthorizationDeniedException("You don't have permission to manage this request");
        }

        String request_email = requestCounselling.getEmail();

        requestCounselling.setStatus(Byte.parseByte("1"));
        requestCounselling.setResponse(currentRequestCounsellingResponse);

        eventPublisher.publishEvent(new CounsellingRequestUpdateEvent(request_email, currentRequestCounsellingResponse));
    }

    @Override
    public Page<ParentRequestListVO> getAllRequestsByParent(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        User currentUser = getCurrentUser();
        Parent parent = parentRepository.findParentByUserId(currentUser.getId());
        if (parent == null) {
            throw new UserNotFoundException();
        }

        Page<RequestCounselling> requestPage = requestCounsellingRepository.findByParentIdWithSchool(parent.getId(), pageable);

        return requestPage.map(requestCounselling -> {

            School school = requestCounselling.getSchool();

            SchoolDetailVO schoolDetailVO = schoolMapper.toSchoolDetailVO(school);

            List<Object[]> statistics = reviewRepository.getReviewStatisticsBySchoolId(school.getId());

            Object[] statisticsObject = statistics.get(0);

            return ParentRequestListVO.builder()
                    .id(requestCounselling.getId())
                    .school(schoolDetailVO)
                    .inquiry(requestCounselling.getInquiry())
                    .status(requestCounselling.getStatus())
                    .email(requestCounselling.getEmail())
                    .phone(requestCounselling.getPhone())
                    .name(requestCounselling.getName())
                    .address(requestCounselling.getParent().getStreet() + " " + requestCounselling.getParent().getWard() + " " + requestCounselling.getParent().getDistrict() + " " + requestCounselling.getParent().getProvince())
                    .dueDate(requestCounselling.getDue_date())
                    .response(requestCounselling.getResponse())
                    .totalSchoolReview(Integer.parseInt(String.valueOf(statisticsObject[0])))
                    .averageSchoolRating(Math.floor(((Double) statisticsObject[1]) * 10) / 10)
                    .build();
        });
    }

    @Override
    public Integer countOpenRequestByParent() {
        User currentUser = getCurrentUser();
        Parent parent = parentRepository.findParentByUserId(currentUser.getId());
        if (parent == null) {
            throw new UserNotFoundException();
        }
        return requestCounsellingRepository.countOpenRequestByParentId(parent.getId());
    }

}