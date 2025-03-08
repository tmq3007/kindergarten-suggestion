package fa.pjb.back.service.impl;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.FileContent;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import fa.pjb.back.model.enums.FileFolderEnum;
import fa.pjb.back.service.GGDriveImageService;
import fa.pjb.back.model.vo.ImageVO;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Service
@Slf4j
public class GGDriveImageServiceImpl implements GGDriveImageService {
    private static final Dotenv dotenv = Dotenv.load();
    private static final String SERVICE_ACCOUNT_KEY_PATH = dotenv.get("GOOGLE_APPLICATION_CREDENTIALS");
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private Drive driveService;

    // Caching Drive Service to avoid redundant API calls
    private Drive getDriveService() throws IOException, GeneralSecurityException {
        if (driveService == null) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(SERVICE_ACCOUNT_KEY_PATH))
                    .createScoped(Collections.singleton(DriveScopes.DRIVE));
            HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);
            driveService = new Drive.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    JSON_FACTORY,
                    requestInitializer
            ).setApplicationName("KSS").build();
        }
        return driveService;
    }

    //Process resize images
    //TODO: remake this to return webp file
    private java.io.File processImage(java.io.File file) throws IOException {
        BufferedImage originalImage = ImageIO.read(file);
        String newFileName = file.getName().replaceAll("\\.tmp$", ".png");
        java.io.File resizedFile = new java.io.File("resized_" + newFileName);

        try (OutputStream os = new FileOutputStream(resizedFile)) {
            Thumbnails.of(originalImage)
                    .size(600, 600)  // Resize to max 600px w/h
                    .outputFormat("png") // Ensure output format is JPG
                    .outputQuality(0.9) // Maintain quality while reducing file size
                    .toOutputStream(os);
        }
        return resizedFile;
    }

    @Override
    public ImageVO uploadImage(java.io.File file, String fileNamePrefix, FileFolderEnum fileFolder) {
        java.io.File resizedFile = null;
        try {
            //Process & resize the image
            resizedFile = processImage(file);

            Drive drive = getDriveService();
            String uniqueFileName = fileNamePrefix + UUID.randomUUID() + "_" + file.getName();

            //Prepare metadata
            File fileMetaData = new File();
            fileMetaData.setName(uniqueFileName);
            fileMetaData.setParents(Collections.singletonList(fileFolder.getValue()));

            //Upload resized file
            FileContent fileContent = new FileContent("image/png", resizedFile);
            File uploadFile = drive.files().create(fileMetaData, fileContent)
                    .setFields("id, webContentLink, webViewLink, size")
                    .execute();
            // Set file permissions to be publicly viewable
            Permission permission = new Permission()
                    .setType("anyone")
                    .setRole("reader");
            drive.permissions().create(uploadFile.getId(), permission).execute();

            String imageUrl = "https://drive.google.com/uc?id=" + uploadFile.getId();
            return new ImageVO(200, "Upload successful", uploadFile.getSize(), uploadFile.getName(), uploadFile.getId(), imageUrl);
        } catch (IOException | GeneralSecurityException e) {
            return new ImageVO(500, "Failed to connect to Google Drive or IO problem", 0L, "Failed", "", e.getMessage());
        } finally {
            boolean deleted = file.delete() && resizedFile.delete();
            if (!deleted) {
                log.warn("Original file deletion failed: {}", file.getName());
            }
        }
    }

    @Override
    public List<ImageVO> uploadListImages(List<java.io.File> files, String fileNamePrefix, FileFolderEnum fileFolder) {
        List<ImageVO> uploadResults = Collections.synchronizedList(new ArrayList<>());
        ExecutorService executor = Executors.newFixedThreadPool(10); // Limit to 10 parallel uploads

        List<Future<ImageVO>> futures = new ArrayList<>();
        for (java.io.File file : files) {
            futures.add(executor.submit(() -> uploadImage(file, fileNamePrefix, fileFolder)));
        }

        // Wait for all uploads to complete
        for (Future<ImageVO> future : futures) {
            try {
                uploadResults.add(future.get());
            } catch (Exception e) {
                log.error("Error in bulk upload: {}", e.getMessage());
            }
        }
        executor.shutdown(); // Shutdown thread pool
        return uploadResults;
    }

    //Delete Uploaded Image
    public ImageVO deleteUploadedImage(String fileId) {
        try {
            Drive drive = getDriveService();
            drive.files().delete(fileId).execute();
            log.info("File deleted successfully: {}", fileId);
            return new ImageVO(200, "File deleted successfully", 0L, "Deleted", fileId, "File deleted successfully.");
        } catch (IOException | GeneralSecurityException e) {
            log.error("Failed to delete file: {}", e.getMessage());
            return new ImageVO(500, "Failed to delete file", 0L, fileId, "Failed", e.getMessage());
        }
    }

    public List<java.io.File> convertMultiPartFileToFile(List<MultipartFile> list) throws IOException {
        List<java.io.File> res = new ArrayList<>();
        assert list != null;
        for (MultipartFile multipartFile : list) {
            java.io.File tempFile = java.io.File.createTempFile("temp", null);
            multipartFile.transferTo(tempFile);
            res.add(tempFile);
        }
        return res;
    }

}
