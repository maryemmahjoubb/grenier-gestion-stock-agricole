using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GrenierApi.Data;
using GrenierApi.Models;
using GrenierApi.DTOs;

namespace GrenierApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LivraisonsController : ControllerBase
    {
        private readonly GrenierDbContext _context;

        public LivraisonsController(GrenierDbContext context)
        {
            _context = context;
        }

        private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private string Role => User.FindFirstValue(ClaimTypes.Role)!;

        // Le Fournisseur propose une livraison
        [HttpPost]
        public async Task<IActionResult> Creer(LivraisonDto dto)
        {
            if (Role != RoleUtilisateur.Fournisseur.ToString())
            {
                return Forbid();
            }

            var produit = await _context.Produits.FindAsync(dto.ProduitId);
            if (produit == null) return NotFound(new { message = "Produit introuvable." });

            var livraison = new Livraison
            {
                FournisseurId = UserId,
                ProduitId = dto.ProduitId,
                Quantite = dto.Quantite,
                Statut = StatutTransaction.EnAttente
            };

            _context.Livraisons.Add(livraison);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Livraison proposée. En attente de validation par un administrateur.", livraison.Id });
        }

        // Le Fournisseur voit ses propres livraisons
        [HttpGet("mes-livraisons")]
        public async Task<IActionResult> MesLivraisons()
        {
            var livraisons = await _context.Livraisons
                .Where(l => l.FournisseurId == UserId)
                .Join(_context.Produits, l => l.ProduitId, p => p.Id, (l, p) => new
                {
                    l.Id,
                    Produit = p.Nom,
                    l.Quantite,
                    l.Statut,
                    l.DateProposee
                })
                .OrderByDescending(l => l.DateProposee)
                .ToListAsync();

            return Ok(livraisons);
        }

        // L'Admin voit toutes les livraisons en attente
        [HttpGet("en-attente")]
        public async Task<IActionResult> EnAttente()
        {
            if (Role != RoleUtilisateur.Admin.ToString())
            {
                return Forbid();
            }

            var livraisons = await _context.Livraisons
                .Where(l => l.Statut == StatutTransaction.EnAttente)
                .Join(_context.Produits, l => l.ProduitId, p => p.Id, (l, p) => new { l, p })
                .Join(_context.Users, lp => lp.l.FournisseurId, u => u.Id, (lp, u) => new
                {
                    lp.l.Id,
                    FournisseurNom = u.Nom,
                    Produit = lp.p.Nom,
                    lp.l.Quantite,
                    StockActuel = lp.p.QuantiteStock,
                    lp.l.DateProposee
                })
                .ToListAsync();

            return Ok(livraisons);
        }

        // L'Admin valide une livraison → le stock augmente
        [HttpPut("valider/{id}")]
        public async Task<IActionResult> Valider(int id)
        {
            if (Role != RoleUtilisateur.Admin.ToString())
            {
                return Forbid();
            }

            var livraison = await _context.Livraisons.FindAsync(id);
            if (livraison == null) return NotFound(new { message = "Livraison introuvable." });

            var produit = await _context.Produits.FindAsync(livraison.ProduitId);
            if (produit == null) return NotFound(new { message = "Produit introuvable." });

            produit.QuantiteStock += livraison.Quantite;
            livraison.Statut = StatutTransaction.Validee;
            livraison.TraiteParAdminId = UserId;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Livraison validée. Stock mis à jour." });
        }

        // L'Admin refuse une livraison
        [HttpPut("refuser/{id}")]
        public async Task<IActionResult> Refuser(int id)
        {
            if (Role != RoleUtilisateur.Admin.ToString())
            {
                return Forbid();
            }

            var livraison = await _context.Livraisons.FindAsync(id);
            if (livraison == null) return NotFound(new { message = "Livraison introuvable." });

            livraison.Statut = StatutTransaction.Refusee;
            livraison.TraiteParAdminId = UserId;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Livraison refusée." });
        }
    }
}