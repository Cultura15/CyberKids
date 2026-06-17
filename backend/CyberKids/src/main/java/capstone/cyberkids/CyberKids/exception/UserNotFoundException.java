package capstone.cyberkids.CyberKids.exception;

public class UserNotFoundException extends RuntimeException{
    public UserNotFoundException (String email){
        super("User not found: " + email);
    }
}
