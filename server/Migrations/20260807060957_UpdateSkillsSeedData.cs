using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Portfolio.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSkillsSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 7, 6, 9, 57, 10, DateTimeKind.Utc).AddTicks(3444));

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 7, 6, 9, 57, 10, DateTimeKind.Utc).AddTicks(3450));

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 7, 6, 9, 57, 10, DateTimeKind.Utc).AddTicks(3452));

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 7, 6, 9, 57, 10, DateTimeKind.Utc).AddTicks(3454));

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Name", "Proficiency" },
                values: new object[] { "JavaScript", 65 });

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Name", "Proficiency" },
                values: new object[] { "Tailwind CSS / Bootstrap", 80 });

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 5,
                column: "Proficiency",
                value: 50);

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Category", "Name", "Proficiency" },
                values: new object[] { "Frontend", "React", 40 });

            migrationBuilder.InsertData(
                table: "Skills",
                columns: new[] { "Id", "Category", "Name", "Proficiency", "SortOrder" },
                values: new object[] { 7, "Database", "PostgreSQL", 60, 7 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 9, 4, 50, 13, 37, DateTimeKind.Utc).AddTicks(9515));

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 9, 4, 50, 13, 37, DateTimeKind.Utc).AddTicks(9523));

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 9, 4, 50, 13, 37, DateTimeKind.Utc).AddTicks(9526));

            migrationBuilder.UpdateData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 7, 9, 4, 50, 13, 37, DateTimeKind.Utc).AddTicks(9528));

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Name", "Proficiency" },
                values: new object[] { "Chart.js", 95 });

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Name", "Proficiency" },
                values: new object[] { "Bootstrap", 55 });

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 5,
                column: "Proficiency",
                value: 40);

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Category", "Name", "Proficiency" },
                values: new object[] { "Backend", "Flask", 50 });
        }
    }
}
