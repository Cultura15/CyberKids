package capstone.cyberkids.CyberKids.dtos;

import capstone.cyberkids.CyberKids.Entity.Scenario;

import java.util.Date;

public class ScenarioDTO {
    private Long id;
    private String content;
    private Long classId;
    private Boolean active;
    private String teacherName;
    private Date createdAt;
    private Date updatedAt;

    public ScenarioDTO() {}

    public ScenarioDTO(Scenario scenario) {
        this.id = scenario.getId();
        this.content = scenario.getContent();
        this.active = scenario.isActive();
        this.teacherName = scenario.getTeacher().getFullName();
        this.createdAt = scenario.getCreatedAt();
        this.updatedAt = scenario.getUpdatedAt();

        // ✅ This line was missing
        if (scenario.getClassEntity() != null) {
            this.classId = scenario.getClassEntity().getId();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }
}
