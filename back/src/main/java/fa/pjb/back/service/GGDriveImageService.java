package fa.pjb.back.service;

import fa.pjb.back.model.vo.ImageVO;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

public interface GGDriveImageService {
    public ImageVO uploadImage(File file,String fileNamePrefix);
    public List<ImageVO> uploadListImages(List<File> list, String fileNamePrefix);
    public ImageVO deleteUploadedImage(String fileId);
    public List<java.io.File>  convertMultiPartFileToFile(List<MultipartFile> list) throws IOException;
}
