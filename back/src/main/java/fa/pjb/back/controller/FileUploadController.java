package fa.pjb.back.controller;

import fa.pjb.back.model.enums.FileFolderEnum;
import fa.pjb.back.model.vo.FileUploadVO;
import fa.pjb.back.service.GCPFileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/upload")
@Slf4j
public class FileUploadController {

    private final GCPFileStorageService gcpFileStorageService;

    @Autowired
    public FileUploadController(GCPFileStorageService gcpFileStorageService) {
        this.gcpFileStorageService = gcpFileStorageService;
    }

    // Test uploading a single file
    @PostMapping(value = "/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileUploadVO> uploadSingleFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "prefix", defaultValue = "file_") String fileNamePrefix,
            @RequestParam(value = "folder", defaultValue = "SCHOOL_IMAGES") FileFolderEnum folder) {
        try {
            List<java.io.File> tempFiles = gcpFileStorageService.convertMultiPartFileToFile(List.of(file));
            if (tempFiles.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new FileUploadVO(400, "No valid file provided", 0L, "Failed", "", ""));
            }

            FileUploadVO result = gcpFileStorageService.uploadFile(tempFiles.get(0), fileNamePrefix, folder);
            return ResponseEntity.status(result.status()).body(result);
        } catch (IOException e) {
            log.error("Error uploading single file: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(new FileUploadVO(500, "Failed to process file: " + e.getMessage(), 0L, "Failed", "", ""));
        }
    }

    // Test uploading a single image with resizing
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileUploadVO> uploadSingleImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "prefix", defaultValue = "image_") String fileNamePrefix,
            @RequestParam(value = "folder", defaultValue = "IMAGES") FileFolderEnum folder) {
        try {
            List<java.io.File> tempFiles = gcpFileStorageService.convertMultiPartFileToFile(List.of(file));
            if (tempFiles.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new FileUploadVO(400, "No valid file provided", 0L, "Failed", "", ""));
            }

            FileUploadVO result = gcpFileStorageService.uploadImage(tempFiles.get(0), fileNamePrefix, folder);
            return ResponseEntity.status(result.status()).body(result);
        } catch (IOException e) {
            log.error("Error uploading single image: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(new FileUploadVO(500, "Failed to process image: " + e.getMessage(), 0L, "Failed", "", ""));
        }
    }

    // Test uploading multiple files in parallel
    @PostMapping(value = "/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<FileUploadVO>> uploadMultipleFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "prefix", defaultValue = "file_") String fileNamePrefix,
            @RequestParam(value = "folder", defaultValue = "FILES") FileFolderEnum folder) {
        try {
            List<java.io.File> tempFiles = gcpFileStorageService.convertMultiPartFileToFile(files);
            if (tempFiles.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(List.of(new FileUploadVO(400, "No valid files provided", 0L, "Failed", "", "")));
            }

            List<FileUploadVO> results = gcpFileStorageService.uploadListFiles(tempFiles, fileNamePrefix, folder, gcpFileStorageService::uploadFile);
            return ResponseEntity.ok(results);
        } catch (IOException e) {
            log.error("Error uploading multiple files: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(List.of(new FileUploadVO(500, "Failed to process files: " + e.getMessage(), 0L, "Failed", "", "")));
        }
    }

    // Test uploading multiple images in parallel
    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<FileUploadVO>> uploadMultipleImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "prefix", defaultValue = "image_") String fileNamePrefix,
            @RequestParam(value = "folder", defaultValue = "IMAGES") FileFolderEnum folder) {
        try {
            List<java.io.File> tempFiles = gcpFileStorageService.convertMultiPartFileToFile(files);
            if (tempFiles.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(List.of(new FileUploadVO(400, "No valid files provided", 0L, "Failed", "", "")));
            }

            List<FileUploadVO> results = gcpFileStorageService.uploadListFiles(tempFiles, fileNamePrefix, folder, gcpFileStorageService::uploadImage);
            return ResponseEntity.ok(results);
        } catch (IOException e) {
            log.error("Error uploading multiple images: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(List.of(new FileUploadVO(500, "Failed to process images: " + e.getMessage(), 0L, "Failed", "", "")));
        }
    }

    // Test deleting a file
    @DeleteMapping("/file")
    public ResponseEntity<FileUploadVO> deleteFile(@RequestParam("fileId") String fileId) {
        FileUploadVO result = gcpFileStorageService.deleteUploadedImage(fileId);
        return ResponseEntity.status(result.status()).body(result);
    }
}