package capstone.cyberkids.CyberKids.dtos;

public class ScenarioRequestDTO {
    private String content;
    private Long classId;

    public ScenarioRequestDTO() {}

    public ScenarioRequestDTO(String content) {
        this.content = content;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Long getClassId() {return classId;}
    public void setClassId(Long classId) {this.classId = classId;}

}
