package capstone.cyberkids.CyberKids.dtos;

import capstone.cyberkids.CyberKids.Leaderboard.Global.GlobalEntity;

public class GlobalLeaderboardDTO {

    private String realName;
    private String robloxName;
    private int highestScore;
    private String bestTimeTaken;
    private int globalRank;
    private String level;  // <-- new field

    public GlobalLeaderboardDTO(GlobalEntity entity) {
        this.realName = entity.getStudent().getRealNameOrFallback();
        this.robloxName = entity.getStudent().getRobloxName();
        this.highestScore = entity.getHighestScore();
        this.bestTimeTaken = entity.getBestTimeTaken();
        this.globalRank = entity.getGlobalRank();
        this.level = entity.getLevel();  // <-- set from entity
    }

    public GlobalLeaderboardDTO(String realName, String robloxName, int highestScore, String bestTimeTaken, int globalRank, String level) {
        this.realName = realName;
        this.robloxName = robloxName;
        this.highestScore = highestScore;
        this.bestTimeTaken = bestTimeTaken;
        this.globalRank = globalRank;
        this.level = level;  // <-- set from parameter
    }

    public String getRealName() { return realName; }
    public String getRobloxName() { return robloxName; }
    public int getHighestScore() { return highestScore; }
    public String getBestTimeTaken() { return bestTimeTaken; }
    public int getGlobalRank() { return globalRank; }
    public String getLevel() { return level; }  // <-- getter

    public void setGlobalRank(int globalRank) { this.globalRank = globalRank; }
    public void setLevel(String level) { this.level = level; }  // <-- setter
}
