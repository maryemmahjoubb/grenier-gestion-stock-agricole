using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace GrenierApi.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task EnvoyerEmailAsync(string destinataire, string sujet, string corpsHtml)
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(_config["Smtp:From"]));
            message.To.Add(MailboxAddress.Parse(destinataire));
            message.Subject = sujet;
            message.Body = new TextPart("html") { Text = corpsHtml };

            using var client = new SmtpClient();
            await client.ConnectAsync(
                _config["Smtp:Host"],
                int.Parse(_config["Smtp:Port"]!),
                SecureSocketOptions.StartTls
            );
            await client.AuthenticateAsync(_config["Smtp:Username"], _config["Smtp:Password"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }

        public Task NotifierNouvelleDemandeAsync(string nomUtilisateur, string emailUtilisateur, string role)
        {
            var sujet = "Grenier — Nouvelle demande de compte";
            var corps = $@"
                <h2>Nouvelle demande de compte</h2>
                <p><strong>{nomUtilisateur}</strong> ({emailUtilisateur}) a demandé un compte <strong>{role}</strong>.</p>
                <p>Connectez-vous à votre espace Admin pour approuver ou refuser cette demande.</p>";
            return EnvoyerEmailAsync(_config["Smtp:AdminEmail"]!, sujet, corps);
        }
    }
}