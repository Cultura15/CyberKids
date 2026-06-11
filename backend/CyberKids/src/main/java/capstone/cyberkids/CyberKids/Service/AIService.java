package capstone.cyberkids.CyberKids.Service;

import capstone.cyberkids.CyberKids.Entity.Scenario;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class AIService {

    private final ChatModel chatModel;

    public AIService(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String getGeminiResponse(String userInput) {
        try {
            String response = chatModel.call(userInput);
            return response;
        } catch (Exception e) {
            return "Unable to generate AI feedback at this time.";
        }
    }

    public String generateScenarioFeedback(Scenario scenario, String userAnswer, boolean isCorrect) {
        String correctAnswer = scenario.getCorrectAnswer().name();
        String scenarioContent = scenario.getContent();

        String prompt = createFeedbackPrompt(scenarioContent, correctAnswer, userAnswer, isCorrect);
        return getGeminiResponse(prompt);
    }

    private String createFeedbackPrompt(String scenario, String correctAnswer, String userAnswer, boolean isCorrect) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are a cybersecurity education assistant for children aged 8-12. ");
        prompt.append("Provide feedback in EXACTLY 2 SENTENCES for this cyber safety scenario.\n\n");
        prompt.append("Scenario: ").append(scenario).append("\n");
        prompt.append("Correct Answer: ").append(correctAnswer).append("\n");
        prompt.append("Student's Answer: ").append(userAnswer).append("\n");
        prompt.append("Student was: ").append(isCorrect ? "CORRECT" : "INCORRECT").append("\n\n");

        if (isCorrect) {
            prompt.append("Generate positive feedback in EXACTLY 2 SENTENCES that:");
            prompt.append("\n- First sentence: Congratulate the student");
            prompt.append("\n- Second sentence: Briefly explain why their answer was correct");
            prompt.append("\n- Use simple, child-friendly language");
            prompt.append("\n- MUST be exactly 2 sentences, no more, no less!");
        } else {
            prompt.append("Generate constructive feedback in EXACTLY 2 SENTENCES that:");
            prompt.append("\n- First sentence: Gently explain the mistake");
            prompt.append("\n- Second sentence: Teach the correct cyber safety lesson");
            prompt.append("\n- Use simple, child-friendly language");
            prompt.append("\n- MUST be exactly 2 sentences, no more, no less!");
        }

        return prompt.toString();
    }
}