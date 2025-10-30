package com.datagovernance.service;

import org.springframework.boot.SpringApplication;

public class TestBackendDataGovernanceServiceApplication {

	public static void main(String[] args) {
		SpringApplication.from(BackendDataGovernanceServiceApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
