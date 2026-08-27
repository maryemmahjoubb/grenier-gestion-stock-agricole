using Microsoft.EntityFrameworkCore;
using GrenierApi.Models;

namespace GrenierApi.Data
{
    public class GrenierDbContext : DbContext
    {
        public GrenierDbContext(DbContextOptions<GrenierDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Produit> Produits { get; set; }
        public DbSet<Commande> Commandes { get; set; }
        public DbSet<Livraison> Livraisons { get; set; }
    }
}