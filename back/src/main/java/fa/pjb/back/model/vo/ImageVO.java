package fa.pjb.back.model.vo;

public record ImageVO(
    int status,
    String message,
    Long size,
    String fileName,
    String fileId,
    String url
){}
