package com.autowashpro.backend.utils;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Map;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Component;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class QrCodeGenerator {

    private static final int WIDTH = 250;
    private static final int HEIGHT = 250;
    private static final String IMAGE_FORMAT = "PNG";

    /**
     * Sinh QR Code PNG từ bookingCode string.
     * @param content nội dung mã booking (VD: XKVJAB)
     * @return byte[] ảnh PNG
     */
    public byte[] generateQrCode(String content) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(
                    content,
                    BarcodeFormat.QR_CODE,
                    WIDTH,
                    HEIGHT,
                    Map.of(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H));

            BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(bufferedImage, IMAGE_FORMAT, baos);
            byte[] imageBytes = baos.toByteArray();

            log.info("QR Code generated successfully for content: {}", content);
            return imageBytes;
        } catch (WriterException e) {
            log.error("Failed to generate QR Code for content: {}", content, e);
            throw new RuntimeException("Không thể sinh mã QR. Vui lòng thử lại sau!");
        } catch (Exception e) {
            log.error("Unexpected error generating QR Code for content: {}", content, e);
            throw new RuntimeException("Lỗi khi sinh mã QR!");
        }
    }
}
