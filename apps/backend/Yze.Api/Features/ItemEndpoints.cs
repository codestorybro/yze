using Microsoft.EntityFrameworkCore;
using Yze.Api.Data;
using Yze.Api.Domain;

namespace Yze.Api.Features;

public static class ItemEndpoints
{
    public static IEndpointRouteBuilder MapItemEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var places = endpoints.MapGroup("/api/places").WithTags("Items");
        places.MapGet("/{placeId:guid}/items", ListForPlace);
        places.MapPost("/{placeId:guid}/items", Create);

        var items = endpoints.MapGroup("/api/items").WithTags("Items");
        items.MapGet("/{id:guid}", Get);
        items.MapPut("/{id:guid}", Update);
        items.MapPut("/{id:guid}/place", Move);
        items.MapDelete("/{id:guid}", Delete);

        return endpoints;
    }

    private static async Task<IResult> ListForPlace(
        Guid placeId,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        if (!await db.Places.AsNoTracking().AnyAsync(place => place.Id == placeId, cancellationToken))
        {
            return ApiProblems.NotFound("place_not_found", "The requested Place does not exist.");
        }

        var items = await db.Items
            .AsNoTracking()
            .Where(item => item.PlaceId == placeId)
            .OrderBy(item => item.Name)
            .ToListAsync(cancellationToken);

        return Results.Ok(items.Select(item => item.ToResponse()));
    }

    private static async Task<IResult> Get(
        Guid id,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        var item = await db.Items.AsNoTracking().SingleOrDefaultAsync(
            value => value.Id == id,
            cancellationToken);

        return item is null
            ? ApiProblems.NotFound("item_not_found", "The requested Item does not exist.")
            : Results.Ok(item.ToResponse());
    }

    private static async Task<IResult> Create(
        Guid placeId,
        ItemWriteRequest request,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        var errors = RequestValidation.ValidateItem(request);
        if (errors.Count > 0) return ApiProblems.Validation(errors);

        if (!await db.Places.AnyAsync(place => place.Id == placeId, cancellationToken))
        {
            return ApiProblems.NotFound(
                "destination_place_not_found",
                "The selected destination Place does not exist.");
        }

        var now = DateTimeOffset.UtcNow;
        var item = new Item
        {
            Id = Guid.CreateVersion7(),
            PlaceId = placeId,
            Name = request.Name!.Trim(),
            IconKey = request.IconKey!.Trim(),
            CreatedAt = now,
            UpdatedAt = now,
        };
        item.Apply(request, now);

        db.Items.Add(item);
        await db.SaveChangesAsync(cancellationToken);
        return Results.Created($"/api/items/{item.Id}", item.ToResponse());
    }

    private static async Task<IResult> Update(
        Guid id,
        ItemWriteRequest request,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        var errors = RequestValidation.ValidateItem(request);
        if (errors.Count > 0) return ApiProblems.Validation(errors);

        var item = await db.Items.SingleOrDefaultAsync(value => value.Id == id, cancellationToken);
        if (item is null)
        {
            return ApiProblems.NotFound("item_not_found", "The requested Item does not exist.");
        }

        item.Apply(request, DateTimeOffset.UtcNow);
        await db.SaveChangesAsync(cancellationToken);
        return Results.Ok(item.ToResponse());
    }

    private static async Task<IResult> Move(
        Guid id,
        MoveItemRequest request,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        if (request.PlaceId is null)
        {
            return ApiProblems.Validation(new Dictionary<string, string[]>
            {
                ["placeId"] = ["Select a destination Place."],
            });
        }

        var item = await db.Items.SingleOrDefaultAsync(value => value.Id == id, cancellationToken);
        if (item is null)
        {
            return ApiProblems.NotFound("item_not_found", "The requested Item does not exist.");
        }

        if (!await db.Places.AnyAsync(place => place.Id == request.PlaceId, cancellationToken))
        {
            return ApiProblems.NotFound(
                "destination_place_not_found",
                "The selected destination Place does not exist.");
        }

        item.PlaceId = request.PlaceId.Value;
        item.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return Results.Ok(item.ToResponse());
    }

    private static async Task<IResult> Delete(
        Guid id,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        var item = await db.Items.SingleOrDefaultAsync(value => value.Id == id, cancellationToken);
        if (item is null)
        {
            return ApiProblems.NotFound("item_not_found", "The requested Item does not exist.");
        }

        db.Items.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        return Results.NoContent();
    }
}
