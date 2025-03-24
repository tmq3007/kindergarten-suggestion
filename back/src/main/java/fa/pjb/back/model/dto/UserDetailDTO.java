package fa.pjb.back.model.dto;

public record UserDetailDTO(

        int id,

        String username,

        String fullname,

        String email,

        String dob,

        String phone,

        String role,

        String status

) {

}
