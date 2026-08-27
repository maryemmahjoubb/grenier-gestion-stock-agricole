using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GrenierApi.Data;
using GrenierApi.Models;
using GrenierApi.DTOs;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace GrenierApi.Controllers  
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly GrenierDbContext _context;
        private readonly IConfiguration _config;
        private readonly GrenierApi.Services.EmailService _emailService;

        public AuthController(GrenierDbContext context, IConfiguration config, GrenierApi.Services.EmailService emailService)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            bool emailExiste = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (emailExiste)
            {
                return BadRequest(new { message = "Cet email est déjà utilisé." });
            }

            // Les comptes Admin sont approuvés automatiquement (pas de sens à attendre
            // sa propre validation). Fournisseur et Client restent en attente.
            var statutInitial = dto.Role == RoleUtilisateur.Admin
                ? StatutCompte.Approuve
                : StatutCompte.EnAttente;

            var user = new User
            {
                Nom = dto.Nom,
                Email = dto.Email,
                MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(dto.MotDePasse),
                Role = dto.Role,
                StatutCompte = statutInitial
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var message = statutInitial == StatutCompte.Approuve
                ? "Inscription réussie. Vous pouvez vous connecter dès maintenant."
                : "Inscription réussie. En attente de validation par un administrateur.";

            if (statutInitial == StatutCompte.EnAttente)
            {
                try
                {
                    await _emailService.NotifierNouvelleDemandeAsync(user.Nom, user.Email, user.Role.ToString());
                }
                catch
                {
                    // On n'empêche pas l'inscription si l'email échoue, mais on pourrait logguer l'erreur ici
                }
            }

            return Ok(new { message, userId = user.Id });
        }
        [HttpGet("comptes-en-attente")]
            public async Task<IActionResult> GetComptesEnAttente()
            {
                var comptes = await _context.Users
                    .Where(u => u.StatutCompte == StatutCompte.EnAttente)
                    .Select(u => new
                    {
                        u.Id,
                        u.Nom,
                        u.Email,
                        u.Role,
                        u.DateCreation
                    })
                    .ToListAsync();

                return Ok(comptes);
            }

            [HttpPut("approuver/{id}")]
            public async Task<IActionResult> ApprouverCompte(int id)
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "Utilisateur introuvable." });
                }

                user.StatutCompte = StatutCompte.Approuve;
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Compte de {user.Nom} approuvé." });
            }

            [HttpPut("refuser/{id}")]
            public async Task<IActionResult> RefuserCompte(int id)
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "Utilisateur introuvable." });
                }

                user.StatutCompte = StatutCompte.Refuse;
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Compte de {user.Nom} refusé." });
           }
           // Liste des utilisateurs par rôle (pour les tableaux Clients / Fournisseurs de l'Admin)
        // Liste des utilisateurs par rôle (pour les tableaux Clients / Fournisseurs de l'Admin)
        [Authorize]
        [HttpGet("utilisateurs/{role}")]
        public async Task<IActionResult> GetUtilisateursParRole(string role)
        {
            var roleConnecte = User.FindFirstValue(ClaimTypes.Role);
            if (roleConnecte != RoleUtilisateur.Admin.ToString())
            {
                return Forbid();
            }

            if (!Enum.TryParse<RoleUtilisateur>(role, true, out var roleEnum))
            {
                return BadRequest(new { message = "Rôle invalide." });
            }

            var users = await _context.Users
                .Where(u => u.Role == roleEnum)
                .Select(u => new { u.Id, u.Nom, u.Email, u.StatutCompte, u.DateCreation })
                .ToListAsync();

            return Ok(users);
        }

        // Consultation du statut d'un compte (utilisé par l'écran d'attente)
        [HttpGet("statut-compte")]
        public async Task<IActionResult>  ConsulterStatutCompte([FromQuery] string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound();
            return Ok(new { statut = (int)user.StatutCompte });
        }

        // Relance la notification admin (branchement email à faire avec Mailtrap/MailKit)
        [Authorize]
        [HttpPost("relancer-notification")]
        public async Task<IActionResult> RelancerNotification()
        {
            try
            {
                await _emailService.EnvoyerEmailAsync(
                    _config["Smtp:AdminEmail"]!,
                    "Grenier — Rappel : demande en attente",
                    "<p>Une demande de compte est toujours en attente depuis plus de 5 minutes. Merci de la traiter.</p>"
                );
            }
            catch
            {
                return StatusCode(500, new { message = "Échec de l'envoi de la relance." });
            }

            return Ok(new { message = "L'administrateur a été notifié à nouveau." });
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.MotDePasse, user.MotDePasseHash))
            {
                return Unauthorized(new { message = "Email ou mot de passe incorrect." });
            }

            if (user.StatutCompte != StatutCompte.Approuve)
            {
                return Unauthorized(new { message = "Votre compte n'a pas encore été approuvé par un administrateur." });
            }

            var token = GenererToken(user);

            return Ok(new
            {
                token,
                user = new { user.Id, user.Nom, user.Email, user.Role }
            });
        }

        private string GenererToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(double.Parse(_config["Jwt:DureeEnHeures"]!, System.Globalization.CultureInfo.InvariantCulture)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }   
    }
}
