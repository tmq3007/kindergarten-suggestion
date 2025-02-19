package fa.pjb.back.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI notifOpenAPI(@Value("${application-description}") String appDescription, @Value("${application-version}") String appVersion) {
        OpenAPI openAPI = new OpenAPI();
        openAPI.info(new Info()
                .title("Sample Service API")
                .description(appDescription)
                .version(appVersion)
                .contact(new Contact()
                        .name("Marco Wu")
                        .url("https://www.facebook.com/minh.hieu.ngo.453491")
                        .email("hieunm147@fpt.com"))
                .termsOfService("TOC"));
        return openAPI;
    }
}
