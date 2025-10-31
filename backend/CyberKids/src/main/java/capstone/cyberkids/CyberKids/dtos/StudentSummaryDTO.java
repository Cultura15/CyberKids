package capstone.cyberkids.CyberKids.dtos;

public class StudentSummaryDTO {

    private Long id;
    private String realName;
    private String robloxId;
    private String grade;
    private String section;
    private Boolean isOnline;

    public StudentSummaryDTO() {}

    public StudentSummaryDTO(Long id, String realName, String robloxId, String grade, String section, Boolean isOnline) {
        this.id = id;
        this.realName = realName;
        this.robloxId = robloxId;
        this.grade = grade;
        this.section = section;
        this.isOnline = isOnline;
    }

    public Long getId() { return id; }
    public String getRealName() { return realName; }
    public String getRobloxId() { return robloxId; }
    public String getGrade() { return grade; }
    public String getSection() { return section; }
    public Boolean getIsOnline() { return isOnline; }
}
