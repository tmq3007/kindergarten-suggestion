package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._13xx_school.SchoolNotFoundException;
import fa.pjb.back.model.dto.RequestCounsellingDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.entity.SchoolOwner;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.repository.RequestCounsellingRepository;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.RequestCounsellingService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@AllArgsConstructor
@Service
public class RequestCounsellingServiceImpl implements RequestCounsellingService {

    private final RequestCounsellingRepository requestCounsellingRepository;
    private final ParentRepository parentRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolMapper schoolMapper;

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

        return RequestCounsellingVO.builder()
            .id(savedEntity.getId())
            .schoolName(school.get().getName()) // Set schoolName as the school's name
            .inquiry(savedEntity.getInquiry())
            .status(savedEntity.getStatus())
            .email(savedEntity.getEmail())
            .phone(phone)
            .name(name)
            .dueDate(savedEntity.getDue_date())
            .build();
    }
}