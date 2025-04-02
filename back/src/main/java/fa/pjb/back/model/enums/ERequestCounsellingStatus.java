package fa.pjb.back.model.enums;

import lombok.Getter;

@Getter
public enum ERequestCounsellingStatus {
    OPEN((byte) 0),
    CLOSED((byte) 1),
    OVERDUE((byte) 2);

    private final byte value;

    ERequestCounsellingStatus(byte value) {
        this.value = value;
    }
}
