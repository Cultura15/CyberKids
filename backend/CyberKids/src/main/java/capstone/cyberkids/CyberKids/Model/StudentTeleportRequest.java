package capstone.cyberkids.CyberKids.Model;

public class StudentTeleportRequest {
    private String robloxId;
    private String targetWorld;
    private String targetLevel;

    public String getRobloxId() {
        return robloxId;
    }
    public void setRobloxId(String robloxId) {
        this.robloxId = robloxId;
    }

    public String getTargetWorld() {
        return targetWorld;
    }
    public void setTargetWorld(String targetWorld) {
        this.targetWorld = targetWorld;
    }

    public String getTargetLevel() {
        return targetLevel;
    }
    public void setTargetLevel(String targetLevel) {
        this.targetLevel = targetLevel;
    }
}

// CodeRabbit audit trigger