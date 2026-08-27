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
    public class CommandesController : ControllerBase
    {
        private readonly GrenierDbContext _context;

        public CommandesController(GrenierDbContext context)
        {
            _context = context;
        }

        private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private string Role => User.FindFirstValue(ClaimTypes.Role)!;

        // Le Client crée une commande
        [HttpPost]
        public async Task<IActionResult> Creer(CommandeDto dto)
        {
            if (Role != RoleUtilisateur.Client.ToString())
            {
                return Forbid();
            }

            var produit = await _context.Produits.FindAsync(dto.ProduitId);
            if (produit == null) return NotFound(new { message = "Produit introuvable." });

            var commande = new Commande
            {
                ClientId = UserId,
                ProduitId = dto.ProduitId,
                Quantite = dto.Quantite,
                Statut = StatutTransaction.EnAttente
            };

            _context.Commandes.Add(commande);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Commande envoyée. En attente de validation par un administrateur.", commande.Id });
        }

        // Le Client voit ses propres commandes
        [HttpGet("mes-commandes")]
        public async Task<IActionResult> MesCommandes()
        {
            var commandes = await _context.Commandes
                .Where(c => c.ClientId == UserId)
                .Join(_context.Produits, c => c.ProduitId, p => p.Id, (c, p) => new
                {
                    c.Id,
                    Produit = p.Nom,
                    c.Quantite,
                    c.Statut,
                    c.DateCommande
                })
                .OrderByDescending(c => c.DateCommande)
                .ToListAsync();

            return Ok(commandes);
        }

        // L'Admin voit toutes les commandes en attente
        [HttpGet("en-attente")]
        public async Task<IActionResult> EnAttente()
        {
            if (Role != RoleUtilisateur.Admin.ToString())
            {
                return Forbid();
            }

            var commandes = await _context.Commandes
                .Where(c => c.Statut == StatutTransaction.EnAttente)
                .Join(_context.Produits, c => c.ProduitId, p => p.Id, (c, p) => new { c, p })
                .Join(_context.Users, cp => cp.c.ClientId, u => u.Id, (cp, u) => new
                {
                    cp.c.Id,
                    ClientNom = u.Nom,
                    Produit = cp.p.Nom,
                    cp.c.Quantite,
                    StockDisponible = cp.p.QuantiteStock,
                    cp.c.DateCommande
                })
                .ToListAsync();

            return Ok(commandes);
        }

        // L'Admin valide une commande → le stock diminue
        [HttpPut("valider/{id}")]
        public async Task<IActionResult> Valider(int id)
        {
            if (Role != RoleUtilisateur.Admin.ToString())
            {
                return Forbid();
            }

            var commande = await _context.Commandes.FindAsync(id);
            if (commande == null) return NotFound(new { message = "Commande introuvable." });

            var produit = await _context.Produits.FindAsync(commande.ProduitId);
            if (produit == null) return NotFound(new { message = "Produit introuvable." });

            if (produit.QuantiteStock < commande.Quantite)
            {
                return BadRequest(new { message = $"Stock insuffisant (disponible : {produit.QuantiteStock})." });
            }

            produit.QuantiteStock -= commande.Quantite;
            commande.Statut = StatutTransaction.Validee;
            commande.TraiteParAdminId = UserId;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Commande validée. Stock mis à jour." });
        }

        // L'Admin refuse une commande
        [HttpPut("refuser/{id}")]
        public async Task<IActionResult> Refuser(int id)
        {
            if (Role != RoleUtilisateur.Admin.ToString())
            {
                return Forbid();
            }

            var commande = await _context.Commandes.FindAsync(id);
            if (commande == null) return NotFound(new { message = "Commande introuvable." });

            commande.Statut = StatutTransaction.Refusee;
            commande.TraiteParAdminId = UserId;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Commande refusée." });
        }
    }
}