package fa.pjb.back.service;

import fa.pjb.back.model.vo.ImageVO;

import java.io.File;
import java.util.List;

public interface GGDriveImageService {
    public ImageVO uploadImage(File file,String fileNamePrefix);
    public List<ImageVO> uploadListImages(List<File> list, String fileNamePrefix);
    public ImageVO deleteUploadedImage(String fileId);
}
