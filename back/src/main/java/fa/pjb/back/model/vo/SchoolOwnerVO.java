package fa.pjb.back.model.vo;

public record SchoolOwnerVO(
        Integer id,
        String fullname,
        String username,
        String email,
        String phone,
        String expectedSchool
) {
}
