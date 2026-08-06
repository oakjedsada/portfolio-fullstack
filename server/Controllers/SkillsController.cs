using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SkillsController(AppDbContext db) => _db = db;

    // GET /api/skills
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var skills = await _db.Skills
            .OrderBy(s => s.SortOrder)
            .ToListAsync();
        return Ok(skills);
    }
}
