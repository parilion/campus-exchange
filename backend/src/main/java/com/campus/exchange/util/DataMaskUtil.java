package com.campus.exchange.util;

/**
 * 数据脱敏工具类
 * 用于对敏感信息进行脱敏处理
 */
public class DataMaskUtil {

    /**
     * 手机号脱敏
     * 显示前3位和后4位，如：138****1234
     */
    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    /**
     * 邮箱脱敏
     * 显示前2位和@后的域名，如：te***@example.com
     */
    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }
        String[] parts = email.split("@");
        String username = parts[0];
        String domain = parts[1];

        if (username.length() <= 2) {
            return username.charAt(0) + "***@" + domain;
        }
        return username.substring(0, 2) + "***@" + domain;
    }

    /**
     * 身份证号脱敏
     * 显示前3位和后4位，如：110***1234
     */
    public static String maskIdCard(String idCard) {
        if (idCard == null || idCard.length() < 10) {
            return idCard;
        }
        return idCard.substring(0, 3) + "***********" + idCard.substring(idCard.length() - 4);
    }

    /**
     * 银行卡号脱敏
     * 显示前4位和后4位，如：6228****1234
     */
    public static String maskBankCard(String bankCard) {
        if (bankCard == null || bankCard.length() < 8) {
            return bankCard;
        }
        return bankCard.substring(0, 4) + "********" + bankCard.substring(bankCard.length() - 4);
    }

    /**
     * 姓名脱敏
     * 只显示第一个字，如：张三 -> 张*
     */
    public static String maskName(String name) {
        if (name == null || name.length() < 2) {
            return name;
        }
        if (name.length() == 2) {
            return name.charAt(0) + "*";
        }
        return name.charAt(0) + "**";
    }

    /**
     * 地址脱敏
     * 只显示到市级别
     */
    public static String maskAddress(String address) {
        if (address == null || address.length() < 4) {
            return address;
        }
        // 尝试找到省/市后面的内容并替换为***
        int provinceIndex = address.indexOf("省");
        int cityIndex = address.indexOf("市");

        if (provinceIndex > 0 && cityIndex > provinceIndex) {
            return address.substring(0, cityIndex + 1) + "***";
        } else if (cityIndex > 0) {
            return address.substring(0, cityIndex + 1) + "***";
        }
        // 如果无法解析，只保留前6个字符
        return address.substring(0, Math.min(6, address.length())) + "***";
    }
}
