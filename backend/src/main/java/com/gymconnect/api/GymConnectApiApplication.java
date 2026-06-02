package com.gymconnect.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GymConnectApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(GymConnectApiApplication.class, args);
    }

}
