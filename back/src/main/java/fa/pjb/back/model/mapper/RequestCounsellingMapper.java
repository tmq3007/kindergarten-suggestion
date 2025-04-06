package fa.pjb.back.model.mapper;

import fa.pjb.back.model.entity.RequestCounselling;
import fa.pjb.back.model.vo.RequestCounsellingVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RequestCounsellingMapper {

    @Mapping(source = "school.name", target = "schoolName")
    @Mapping(source = "due_date", target = "dueDate")
    RequestCounsellingVO toRequestCounsellingVO(RequestCounselling requestCounselling);

    @Mapping(target = "address", expression = "java(formatAddress(projection))")
    @Mapping(target = "inquiry", ignore = true)
    @Mapping(target = "response", ignore = true)
    RequestCounsellingVO toRequestCounsellingVOFromProjection(RequestCounsellingProjection projection);

    default String formatAddress(RequestCounsellingProjection projection) {
        if (projection == null ||
            (projection.getStreet() == null && projection.getWard() == null &&
                projection.getDistrict() == null && projection.getProvince() == null)) {
            return "N/A";
        }
        String address = (projection.getStreet() + ", " +
            projection.getWard() + ", " +
            projection.getDistrict() + ", " +
            projection.getProvince()).trim();
        return address.isBlank() ? "N/A" : address;
    }
}