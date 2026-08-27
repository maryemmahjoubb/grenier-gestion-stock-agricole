namespace GrenierApi.Models
{
    public class Livraison
    {
        public int Id { get; set; }
        public int FournisseurId { get; set; }
        public int ProduitId { get; set; }
        public int Quantite { get; set; }
        public StatutTransaction Statut { get; set; } = StatutTransaction.EnAttente;
        public DateTime DateProposee { get; set; } = DateTime.UtcNow;
        public int? TraiteParAdminId { get; set; }
    }
}