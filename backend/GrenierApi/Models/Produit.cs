using System.ComponentModel.DataAnnotations;

namespace GrenierApi.Models
{
    public class Produit
    {
        public int Id { get; set; }

        [Required]
        public string Nom { get; set; } = string.Empty;

        public string Categorie { get; set; } = string.Empty;

        public decimal PrixUnitaire { get; set; }

        public int QuantiteStock { get; set; } = 0;

        public int SeuilAlerte { get; set; } = 10;

        public int CreeParUserId { get; set; }

        public DateTime DateCreation { get; set; } = DateTime.UtcNow;
    }
}