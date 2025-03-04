package fa.pjb.back.model.vo;

public record ImageVO(
    int status,
    String message,
    int size,
    String fileName,
    String url
){}
