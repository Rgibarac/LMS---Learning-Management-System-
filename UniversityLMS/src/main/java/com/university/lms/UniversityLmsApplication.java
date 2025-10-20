package com.university.lms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.university.lms", "com.university.lms.lms_backend"})
public class UniversityLmsApplication {

	public static void main(String[] args) {
		SpringApplication.run(UniversityLmsApplication.class, args);
	}

}
