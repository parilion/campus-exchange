package com.campus.exchange;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.campus.exchange.mapper")
@EnableScheduling
public class CampusExchangeApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusExchangeApplication.class, args);
    }
}
