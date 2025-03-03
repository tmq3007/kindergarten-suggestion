package fa.pjb.back.model.enums;

public enum SchoolStatusEnum {
    SAVED(1),
    SUBMITTED(2),
    APPROVED(3),
    REJECTED(4),
    PUBLISHED(5),
    UNPUBLISHED(6),
    DELETED(7);

    private final int value;

    SchoolStatusEnum(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}