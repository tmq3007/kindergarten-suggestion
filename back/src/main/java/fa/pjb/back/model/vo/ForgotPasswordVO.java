package fa.pjb.back.model.vo;

import lombok.Builder;

@Builder
public record ForgotPasswordVO(

        String fpToken,

        String username

) {
}
