package fa.pjb.back.model.enums;

import lombok.Getter;

@Getter
public enum ReviewStatus {

    APPROVED((byte) 0),
    REJECTED((byte) 1),
    PENDING((byte) 2);

    private final byte value;

    ReviewStatus(byte value) {
        this.value = value;
    }
}
