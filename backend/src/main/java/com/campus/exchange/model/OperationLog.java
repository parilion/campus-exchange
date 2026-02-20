package com.campus.exchange.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String username;
    private String operation;
    private String module;
    private String method;
    private String requestUrl;
    private String requestMethod;
    private String requestParams;
    private String requestIp;
    private Integer responseStatus;
    private Long responseTime;
    private String errorMessage;
    private LocalDateTime createdAt;
}
