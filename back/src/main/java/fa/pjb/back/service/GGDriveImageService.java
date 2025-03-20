package fa.pjb.back.service;

import fa.pjb.back.model.enums.FileFolderEnum;
import fa.pjb.back.model.vo.FileUploadVO;
import fa.pjb.back.common.util.UploadFileInterface;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

public interface GGDriveImageService {
    public FileUploadVO uploadImage(File file, String fileNamePrefix, FileFolderEnum fileFolder);
    public List<FileUploadVO> uploadListFiles(List<java.io.File> files, String fileNamePrefix, FileFolderEnum fileFolder,
                                              UploadFileInterface<File, String, FileFolderEnum, FileUploadVO> uploadMethod);
    public FileUploadVO deleteUploadedImage(String fileId);
    public List<java.io.File>  convertMultiPartFileToFile(List<MultipartFile> list) throws IOException;
    public FileUploadVO uploadFile(java.io.File file, String fileNamePrefix, FileFolderEnum fileFolder);
}
