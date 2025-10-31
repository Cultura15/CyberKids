package capstone.cyberkids.CyberKids.dtos;

public class StudentStatusDTO {
    private String robloxId;
    private boolean isOnline;

    public StudentStatusDTO() {}

    public StudentStatusDTO(String robloxId, boolean isOnline) {
        this.robloxId = robloxId;
        this.isOnline = isOnline;
    }


    public String getRobloxId() {
        return robloxId;
    }
    public void setRobloxId(String robloxId) {
        this.robloxId = robloxId;
    }

    public boolean isOnline() {
        return isOnline;
    }
    public void setOnline(boolean online) {
        isOnline = online;
    }
}
