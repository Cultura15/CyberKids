package capstone.cyberkids.CyberKids.dtos;

import capstone.cyberkids.CyberKids.Entity.Scenario;

public class GameScenarioDTO {
    private Long id;
    private String content;
    private String correctAnswer;

    public GameScenarioDTO() {}

    public GameScenarioDTO(Scenario scenario) {
        this.id = scenario.getId();
        this.content = scenario.getContent();
        this.correctAnswer = scenario.getCorrectAnswer().name();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
}