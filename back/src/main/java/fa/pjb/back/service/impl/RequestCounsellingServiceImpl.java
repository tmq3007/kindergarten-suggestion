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

        Parent parent = parentRepository.findParentByUserId(request.userId());

        if (parent == null) {
            throw new UserNotFoundException();
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

         return  RequestCounsellingVO.builder()
                .school(schoolMapper.toSchoolDetailVO(school.get()))
                .inquiry(savedEntity.getInquiry())
                .status(savedEntity.getStatus())
                .email(savedEntity.getEmail())
                .phone(savedEntity.getPhone())
                .name(savedEntity.getName())
                .dueDate(savedEntity.getDue_date())
                .build();
    }
}