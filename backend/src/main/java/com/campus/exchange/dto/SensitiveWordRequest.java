package com.campus.exchange.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class SensitiveWordRequest {
    private Long id;

    @NotBlank(message = "敏感词不能为空")
    private String word;

    private String category;
    private Integer level;
    private String replaceWord;
    private Boolean isEnabled;
}
