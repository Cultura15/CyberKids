package capstone.cyberkids.CyberKids.dtos;

public class FeedbackResponseDTO {
    private String feedback;
    private boolean isCorrect;
    private String correctAnswer;
    private String userAnswer;
    private Long scenarioId;

    public FeedbackResponseDTO() {}

    public FeedbackResponseDTO(String feedback, boolean isCorrect, String correctAnswer, String userAnswer, Long scenarioId) {
        this.feedback = feedback;
        this.isCorrect = isCorrect;
        this.correctAnswer = correctAnswer;
        this.userAnswer = userAnswer;
        this.scenarioId = scenarioId;
    }


    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public boolean isCorrect() { return isCorrect; }
    public void setCorrect(boolean correct) { isCorrect = correct; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public String getUserAnswer() { return userAnswer; }
    public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }

    public Long getScenarioId() { return scenarioId; }
    public void setScenarioId(Long scenarioId) { this.scenarioId = scenarioId; }
}