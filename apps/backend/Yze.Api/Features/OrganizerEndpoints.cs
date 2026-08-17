using Microsoft.EntityFrameworkCore;
using Yze.Api.Data;
using Yze.Api.Domain;

namespace Yze.Api.Features;

public static class OrganizerEndpoints
{
    public static IEndpointRouteBuilder MapOrganizerEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/organizer/tree", GetTree).WithTags("Organizer");
        return endpoints;
    }

    private static async Task<IResult> GetTree(
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        var places = await db.Places
            .AsNoTracking()
            .Where(place => place.Id != OrganizerRoot.Id)
            .OrderBy(place => place.Name)
            .ThenBy(place => place.Id)
            .Select(place => new OrganizerPlaceResponse(
                place.Id,
                place.ParentPlaceId ?? OrganizerRoot.Id,
                place.Name,
                place.PhotoUrl,
                place.Description,
                place.CreatedAt,
                place.UpdatedAt))
            .ToListAsync(cancellationToken);

        var items = await db.Items
            .AsNoTracking()
            .OrderBy(item => item.Name)
            .ThenBy(item => item.Id)
            .Select(item => new OrganizerItemResponse(
                item.Id,
                item.PlaceId,
                item.Name,
                item.IconKey,
                item.Quantity))
            .ToListAsync(cancellationToken);

        return Results.Ok(new OrganizerTreeResponse(
            new OrganizerRootResponse(
                OrganizerRoot.Id,
                OrganizerRoot.Name,
                places.Count(place => place.ParentPlaceId == OrganizerRoot.Id),
                items.Count(item => item.PlaceId == OrganizerRoot.Id)),
            places,
            items));
    }
}
