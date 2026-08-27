namespace GrenierApi.DTOs
{
    public class ProduitDto
    {
        public string Nom { get; set; } = string.Empty;
        public string Categorie { get; set; } = string.Empty;
        public decimal PrixUnitaire { get; set; }
        public int QuantiteStock { get; set; }
        public int SeuilAlerte { get; set; } = 10;
    }
}