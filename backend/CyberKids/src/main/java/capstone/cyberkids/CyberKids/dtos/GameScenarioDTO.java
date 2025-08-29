package capstone.cyberkids.CyberKids.dtos;

import capstone.cyberkids.CyberKids.Entity.Scenario;

public class GameScenarioDTO {
    private Long id;
    private String content;

    public GameScenarioDTO() {}

    public GameScenarioDTO(Scenario scenario) {
        this.id = scenario.getId();
        this.content = scenario.getContent();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
