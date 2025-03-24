package fa.pjb.back.model.vo;

import lombok.Builder;

@Builder
public record FileUploadVO(

        int status,

        String message,

        Long size,

        String fileName,

        String fileId,

        String url

) {
}
