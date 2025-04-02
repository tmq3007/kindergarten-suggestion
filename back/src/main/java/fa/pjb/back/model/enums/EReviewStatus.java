package fa.pjb.back.model.enums;

import lombok.Getter;

@Getter
public enum EReviewStatus {

    APPROVED((byte) 0),
    REJECTED((byte) 1),
    PENDING((byte) 2);

    private final byte value;

    EReviewStatus(byte value) {
        this.value = value;
    }
}
