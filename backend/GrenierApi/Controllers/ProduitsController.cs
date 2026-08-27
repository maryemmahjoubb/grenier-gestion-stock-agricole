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
    public class ProduitsController : ControllerBase
    {
        private readonly GrenierDbContext _context;

        public ProduitsController(GrenierDbContext context)
        {
            _context = context;
        }

        // Consultation : accessible à tout le monde (même sans être connecté, pour l'instant)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var produits = await _context.Produits.ToListAsync();
            return Ok(produits);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var produit = await _context.Produits.FindAsync(id);
            if (produit == null) return NotFound(new { message = "Produit introuvable." });
            return Ok(produit);
        }

        // Création : réservée à Admin et Fournisseur, vérifié via le token JWT
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create(ProduitDto dto)
        {
            var roleClaim = User.FindFirstValue(ClaimTypes.Role);
            if (roleClaim != RoleUtilisateur.Admin.ToString() && roleClaim != RoleUtilisateur.Fournisseur.ToString())
            {
                return Forbid();
            }

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var produit = new Produit
            {
                Nom = dto.Nom,
                Categorie = dto.Categorie,
                PrixUnitaire = dto.PrixUnitaire,
                QuantiteStock = dto.QuantiteStock,
                SeuilAlerte = dto.SeuilAlerte,
                CreeParUserId = userId
            };

            _context.Produits.Add(produit);
            await _context.SaveChangesAsync();

            return Ok(produit);
        }

        // Modification : réservée à Admin et Fournisseur
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProduitDto dto)
        {
            var roleClaim = User.FindFirstValue(ClaimTypes.Role);
            if (roleClaim != RoleUtilisateur.Admin.ToString() && roleClaim != RoleUtilisateur.Fournisseur.ToString())
            {
                return Forbid();
            }

            var produit = await _context.Produits.FindAsync(id);
            if (produit == null) return NotFound(new { message = "Produit introuvable." });

            produit.Nom = dto.Nom;
            produit.Categorie = dto.Categorie;
            produit.PrixUnitaire = dto.PrixUnitaire;
            produit.QuantiteStock = dto.QuantiteStock;
            produit.SeuilAlerte = dto.SeuilAlerte;

            await _context.SaveChangesAsync();
            return Ok(produit);
        }
        // Suppression : réservée à Admin et Fournisseur
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var roleClaim = User.FindFirstValue(ClaimTypes.Role);
            if (roleClaim != RoleUtilisateur.Admin.ToString() && roleClaim != RoleUtilisateur.Fournisseur.ToString())
            {
                return Forbid();
            }

            var produit = await _context.Produits.FindAsync(id);
            if (produit == null) return NotFound(new { message = "Produit introuvable." });

            _context.Produits.Remove(produit);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{produit.Nom} supprimé du catalogue." });
        }
    }
}