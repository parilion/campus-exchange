package com.campus.exchange.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("product")
public class Product {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String description;

    private BigDecimal price;

    private BigDecimal originalPrice;

    private Long categoryId;

    /** NEW, LIKE_NEW, GOOD, FAIR, POOR */
    @TableField("`condition`")
    private String condition;

    /** ON_SALE, SOLD, OFF_SHELF */
    private String status;

    /** 交易方式：ONLINE, OFFLINE */
    private String tradeType;

    /** 交易地点（线下交易时使用） */
    private String tradeLocation;

    /** JSON 数组存储图片路径 */
    private String images;

    private Long sellerId;

    private Integer viewCount;

    private Integer favoriteCount;

    /** 是否置顶 */
    private Boolean isTop;

    /** 置顶过期时间 */
    private LocalDateTime topExpireAt;

    /** 标签（JSON数组存储） */
    private String tags;

    /** 是否草稿：0-已发布，1-草稿 */
    private Boolean isDraft;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
