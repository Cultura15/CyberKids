package capstone.cyberkids.CyberKids.dtos;

public class ClassEditRequest {

    private String grade;
    private String section;
    private Integer maxStudents;

    public ClassEditRequest() {}

    public String getGrade() {return grade;}
    public void setGrade(String grade) {this.grade = grade;}

    public String getSection() {return section;}
    public void setSection(String section) {this.section = section;}

    public Integer getMaxStudents() {return maxStudents;}
    public void setMaxStudents(Integer maxStudents) {this.maxStudents = maxStudents;}
}
