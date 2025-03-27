package fa.pjb.back.model.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record RequestCounsellingDTO(

        Integer userId,

        @NotNull(message = "School ID is required")
        Integer schoolId,

        String inquiry,

        @NotNull(message = "Status is required")
        byte status,

        @NotNull(message = "Email is required")
        String email,

        @NotNull(message = "Phone is required")
        String phone,

        @NotNull(message = "Name is required")
        String name,

        @NotNull(message = "Due date is required")
        LocalDateTime dueDate

) {
}
