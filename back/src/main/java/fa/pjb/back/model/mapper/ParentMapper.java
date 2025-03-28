package fa.pjb.back.model.mapper;

import fa.pjb.back.model.dto.ParentUpdateDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.vo.MediaVO;
import fa.pjb.back.model.vo.ParentInSchoolVO;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.model.vo.RegisterVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ParentMapper {

    @Mapping(target = "email", expression = "java(parent.getUser().getEmail())")
    @Mapping(target = "registrationDate", expression = "java(java.time.LocalDateTime.now())")
    RegisterVO toRegisterVO(Parent parent);

    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "fullname", source = "user.fullname")
    // @Mapping(target = "password", source = "user.password")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "role", source = "user.role")
    @Mapping(target = "status", source = "user.status")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "dob", source = "user.dob")
    @Mapping(target = "media", source = "media")
    ParentUpdateDTO toParentDTO(Parent parent);

    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "fullname", source = "user.fullname")
    // @Mapping(target = "password", source = "user.password")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "role", source = "user.role")
    @Mapping(target = "status", source = "user.status")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "dob", source = "user.dob")
    @Mapping(target = "media", source = "media")
    ParentVO toParentVO(Parent parent);

    // Mapping for ParentProjection to ParentVO
    @Mapping(source = ".", target = "media", qualifiedByName = "mapMedia")
    @Mapping(source = ".", target = "pis", qualifiedByName = "mapParentInSchool")
    @Mapping(target = "pisList", ignore = true)
    @Mapping(target = "password", ignore = true)
    ParentVO toParentVOFromProjection(ParentProjection projection);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "userId", target = "userId")
    @Mapping(source = "username", target = "username")
    @Mapping(source = "fullname", target = "fullname")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "role", target = "role")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "dob", target = "dob")
    @Mapping(source = "district", target = "district")
    @Mapping(source = "ward", target = "ward")
    @Mapping(source = "province", target = "province")
    @Mapping(source = "street", target = "street")
    @Mapping(source = ".", target = "media", qualifiedByName = "mapMedia")
    @Mapping(target = "pis", ignore = true)
    @Mapping(target = "pisList", ignore = true)
    @Mapping(target = "password", ignore = true)
    ParentVO toSimpleParentVOFromProjection(ParentProjection projection);

    // Mapping method for MediaVO
    @Named("mapMedia")
    default MediaVO mapMedia(ParentProjection projection) {
        if (projection.getMediaId() != null) {
            return new MediaVO(projection.getMediaUrl(), projection.getMediaId(), null);
        }
        return null;
    }

    // Mapping method for ParentInSchoolVO
    @Named("mapParentInSchool")
    default ParentInSchoolVO mapParentInSchool(ParentProjection projection) {
        if (projection.getPisId() != null) {
            return new ParentInSchoolVO(
                    projection.getPisId(),
                    null, // parent
                    null, // school
                    projection.getFromDate(), // startDate
                    projection.getToDate(),   // endDate
                    String.valueOf(projection.getUserEnrollStatus()) // status
            );
        }
        return null;
    }

}