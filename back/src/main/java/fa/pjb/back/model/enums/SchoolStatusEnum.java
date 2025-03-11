package fa.pjb.back.model.enums;

public enum SchoolStatusEnum {
    SAVED(0),
    SUBMITTED(1),
    APPROVED(2),
    REJECTED(3),
    PUBLISHED(4),
    UNPUBLISHED(5),
    DELETED(6);

    private final int value;

    SchoolStatusEnum(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}