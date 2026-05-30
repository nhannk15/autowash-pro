package com.autowashpro.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.model.enums.Role;
import com.autowashpro.backend.repository.UserRepository;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner commandLineRunner(UserRepository repository, PasswordEncoder encoder) {
		return args -> {
			String password = encoder.encode("21012006");
			User user1 = new User(
					null,
					"nhannk15@gmail.com",
					null,
					password,
					"Nguyen Khac Le Nhan",
					"0945692584",
					"AVATAR",
					Role.CUSTOMER,
					false,
					null,
					null);
			repository.save(user1);

			User user2 = new User(
					null,
					"nhannk2101@gmail.com",
					null,
					password,
					"Dang Nhat Thien Bao",
					"0333666666",
					"AVATAR",
					Role.CUSTOMER,
					false,
					null,
					null);
			repository.save(user2);
		};
	}

}
