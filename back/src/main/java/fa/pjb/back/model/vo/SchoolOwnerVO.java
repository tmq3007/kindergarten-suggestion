package fa.pjb.back.model.vo;

public record SchoolOwnerVO(
        Integer id,
        Integer userId,
        String fullname,
        String username,
        String email,
        String phone,
        String expectedSchool
) {
}
