using Microsoft.AspNetCore.Mvc;
using Portfolio.Api.Data;
using Portfolio.Api.Models;
using Portfolio.Api.Services;

namespace Portfolio.Api.Controllers;

public record ContactRequest(string Name, string Email, string Message);

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;
    private readonly ILogger<ContactController> _logger;

    public ContactController(AppDbContext db, IEmailService email, ILogger<ContactController> logger)
    {
        _db = db;
        _email = email;
        _logger = logger;
    }

    // POST /api/contact
    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] ContactRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { error = "กรุณากรอกชื่อ อีเมล และข้อความให้ครบ" });
        }

        var entry = new ContactMessage
        {
            Name = request.Name,
            Email = request.Email,
            Message = request.Message
        };

        _db.ContactMessages.Add(entry);
        await _db.SaveChangesAsync();

        try
        {
            await _email.SendContactNotificationAsync(request.Name, request.Email, request.Message);
        }
        catch (Exception ex)
        {
            // The message is already saved — don't fail the request just because the notification email failed.
            _logger.LogError(ex, "Failed to send contact notification email for message {Id}", entry.Id);
        }

        return Ok(new { success = true, id = entry.Id });
    }
}
