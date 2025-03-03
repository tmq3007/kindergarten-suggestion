package fa.pjb.back.model.mapper;

import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.vo.SchoolVO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SchoolMapper {
    SchoolVO toSchoolVO(School school);
}
