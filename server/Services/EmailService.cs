using System.Net;
using System.Net.Mail;

namespace Portfolio.Api.Services;

public interface IEmailService
{
    Task SendContactNotificationAsync(string name, string email, string message);
}

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendContactNotificationAsync(string name, string email, string message)
    {
        var host = _config["Smtp:Host"] ?? "smtp.gmail.com";
        var port = int.Parse(_config["Smtp:Port"] ?? "587");
        var user = _config["Smtp:User"];
        var password = _config["Smtp:Password"];
        var notifyTo = _config["Smtp:NotifyTo"];

        if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(notifyTo))
        {
            _logger.LogWarning("SMTP is not configured (Smtp:User / Smtp:Password / Smtp:NotifyTo) — skipping contact notification email.");
            return;
        }

        using var mail = new MailMessage
        {
            From = new MailAddress(user, "JedOS Portfolio"),
            Subject = $"[Portfolio Contact] ข้อความใหม่จาก {name}",
            Body = $"ชื่อ: {name}\nอีเมล: {email}\n\nข้อความ:\n{message}",
            IsBodyHtml = false,
        };
        mail.To.Add(notifyTo);
        mail.ReplyToList.Add(new MailAddress(email, name));

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(user, password),
            EnableSsl = true,
        };

        await client.SendMailAsync(mail);
    }
}
