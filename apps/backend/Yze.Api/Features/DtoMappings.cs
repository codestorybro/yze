using Yze.Api.Domain;

namespace Yze.Api.Features;

public static class DtoMappings
{
    public static ItemResponse ToResponse(this Item item) => new(
        item.Id,
        item.PlaceId,
        item.Name,
        item.IconKey,
        item.PhotoUrl,
        item.Brand,
        item.Model,
        item.SerialNumber,
        item.Category,
        item.ProductionDate,
        item.PurchaseDate,
        item.PurchasePrice,
        item.PurchaseCurrency,
        item.WarrantyUntil,
        item.ProductUrl,
        item.Quantity,
        item.Tags,
        item.Notes,
        item.CreatedAt,
        item.UpdatedAt);

    public static void Apply(this Item item, ItemWriteRequest request, DateTimeOffset now)
    {
        item.Name = request.Name!.Trim();
        item.IconKey = request.IconKey!.Trim();
        item.PhotoUrl = RequestValidation.NormalizeOptional(request.PhotoUrl);
        item.Brand = RequestValidation.NormalizeOptional(request.Brand);
        item.Model = RequestValidation.NormalizeOptional(request.Model);
        item.SerialNumber = RequestValidation.NormalizeOptional(request.SerialNumber);
        item.Category = RequestValidation.NormalizeOptional(request.Category);
        item.ProductionDate = request.ProductionDate;
        item.PurchaseDate = request.PurchaseDate;
        item.PurchasePrice = request.PurchasePrice;
        item.PurchaseCurrency = RequestValidation.NormalizeOptional(request.PurchaseCurrency)?.ToUpperInvariant();
        item.WarrantyUntil = request.WarrantyUntil;
        item.ProductUrl = RequestValidation.NormalizeOptional(request.ProductUrl);
        item.Quantity = request.Quantity ?? 1;
        item.Tags = RequestValidation.NormalizeTags(request.Tags);
        item.Notes = RequestValidation.NormalizeOptional(request.Notes);
        item.UpdatedAt = now;
    }
}
