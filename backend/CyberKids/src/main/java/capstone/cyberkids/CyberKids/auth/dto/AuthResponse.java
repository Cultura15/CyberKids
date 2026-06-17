package capstone.cyberkids.CyberKids.auth.dto;

public class AuthResponse {
    private String token;
    private Long id;
    private String role;
    private String username;

    public AuthResponse(String token, Long id, String role, String username) {
        this.token = token;
        this.id = id;
        this.role = role;
        this.username = username;
    }

    public String getToken() {return token;}
    public void setToken(String token) {this.token = token;}

    public Long getId(){return id;}
    public void setId(Long id){this.id = id;}

    public String getRole(){return role;}
    public void setRole(String role){this.role = role;}

    public String getUsername(){return username;}
    public void setUsername(String username){this.username = username;}

}
