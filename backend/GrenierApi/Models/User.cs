using System.ComponentModel.DataAnnotations;

namespace GrenierApi.Models
{
    public enum RoleUtilisateur
    {
        SuperAdmin,
        Admin,
        Fournisseur,
        Client
    }

    public enum StatutCompte
    {
        EnAttente,
        Approuve,
        Refuse
    }

    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Nom { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string MotDePasseHash { get; set; } = string.Empty;

        [Required]
        public RoleUtilisateur Role { get; set; }

        public StatutCompte StatutCompte { get; set; } = StatutCompte.EnAttente;

        public DateTime DateCreation { get; set; } = DateTime.UtcNow;
    }
}