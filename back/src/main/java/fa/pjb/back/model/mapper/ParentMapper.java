package fa.pjb.back.model.mapper;

import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.vo.RegisterVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ParentMapper {

    ParentMapper INSTANCE = Mappers.getMapper(ParentMapper.class);

    @Mapping(target = "fullname", source = "fullname")
    @Mapping(target = "email", expression = "java(parent.getUser().getEmail())")
    @Mapping(target = "phone", source = "phone")
    @Mapping(target = "registrationDate", expression = "java(java.time.LocalDateTime.now())")
    RegisterVO toRegisterVO(Parent parent);
}