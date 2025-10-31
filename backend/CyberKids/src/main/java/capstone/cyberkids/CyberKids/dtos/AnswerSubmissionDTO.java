package capstone.cyberkids.CyberKids.dtos;

public class AnswerSubmissionDTO {
    private Long scenarioId;
    private String userAnswer;
    private String playerName;

    public AnswerSubmissionDTO() {}

    public AnswerSubmissionDTO(Long scenarioId, String userAnswer) {
        this.scenarioId = scenarioId;
        this.userAnswer = userAnswer;
    }

    public Long getScenarioId() { return scenarioId; }

    public void setScenarioId(Long scenarioId) { this.scenarioId = scenarioId; }

    public String getUserAnswer() { return userAnswer; }

    public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }

    public String getPlayerName() { return playerName; }

    public void setPlayerName(String playerName) { this.playerName = playerName; }
}