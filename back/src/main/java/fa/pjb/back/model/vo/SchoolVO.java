package fa.pjb.back.model.vo;

public record SchoolVO(
        String name,
        String schoolType,
        String district,
        String ward,
        String province,
        String street,
        String email,
        String phone,
        Byte receivingAge,
        Byte educationMethod,
        Integer feeFrom,
        Integer feeTo) {
}
