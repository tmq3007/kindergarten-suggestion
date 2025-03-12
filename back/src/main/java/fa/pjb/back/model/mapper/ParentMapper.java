package fa.pjb.back.model.mapper;

import fa.pjb.back.model.dto.ParentUpdateDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.vo.ParentVO;
import fa.pjb.back.model.vo.RegisterVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

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
}