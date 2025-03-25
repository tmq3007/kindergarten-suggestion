package fa.pjb.back.model.mapper;

import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.entity.School;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import fa.pjb.back.model.vo.SchoolDetailVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface RequestCounsellingMapper {

    @Mapping(source = "school.name", target = "schoolName")
    @Mapping(source = "due_date", target = "dueDate")
    RequestCounsellingVO toRequestCounsellingVO(RequestCounselling requestCounselling);


}