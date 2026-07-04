package com.simpolette.dcv.DcvServerApplication;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DcvServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(DcvServerApplication.class, args);
	}

}
