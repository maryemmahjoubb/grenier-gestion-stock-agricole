namespace GrenierApi.Models
{
    public enum StatutTransaction
    {
        EnAttente,
        Validee,
        Refusee
    }

    public class Commande
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public int ProduitId { get; set; }
        public int Quantite { get; set; }
        public StatutTransaction Statut { get; set; } = StatutTransaction.EnAttente;
        public DateTime DateCommande { get; set; } = DateTime.UtcNow;
        public int? TraiteParAdminId { get; set; }
    }
}