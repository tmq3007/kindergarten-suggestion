package fa.pjb.back.model.vo;

import lombok.Builder;
import lombok.Getter;

@Builder
public record ImageVO(
        int status,
        String message,
        Long size,
        String fileName,
        String fileId,
        String url
) {
}
