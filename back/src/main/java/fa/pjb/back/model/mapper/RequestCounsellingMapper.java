package fa.pjb.back.model.mapper;

import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RequestCounsellingMapper {

    @Mapping(source = "school.name", target = "schoolName")
    @Mapping(source = "due_date", target = "dueDate")
    @Mapping(target = "address", expression = "java( requestCounselling.getParent() != null ? requestCounselling.getParent().getStreet() + \" \" + requestCounselling.getParent().getWard() + \" \" + requestCounselling.getParent().getDistrict() + \" \" + requestCounselling.getParent().getProvince() : null)")
    RequestCounsellingVO toRequestCounsellingVO(RequestCounselling requestCounselling);

}