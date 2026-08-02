namespace Yze.Api.Domain;

public sealed class Place
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public Guid? ParentPlaceId { get; set; }
    public Place? ParentPlace { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<Place> ChildPlaces { get; set; } = [];
    public List<Item> Items { get; set; } = [];
}
