package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final List<String> ALLOWED_CONTENT_TYPES =
        List.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    public String uploadFile(MultipartFile file, String folder) {
        validateFile(file);
        String filename = UUID.randomUUID() + "_" + sanitizeFilename(file.getOriginalFilename());
        Path dir = Paths.get(uploadDir, folder);
        try {
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            String url = baseUrl + "/uploads/" + folder + "/" + filename;
            log.info("File saved: {}", target.toAbsolutePath());
            return url;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null) return;
        String prefix = baseUrl + "/uploads/";
        if (!fileUrl.startsWith(prefix)) return;
        String relativePath = fileUrl.substring(prefix.length());
        Path target = Paths.get(uploadDir).resolve(relativePath);
        try {
            Files.deleteIfExists(target);
            log.info("File deleted: {}", target);
        } catch (IOException e) {
            log.warn("Could not delete file {}: {}", target, e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 10 MB limit");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only JPEG, PNG, WebP, or GIF images are allowed");
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "file";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
