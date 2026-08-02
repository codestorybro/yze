using Yze.Api.Domain;

namespace Yze.Api.Features;

public static class RequestValidation
{
    public static Dictionary<string, string[]> ValidatePlace(
        string? name,
        string? photoUrl,
        string? description)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);
        ValidateRequiredText(errors, "name", name, 120);
        ValidateOptionalText(errors, "description", description, 2000);
        ValidateUrl(errors, "photoUrl", photoUrl);
        return errors;
    }

    public static Dictionary<string, string[]> ValidateItem(ItemWriteRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);
        ValidateRequiredText(errors, "name", request.Name, 120);
        ValidateRequiredText(errors, "iconKey", request.IconKey, 64);

        var iconKey = request.IconKey?.Trim();
        if (!string.IsNullOrEmpty(iconKey) && !ItemIconKeys.All.Contains(iconKey))
        {
            errors["iconKey"] = ["Select an icon from the supported catalogue."];
        }

        ValidateUrl(errors, "photoUrl", request.PhotoUrl);
        ValidateUrl(errors, "productUrl", request.ProductUrl);
        ValidateOptionalText(errors, "brand", request.Brand, 120);
        ValidateOptionalText(errors, "model", request.Model, 120);
        ValidateOptionalText(errors, "serialNumber", request.SerialNumber, 160);
        ValidateOptionalText(errors, "category", request.Category, 120);
        ValidateOptionalText(errors, "notes", request.Notes, 4000);

        if ((request.Quantity ?? 1) <= 0)
        {
            errors["quantity"] = ["Quantity must be greater than zero."];
        }

        if (request.PurchasePrice is < 0)
        {
            errors["purchasePrice"] = ["Purchase price cannot be negative."];
        }

        var currency = request.PurchaseCurrency?.Trim();
        if (!string.IsNullOrEmpty(currency) &&
            (currency.Length != 3 || currency.Any(character => !char.IsLetter(character))))
        {
            errors["purchaseCurrency"] = ["Currency must be a three-letter code."];
        }

        if (request.Tags is { Count: > 12 })
        {
            errors["tags"] = ["Use at most 12 tags."];
        }
        else if (request.Tags?.Any(tag => string.IsNullOrWhiteSpace(tag) || tag.Trim().Length > 40) == true)
        {
            errors["tags"] = ["Each tag must contain 1 to 40 characters."];
        }

        return errors;
    }

    public static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    public static List<string> NormalizeTags(IReadOnlyList<string>? tags) =>
        tags?
            .Select(value => value.Trim())
            .Where(value => value.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList() ?? [];

    private static void ValidateRequiredText(
        IDictionary<string, string[]> errors,
        string field,
        string? value,
        int maximumLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            errors[field] = ["This field is required."];
        }
        else if (value.Trim().Length > maximumLength)
        {
            errors[field] = [$"Use at most {maximumLength} characters."];
        }
    }

    private static void ValidateOptionalText(
        IDictionary<string, string[]> errors,
        string field,
        string? value,
        int maximumLength)
    {
        if (value?.Trim().Length > maximumLength)
        {
            errors[field] = [$"Use at most {maximumLength} characters."];
        }
    }

    private static void ValidateUrl(
        IDictionary<string, string[]> errors,
        string field,
        string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return;

        if (value.Trim().Length > 2048 ||
            !Uri.TryCreate(value.Trim(), UriKind.Absolute, out var uri) ||
            uri.Scheme != Uri.UriSchemeHttps)
        {
            errors[field] = ["Use an absolute HTTPS URL."];
        }
    }
}
