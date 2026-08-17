namespace Yze.Api.Features;

public sealed record CreatePlaceRequest(
    string? Name,
    Guid? ParentPlaceId,
    string? PhotoUrl,
    string? Description);

public sealed record UpdatePlaceRequest(string? Name, string? PhotoUrl, string? Description);

public sealed record MovePlaceRequest(Guid? ParentPlaceId);

public sealed record PlacePathResponse(Guid Id, string Name);

public sealed record PlaceSummaryResponse(
    Guid Id,
    string Name,
    string? PhotoUrl,
    string? Description,
    int ChildPlaceCount,
    int ItemCount,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record PlaceDetailsResponse(
    Guid Id,
    bool IsRoot,
    string Name,
    Guid? ParentPlaceId,
    string? PhotoUrl,
    string? Description,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    IReadOnlyList<PlacePathResponse> Ancestry,
    IReadOnlyList<PlaceSummaryResponse> Children,
    IReadOnlyList<ItemResponse> Items);

public sealed record OrganizerRootResponse(
    Guid Id,
    string Name,
    int ChildPlaceCount,
    int ItemCount);

public sealed record OrganizerPlaceResponse(
    Guid Id,
    Guid ParentPlaceId,
    string Name,
    string? PhotoUrl,
    string? Description,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record OrganizerItemResponse(
    Guid Id,
    Guid PlaceId,
    string Name,
    string IconKey,
    int Quantity);

public sealed record OrganizerTreeResponse(
    OrganizerRootResponse Root,
    IReadOnlyList<OrganizerPlaceResponse> Places,
    IReadOnlyList<OrganizerItemResponse> Items);

public sealed record ItemWriteRequest(
    string? Name,
    string? IconKey,
    string? PhotoUrl,
    string? Brand,
    string? Model,
    string? SerialNumber,
    string? Category,
    DateOnly? ProductionDate,
    DateOnly? PurchaseDate,
    decimal? PurchasePrice,
    string? PurchaseCurrency,
    DateOnly? WarrantyUntil,
    string? ProductUrl,
    int? Quantity,
    IReadOnlyList<string>? Tags,
    string? Notes);

public sealed record MoveItemRequest(Guid? PlaceId);

public sealed record ItemResponse(
    Guid Id,
    Guid PlaceId,
    string Name,
    string IconKey,
    string? PhotoUrl,
    string? Brand,
    string? Model,
    string? SerialNumber,
    string? Category,
    DateOnly? ProductionDate,
    DateOnly? PurchaseDate,
    decimal? PurchasePrice,
    string? PurchaseCurrency,
    DateOnly? WarrantyUntil,
    string? ProductUrl,
    int Quantity,
    IReadOnlyList<string> Tags,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
