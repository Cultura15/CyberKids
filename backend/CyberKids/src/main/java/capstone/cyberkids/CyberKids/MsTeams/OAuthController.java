package capstone.cyberkids.CyberKids.MsTeams;

import capstone.cyberkids.CyberKids.Entity.Teacher;
import capstone.cyberkids.CyberKids.JWT.JwtUtil;
import capstone.cyberkids.CyberKids.Model.Role;
import capstone.cyberkids.CyberKids.Repository.TeacherRepo;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/oauth")
public class OAuthController {

    private final JwtUtil jwtUtil;
    private final TeacherRepo teacherRepo;

    @Value("${app.allowed-origins}")
    private String frontendUrl;

    public OAuthController(JwtUtil jwtUtil, TeacherRepo teacherRepo) {
        this.jwtUtil = jwtUtil;
        this.teacherRepo = teacherRepo;
    }

    @GetMapping("/success")
    public void handleOAuthSuccess(@AuthenticationPrincipal OAuth2User principal,
                                   HttpServletResponse response) throws IOException {
        try {
            // Check if principal is null first
            if (principal == null) {
                System.err.println("OAuth2User principal is null - authentication may have failed");
                response.sendRedirect(frontendUrl + "/login?error=authentication_failed");
                return;
            }

            // Log the principal attributes for debugging
            System.out.println("OAuth2User attributes: " + principal.getAttributes());
            System.out.println("OAuth2User authorities: " + principal.getAuthorities());
            System.out.println("OAuth2User name: " + principal.getName());

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
                System.err.println("No email found in OAuth2 response");
                System.err.println("Available attributes: " + principal.getAttributes().keySet());
                System.err.println("Attribute values: " + principal.getAttributes());
                response.sendRedirect(frontendUrl + "/login?error=no_email");
                return;
            }

            // Validate required fields
            if (email.trim().isEmpty()) {
                System.err.println("Email is empty");
                response.sendRedirect(frontendUrl + "/login?error=invalid_email");
                return;
            }

            // Make variables effectively final for lambda
            final String finalEmail = email.toLowerCase().trim(); // Normalize email
            final String finalName = (name != null && !name.trim().isEmpty()) ? name.trim() : "Microsoft User";

            System.out.println("Processing OAuth for email: " + finalEmail + ", name: " + finalName);

            // Find or create teacher
            Teacher teacher = teacherRepo.findByEmail(finalEmail).orElseGet(() -> {
                System.out.println("Creating new teacher for email: " + finalEmail);
                Teacher newTeacher = new Teacher();
                newTeacher.setEmail(finalEmail);
                newTeacher.setFullName(finalName);
                newTeacher.setRole(Role.TEACHER);
                newTeacher.setPassword("oauth2"); // OAuth users don't have passwords
                return teacherRepo.save(newTeacher);
            });

            System.out.println("Teacher found/created: " + teacher.getEmail() + " (ID: " + teacher.getId() + ")");

            // Generate JWT token
            String jwt = jwtUtil.generateToken(
                    teacher.getEmail(),
                    teacher.getRole().name(),
                    teacher.getId(),
                    teacher.getEmail()
            );

            System.out.println("Generated JWT token for teacher: " + teacher.getEmail());

            // Redirect to frontend with parameters
            String redirectUrl = String.format(
                    "%s/oauth/redirect?token=%s&userId=%s&role=%s&email=%s&name=%s",
                    frontendUrl,
                    URLEncoder.encode(jwt, StandardCharsets.UTF_8),
                    URLEncoder.encode(String.valueOf(teacher.getId()), StandardCharsets.UTF_8),
                    URLEncoder.encode(teacher.getRole().name(), StandardCharsets.UTF_8),
                    URLEncoder.encode(teacher.getEmail(), StandardCharsets.UTF_8),
                    URLEncoder.encode(teacher.getFullName(), StandardCharsets.UTF_8)
            );

            System.out.println("Redirecting to: " + redirectUrl);
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            System.err.println("Error processing OAuth success: " + e.getMessage());
            e.printStackTrace();
            response.sendRedirect(frontendUrl + "/login?error=oauth_processing_failed&details=" +
                    URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8));
        }
    }

    @GetMapping("/redirect")
    public void fallbackRedirect(HttpServletResponse response) throws IOException {
        System.err.println("Fallback redirect called - this should not happen in normal flow");
        response.sendRedirect(frontendUrl + "/login?error=invalid_oauth_request");
    }
}

// CodeRabbit audit trigger