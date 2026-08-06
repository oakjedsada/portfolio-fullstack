using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Portfolio.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContactMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    TechStack = table.Column<string[]>(type: "text[]", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Icon = table.Column<string>(type: "text", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Proficiency = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "Id", "CreatedAt", "Description", "Icon", "Name", "SortOrder", "Status", "TechStack" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 7, 9, 4, 50, 13, 37, DateTimeKind.Utc).AddTicks(9515), "Dashboard วิเคราะห์ SMS: credit aggregation, sender-type charts, PHP dispatcher ที่สลับ query ตาม period", "📊", "BlingSMS Analytics Dashboard", 1, "Live", new[] { "PHP", "MySQL", "Chart.js" } },
                    { 2, new DateTime(2026, 7, 9, 4, 50, 13, 37, DateTimeKind.Utc).AddTicks(9523), "SQL pipeline สำหรับสรุปสถานะการส่งข้อความ (dn_status) แยกตาม gateway และช่วงเวลา", "📁", "DN Analysis Report Engine", 2, "Done", new[] { "SQL", "MySQL" } },
                    { 3, new DateTime(2026, 7, 9, 4, 50, 13, 37, DateTimeKind.Utc).AddTicks(9526), "สำรวจ API อ่านสลิปโอนเงินไทย เทียบ EasySlip กับ SlipOK", "🔍", "Slip Verification Research", 3, "R&D", new[] { "EasySlip", "SlipOK", "REST API" } },
                    { 4, new DateTime(2026, 7, 9, 4, 50, 13, 37, DateTimeKind.Utc).AddTicks(9528), "ซีรีส์วิดีโอตัวการ์ตูนผักในบริบทไทย ตัดต่อด้วย CapCut", "🎬", "AI Character Video Series", 4, "Creative", new[] { "CapCut", "AI Video" } }
                });

            migrationBuilder.InsertData(
                table: "Skills",
                columns: new[] { "Id", "Category", "Name", "Proficiency", "SortOrder" },
                values: new object[,]
                {
                    { 1, "Backend", "PHP", 80, 1 },
                    { 2, "Database", "MySQL", 75, 2 },
                    { 3, "Frontend", "Chart.js", 95, 3 },
                    { 4, "Frontend", "Bootstrap", 55, 4 },
                    { 5, "Backend", "C# / .NET", 40, 5 },
                    { 6, "Backend", "Flask", 50, 6 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactMessages");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Skills");
        }
    }
}
