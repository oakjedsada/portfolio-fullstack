using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Models;

namespace Portfolio.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // PostgreSQL native array column instead of a join table
        builder.Entity<Project>()
            .Property(p => p.TechStack)
            .HasColumnType("text[]");

        builder.Entity<Project>().HasData(
            new Project
            {
                Id = 1,
                Name = "BlingSMS Analytics Dashboard",
                Description = "Dashboard วิเคราะห์ SMS: credit aggregation, sender-type charts, PHP dispatcher ที่สลับ query ตาม period",
                TechStack = new[] { "PHP", "MySQL", "Chart.js" },
                Status = "Live",
                Icon = "📊",
                SortOrder = 1
            },
            new Project
            {
                Id = 2,
                Name = "DN Analysis Report Engine",
                Description = "SQL pipeline สำหรับสรุปสถานะการส่งข้อความ (dn_status) แยกตาม gateway และช่วงเวลา",
                TechStack = new[] { "SQL", "MySQL" },
                Status = "Done",
                Icon = "📁",
                SortOrder = 2
            },
            new Project
            {
                Id = 3,
                Name = "Slip Verification Research",
                Description = "สำรวจ API อ่านสลิปโอนเงินไทย เทียบ EasySlip กับ SlipOK",
                TechStack = new[] { "EasySlip", "SlipOK", "REST API" },
                Status = "R&D",
                Icon = "🔍",
                SortOrder = 3
            },
            new Project
            {
                Id = 4,
                Name = "AI Character Video Series",
                Description = "ซีรีส์วิดีโอตัวการ์ตูนผักในบริบทไทย ตัดต่อด้วย CapCut",
                TechStack = new[] { "CapCut", "AI Video" },
                Status = "Creative",
                Icon = "🎬",
                SortOrder = 4
            }
        );

        builder.Entity<Skill>().HasData(
            new Skill { Id = 1, Name = "PHP", Proficiency = 80, Category = "Backend", SortOrder = 1 },
            new Skill { Id = 2, Name = "MySQL", Proficiency = 75, Category = "Database", SortOrder = 2 },
            new Skill { Id = 3, Name = "Chart.js", Proficiency = 95, Category = "Frontend", SortOrder = 3 },
            new Skill { Id = 4, Name = "Bootstrap", Proficiency = 55, Category = "Frontend", SortOrder = 4 },
            new Skill { Id = 5, Name = "C# / .NET", Proficiency = 40, Category = "Backend", SortOrder = 5 },
            new Skill { Id = 6, Name = "Flask", Proficiency = 50, Category = "Backend", SortOrder = 6 }
        );
    }
}
