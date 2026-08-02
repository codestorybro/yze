using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace Yze.Api.Domain;

public sealed class Item
{
    public Guid Id { get; set; }
    public Guid PlaceId { get; set; }
    public Place Place { get; set; } = null!;
    public required string Name { get; set; }
    public required string IconKey { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? SerialNumber { get; set; }
    public string? Category { get; set; }
    public DateOnly? ProductionDate { get; set; }
    public DateOnly? PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public string? PurchaseCurrency { get; set; }
    public DateOnly? WarrantyUntil { get; set; }
    public string? ProductUrl { get; set; }
    public int Quantity { get; set; } = 1;
    public string TagsJson { get; set; } = "[]";

    [NotMapped]
    public List<string> Tags
    {
        get
        {
            try
            {
                return JsonSerializer.Deserialize<List<string>>(TagsJson) ?? [];
            }
            catch (JsonException)
            {
                return [];
            }
        }
        set => TagsJson = JsonSerializer.Serialize(value);
    }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
