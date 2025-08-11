package capstone.cyberkids.CyberKids;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CyberKidsApplication {

	public static void main(String[] args) {
		SpringApplication.run(CyberKidsApplication.class, args);
	}

}
