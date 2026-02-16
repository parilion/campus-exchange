package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class BargainRequest {

    @NotNull(message = "商品ID不能为空")
    private Long productId;

    @NotNull(message = "原价格不能为空")
    @DecimalMin(value = "0.01", message = "价格必须大于0")
    private BigDecimal originalPrice;

    @NotNull(message = "议价不能为空")
    @DecimalMin(value = "0.01", message = "价格必须大于0")
    private BigDecimal proposedPrice;

    private String message;
}
