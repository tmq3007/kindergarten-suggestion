package fa.pjb.back.model.enums;

import lombok.Getter;

@Getter
public enum EFileFolder {

    SCHOOL_IMAGES("School_Images"),
    USER_IMAGES("User_Images"),
    SO_IMAGES("SO_Images");

    private final String value;

    EFileFolder(String value){this.value=value;}

}
