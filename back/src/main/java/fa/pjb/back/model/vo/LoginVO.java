package fa.pjb.back.model.vo;

public record LoginVO(boolean isLogged, String csrfToken) {
}
