package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception._13xx_school.ReviewNotFoundException;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.mapper.SchoolMapper;
import fa.pjb.back.model.vo.SchoolVO;
import fa.pjb.back.repository.SchoolRepository;
import fa.pjb.back.service.SchoolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class SchoolServiceImpl implements SchoolService {
    private final SchoolRepository schoolRepository;
    private final SchoolMapper schoolMapper;

    @Override
    public SchoolVO getSchoolInfo(Integer schoolId) {
        log.info("=========== school service ===============");
        School school = schoolRepository.findById(schoolId).orElseThrow(ReviewNotFoundException::new);
        return schoolMapper.toSchoolVO(school);
    }
}
