package capstone.cyberkids.CyberKids.Config;

import capstone.cyberkids.CyberKids.entity.Teacher;
import capstone.cyberkids.CyberKids.auth.service.CustomUserDetailsService;
import capstone.cyberkids.CyberKids.auth.JWT.JwtRequestFilter;
import capstone.cyberkids.CyberKids.auth.JWT.JwtUtil;
import capstone.cyberkids.CyberKids.Model.Role;
import capstone.cyberkids.CyberKids.repository.TeacherRepo;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtUtil jwtUtil;
    private final TeacherRepo teacherRepo;

    @Value("${app.allowed-origins}")
    private String frontendUrl;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService, JwtUtil jwtUtil, TeacherRepo teacherRepo) {
        this.customUserDetailsService = customUserDetailsService;
        this.jwtUtil = jwtUtil;
        this.teacherRepo = teacherRepo;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return new ProviderManager(List.of(authProvider));
    }

    @Bean
    public JwtRequestFilter jwtRequestFilter(CustomUserDetailsService customUserDetailsService, JwtUtil jwtUtil) {
        return new JwtRequestFilter(jwtUtil, customUserDetailsService);
    }

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        return new DefaultOAuth2UserService();
    }

    @Bean
    public AuthenticationSuccessHandler oauth2SuccessHandler() {
        return new AuthenticationSuccessHandler() {
            @Override
            public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                                Authentication authentication) throws IOException, ServletException {
                try {
                    OAuth2User principal = (OAuth2User) authentication.getPrincipal();

                    if (principal == null) {
                        log.error("OAuth2User principal is null - authentication may have failed");
                        response.sendRedirect(frontendUrl + "/login?error=authentication_failed");
                        return;
                    }

                    // Extract user information - try multiple attribute names
                    String email = principal.getAttribute("mail");
                    if (email == null) {
                        email = principal.getAttribute("userPrincipalName");
                    }
                    if (email == null) {
                        email = principal.getAttribute("email"); // from OIDC userinfo endpoint
                    }
                    if (email == null) {
                        email = principal.getAttribute("preferred_username");
                    }

                    String name = principal.getAttribute("displayName");
                    if (name == null) {
                        name = principal.getAttribute("name"); // from OIDC userinfo endpoint
                    }
                    if (name == null) {
                        name = principal.getAttribute("given_name");
                    }

                    String id = principal.getAttribute("id");
                    if (id == null) {
                        id = principal.getAttribute("sub"); // from OIDC userinfo endpoint
                    }
                    if (id == null) {
                        id = principal.getAttribute("oid"); // Microsoft-specific object ID
                    }

                    // Debug: Print all available attributes if email is still null
                    if (email == null) {
                        log.error("No email found in OAuth2 response. Available attribute keys: {}", principal.getAttributes().keySet());
                        response.sendRedirect(frontendUrl + "/login?error=no_email");
                        return;
                    }

                    // Validate required fields
                    if (email.trim().isEmpty()) {
                        log.warn("OAuth2 email attribute is empty for principal: {}", principal.getName());
                        response.sendRedirect(frontendUrl + "/login?error=invalid_email");
                        return;
                    }

                    // Make variables effectively final for lambda
                    final String finalEmail = email.toLowerCase().trim(); // Normalize email
                    final String finalName = (name != null && !name.trim().isEmpty()) ? name.trim() : "Microsoft User";

                    log.info("Processing OAuth2 login for: {}", finalEmail);

                    // Find or create teacher
                    Teacher teacher = teacherRepo.findByEmail(finalEmail).orElseGet(() -> {
                        log.info("New teacher registered via OAuth2: {}", finalEmail);
                        Teacher newTeacher = new Teacher();
                        newTeacher.setEmail(finalEmail);
                        newTeacher.setFullName(finalName);
                        newTeacher.setRole(Role.TEACHER);
                        newTeacher.setPassword("oauth2");
                        return teacherRepo.save(newTeacher);
                    });

                    // Generate JWT token
                    String jwt = jwtUtil.generateToken(
                            teacher.getEmail(),
                            teacher.getRole().name(),
                            teacher.getId(),
                            teacher.getEmail()
                    );

                    log.info("JWT generated successfully for: {}", teacher.getEmail());
                    String redirectUrl = String.format(
                            "%s/oauth-callback?token=%s&userId=%s&role=%s&email=%s&name=%s",
                            frontendUrl,
                            URLEncoder.encode(jwt, StandardCharsets.UTF_8),
                            URLEncoder.encode(String.valueOf(teacher.getId()), StandardCharsets.UTF_8),
                            URLEncoder.encode(teacher.getRole().name(), StandardCharsets.UTF_8),
                            URLEncoder.encode(teacher.getEmail(), StandardCharsets.UTF_8),
                            URLEncoder.encode(teacher.getFullName(), StandardCharsets.UTF_8)
                    );

                    response.sendRedirect(redirectUrl);

                } catch (Exception e) {
                    log.error("Error processing OAuth2 success handler", e);
                    response.sendRedirect(frontendUrl + "/login?error=oauth_processing_failed&details=" +
                            URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8));
                }
            }
        };
    }

    @Bean
    public SecurityFilterChain defaultSecurityChain(HttpSecurity http, JwtRequestFilter jwtRequestFilter) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/ws/**", "/topic/**", "/app/**").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/teacher/register", "/api/oauth/**").permitAll()
                        .requestMatchers("/login/oauth2/**").permitAll()
                        .requestMatchers("/api/classes/all-classes").permitAll()
                        .requestMatchers("/api/teacher/is-world-locked").permitAll()
                        .requestMatchers("/api/student/**").permitAll()
                        .requestMatchers("/api/scores/**").permitAll()
                        .requestMatchers("/api/timer/**").permitAll()
                        .requestMatchers("/api/challenges/*").permitAll()
                        .requestMatchers("/api/leaderboard/info-sorting/**").permitAll()
                        .requestMatchers("/api/leaderboard/password-sec/**").permitAll()
                        .requestMatchers("/api/leaderboard/phishing/**").permitAll()
                        .requestMatchers("/api/teacher/**").hasRole("TEACHER")
                        .requestMatchers("/api/classes/{classCode}/is-world-locked").permitAll()
                        .requestMatchers("/api/classes/**").hasRole("TEACHER")
                        .requestMatchers("/api/scenarios/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oauth2SuccessHandler())
                        .failureHandler((request, response, exception) -> {
                            log.error("OAuth2 login failed: {}", exception.getMessage());
                            exception.printStackTrace();
                            response.sendRedirect(frontendUrl + "/login?error=oauth_failed");
                        })
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oauth2UserService())
                        )
                )
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of(frontendUrl)); // Only one origin
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}