namespace Portfolio.Api.Models;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string[] TechStack { get; set; } = Array.Empty<string>();

    // "Live" | "Done" | "R&D" | "Creative"
    public string Status { get; set; } = "Done";

    // Which desktop "window" / icon this project appears under (e.g. "projects")
    public string Icon { get; set; } = "📁";

    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
