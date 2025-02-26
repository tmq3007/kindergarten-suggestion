package fa.pjb.back.model.mapper;
import fa.pjb.back.model.dto.SchoolOwnerDTO;
import fa.pjb.back.model.entity.SchoolOwner;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")

public interface SOMapper

{
    SOMapper INSTANCE = Mappers.getMapper(SOMapper.class);

    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "fullName", source = "user.fullname")
    //@Mapping(target = "password", source = "user.password")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "role", source = "user.role")
    @Mapping(target = "status", source = "user.status")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "dob", source = "user.dob")
    SchoolOwnerDTO toSchoolOwner(SchoolOwner schoolOwner);

}
