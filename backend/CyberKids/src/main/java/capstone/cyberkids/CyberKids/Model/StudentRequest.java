package capstone.cyberkids.CyberKids.Model;

public class StudentRequest {
    private String robloxId;
    private String robloxName;
    private String realName;
    private String classCode;
    private String grade;
    private String section;
    private Boolean isOnline;

    public String getRobloxId() {
        return robloxId;
    }

    public void setRobloxId(String robloxId) {
        this.robloxId = robloxId;
    }

    public String getRobloxName() {
        return robloxName;
    }

    public void setRobloxName(String robloxName) {
        this.robloxName = robloxName;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getGrade() {return grade;}

    public void setGrade(String grade) {this.grade = grade;}

    public Boolean getOnline() {return isOnline;}

    public void setOnline(Boolean online) {isOnline = online;}

    public String getClassCode() {
        return classCode;
    }

    public void setClassCode(String classCode) {
        this.classCode = classCode;
    }
}
