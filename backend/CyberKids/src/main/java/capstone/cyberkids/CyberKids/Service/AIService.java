package capstone.cyberkids.CyberKids.Service;

import capstone.cyberkids.CyberKids.Config.AIConfig;
import capstone.cyberkids.CyberKids.Entity.Scenario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIService {

    @Autowired
    private AIConfig gptConfig;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getGptResponse(String userInput) {
        String url = gptConfig.getApiUrl();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(gptConfig.getApiKey());

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4o-mini");
        // OPTIMIZED: Reduced max_tokens for faster responses
        requestBody.put("max_tokens", 100);
        // OPTIMIZED: Slightly higher temperature for more natural responses
        requestBody.put("temperature", 0.7);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "user", "content", userInput));
        requestBody.put("messages", messages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            System.err.println("Error calling AI API: " + e.getMessage());
        }

        return "Unable to generate AI feedback at this time.";
    }

    public String generateScenarioFeedback(Scenario scenario, String userAnswer, boolean isCorrect) {
        String correctAnswer = scenario.getCorrectAnswer().name();
        String scenarioContent = scenario.getContent();

        String prompt = createFeedbackPrompt(scenarioContent, correctAnswer, userAnswer, isCorrect);
        return getGptResponse(prompt);
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