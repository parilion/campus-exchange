package com.campus.exchange.controller;

import com.campus.exchange.util.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 图片上传控制器
 */
@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Value("${file.upload.path:./uploads}")
    private String uploadPath;

    @Value("${file.upload.max-size:10485760}")
    private long maxFileSize;

    @Value("${server.port:8080}")
    private int serverPort;

    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    /**
     * 上传单张图片
     */
    @PostMapping("/upload")
    public Result<String> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("请选择要上传的图片");
        }

        // 验证文件类型
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            return Result.error("只支持 JPG、PNG、GIF、WebP 格式的图片");
        }

        // 验证文件大小
        if (file.getSize() > maxFileSize) {
            return Result.error("图片大小不能超过 10MB");
        }

        try {
            // 生成日期目录
            String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            File uploadDir = new File(uploadPath, dateDir);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString().replace("-", "") + extension;

            // 保存文件
            Path targetPath = Paths.get(uploadDir.getAbsolutePath(), filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // 返回图片URL
            String imageUrl = "/uploads/" + dateDir + "/" + filename;
            return Result.success(imageUrl);
        } catch (IOException e) {
            return Result.error("图片上传失败：" + e.getMessage());
        }
    }

    /**
     * 上传多张图片
     */
    @PostMapping("/upload-multiple")
    public Result<List<String>> uploadMultipleImages(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return Result.error("请选择要上传的图片");
        }

        if (files.length > 9) {
            return Result.error("最多只能上传 9 张图片");
        }

        List<String> imageUrls = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            if (file.isEmpty()) {
                errors.add("第 " + (i + 1) + " 张图片为空");
                continue;
            }

            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
                errors.add("第 " + (i + 1) + " 张图片格式不支持");
                continue;
            }

            if (file.getSize() > maxFileSize) {
                errors.add("第 " + (i + 1) + " 张图片大小超过限制");
                continue;
            }

            try {
                String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
                File uploadDir = new File(uploadPath, dateDir);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }

                String originalFilename = file.getOriginalFilename();
                String extension = getFileExtension(originalFilename);
                String filename = UUID.randomUUID().toString().replace("-", "") + extension;

                Path targetPath = Paths.get(uploadDir.getAbsolutePath(), filename);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

                String imageUrl = "/uploads/" + dateDir + "/" + filename;
                imageUrls.add(imageUrl);
            } catch (IOException e) {
                errors.add("第 " + (i + 1) + " 张图片上传失败");
            }
        }

        if (!errors.isEmpty() && imageUrls.isEmpty()) {
            return Result.error(String.join("; ", errors));
        }

        if (!errors.isEmpty()) {
            // 部分成功，部分失败
            return Result.success(imageUrls);
        }

        return Result.success(imageUrls);
    }

    /**
     * 删除图片
     */
    @DeleteMapping
    public Result<Void> deleteImage(@RequestParam("url") String imageUrl) {
        try {
            // 防止路径遍历攻击
            if (imageUrl.contains("..") || imageUrl.contains("/..")) {
                return Result.error("无效的图片路径");
            }

            String relativePath = imageUrl;
            if (imageUrl.startsWith("/uploads/")) {
                relativePath = imageUrl.substring("/uploads/".length());
            }

            Path filePath = Paths.get(uploadPath, relativePath);
            File file = filePath.toFile();

            if (file.exists() && file.isFile()) {
                Files.delete(filePath);
                return Result.success(null);
            } else {
                return Result.error("图片不存在");
            }
        } catch (IOException e) {
            return Result.error("删除图片失败：" + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return ".jpg";
        }
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0) {
            return filename.substring(lastDot).toLowerCase();
        }
        return ".jpg";
    }
}
