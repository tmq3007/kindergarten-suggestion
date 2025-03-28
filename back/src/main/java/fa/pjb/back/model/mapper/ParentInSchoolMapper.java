package fa.pjb.back.model.mapper;

import fa.pjb.back.model.vo.ParentInSchoolVO;
import fa.pjb.back.model.vo.ParentVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = {ParentMapper.class})
public interface ParentInSchoolMapper {

    ParentMapper PARENT_MAPPER = Mappers.getMapper(ParentMapper.class);

    // Map ParentProjection to ParentInSchoolVO
    @Mapping(source = "pisId", target = "id")
    @Mapping(source = ".", target = "parent", qualifiedByName = "mapParentFromProjection")
    @Mapping(target = "school", ignore = true) // School not in projection; set in service if needed
    @Mapping(source = "fromDate", target = "fromDate")
    @Mapping(source = "toDate", target = "toDate")
    @Mapping(source = "userEnrollStatus", target = "status")
    ParentInSchoolVO toParentInSchoolVO(ParentProjection projection);

    // Method to map ParentVO from ParentProjection
    @Named("mapParentFromProjection")
    default ParentVO mapParentFromProjection(ParentProjection projection) {
        return PARENT_MAPPER.toSimpleParentVOFromProjection(projection);
    }

    // Method to map status from userEnrollStatus
}
