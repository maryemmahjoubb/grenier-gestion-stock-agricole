using GrenierApi.Models;

namespace GrenierApi.DTOs
{
    public class RegisterDto
    {
        public string Nom { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MotDePasse { get; set; } = string.Empty;
        public RoleUtilisateur Role { get; set; }
    }
}