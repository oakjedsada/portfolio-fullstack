namespace Portfolio.Api.Models;

public class Skill
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // 0-100, drives the progress bar width in Skills.exe window
    public int Proficiency { get; set; }

    public string Category { get; set; } = "Backend";
    public int SortOrder { get; set; }
}
