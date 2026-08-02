using System.Data;
using Microsoft.EntityFrameworkCore;
using Yze.Api.Data;
using Yze.Api.Domain;

namespace Yze.Api.Features;

public static class PlaceEndpoints
{
    public static IEndpointRouteBuilder MapPlaceEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/places").WithTags("Places");

        group.MapGet("", ListRoots);
        group.MapGet("/{id:guid}", GetDetails);
        group.MapGet("/{id:guid}/children", ListChildren);
        group.MapPost("", Create);
        group.MapPut("/{id:guid}", Update);
        group.MapPut("/{id:guid}/parent", Move);
        group.MapDelete("/{id:guid}", Delete);

        return endpoints;
    }

    private static async Task<IResult> ListRoots(YzeDbContext db, CancellationToken cancellationToken) =>
        Results.Ok(await Summaries(db, null, cancellationToken));

    private static async Task<IResult> ListChildren(
        Guid id,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        if (!await db.Places.AsNoTracking().AnyAsync(place => place.Id == id, cancellationToken))
        {
            return ApiProblems.NotFound("place_not_found", "The requested Place does not exist.");
        }

        return Results.Ok(await Summaries(db, id, cancellationToken));
    }

    private static async Task<IResult> GetDetails(
        Guid id,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        var place = await db.Places.AsNoTracking().SingleOrDefaultAsync(
            value => value.Id == id,
            cancellationToken);

        if (place is null)
        {
            return ApiProblems.NotFound("place_not_found", "The requested Place does not exist.");
        }

        var ancestry = new List<PlacePathResponse>();
        var visited = new HashSet<Guid> { place.Id };
        var parentId = place.ParentPlaceId;

        while (parentId is not null && visited.Add(parentId.Value))
        {
            var parent = await db.Places
                .AsNoTracking()
                .Where(value => value.Id == parentId.Value)
                .Select(value => new { value.Id, value.Name, value.ParentPlaceId })
                .SingleOrDefaultAsync(cancellationToken);

            if (parent is null) break;
            ancestry.Add(new PlacePathResponse(parent.Id, parent.Name));
            parentId = parent.ParentPlaceId;
        }

        ancestry.Reverse();
        var children = await Summaries(db, place.Id, cancellationToken);
        var items = await db.Items
            .AsNoTracking()
            .Where(item => item.PlaceId == place.Id)
            .OrderBy(item => item.Name)
            .ToListAsync(cancellationToken);

        return Results.Ok(new PlaceDetailsResponse(
            place.Id,
            place.Name,
            place.ParentPlaceId,
            place.PhotoUrl,
            place.Description,
            place.CreatedAt,
            place.UpdatedAt,
            ancestry,
            children,
            items.Select(item => item.ToResponse()).ToList()));
    }

    private static async Task<IResult> Create(
        CreatePlaceRequest request,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        var errors = RequestValidation.ValidatePlace(request.Name, request.PhotoUrl, request.Description);
        if (errors.Count > 0) return ApiProblems.Validation(errors);

        if (request.ParentPlaceId is not null &&
            !await db.Places.AnyAsync(place => place.Id == request.ParentPlaceId, cancellationToken))
        {
            return ApiProblems.NotFound(
                "parent_place_not_found",
                "The selected parent Place does not exist.");
        }

        var now = DateTimeOffset.UtcNow;
        var place = new Place
        {
            Id = Guid.CreateVersion7(),
            Name = request.Name!.Trim(),
            ParentPlaceId = request.ParentPlaceId,
            PhotoUrl = RequestValidation.NormalizeOptional(request.PhotoUrl),
            Description = RequestValidation.NormalizeOptional(request.Description),
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.Places.Add(place);
        await db.SaveChangesAsync(cancellationToken);

        var response = new PlaceSummaryResponse(
            place.Id,
            place.Name,
            place.PhotoUrl,
            place.Description,
            0,
            0,
            place.CreatedAt,
            place.UpdatedAt);

        return Results.Created($"/api/places/{place.Id}", response);
    }

    private static async Task<IResult> Update(
        Guid id,
        UpdatePlaceRequest request,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        var errors = RequestValidation.ValidatePlace(request.Name, request.PhotoUrl, request.Description);
        if (errors.Count > 0) return ApiProblems.Validation(errors);

        var place = await db.Places.SingleOrDefaultAsync(value => value.Id == id, cancellationToken);
        if (place is null)
        {
            return ApiProblems.NotFound("place_not_found", "The requested Place does not exist.");
        }

        place.Name = request.Name!.Trim();
        place.PhotoUrl = RequestValidation.NormalizeOptional(request.PhotoUrl);
        place.Description = RequestValidation.NormalizeOptional(request.Description);
        place.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(await Summary(db, place.Id, cancellationToken));
    }

    private static async Task<IResult> Move(
        Guid id,
        MovePlaceRequest request,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        var place = await db.Places.SingleOrDefaultAsync(value => value.Id == id, cancellationToken);
        if (place is null)
        {
            return ApiProblems.NotFound("place_not_found", "The requested Place does not exist.");
        }

        if (request.ParentPlaceId == place.Id)
        {
            return ApiProblems.Conflict("place_cycle", "A Place cannot be its own parent.");
        }

        if (request.ParentPlaceId is not null)
        {
            if (!await db.Places.AnyAsync(
                    value => value.Id == request.ParentPlaceId.Value,
                    cancellationToken))
            {
                return ApiProblems.NotFound(
                    "parent_place_not_found",
                    "The selected parent Place does not exist.");
            }

            if (await CreatesCycle(place.Id, request.ParentPlaceId.Value, db, cancellationToken))
            {
                return ApiProblems.Conflict(
                    "place_cycle",
                    "A Place cannot be moved into one of its descendants.");
            }
        }

        place.ParentPlaceId = request.ParentPlaceId;
        place.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return Results.Ok(await Summary(db, place.Id, cancellationToken));
    }

    private static async Task<IResult> Delete(
        Guid id,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        var place = await db.Places.SingleOrDefaultAsync(value => value.Id == id, cancellationToken);
        if (place is null)
        {
            return ApiProblems.NotFound("place_not_found", "The requested Place does not exist.");
        }

        var containsPlaces = await db.Places.AnyAsync(
            value => value.ParentPlaceId == id,
            cancellationToken);
        var containsItems = await db.Items.AnyAsync(value => value.PlaceId == id, cancellationToken);
        if (containsPlaces || containsItems)
        {
            return ApiProblems.Conflict(
                "place_not_empty",
                "Move or remove this Place's direct contents before deleting it.");
        }

        db.Places.Remove(place);
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            return ApiProblems.Conflict(
                "place_not_empty",
                "The Place received contents before it could be deleted.");
        }

        return Results.NoContent();
    }

    private static Task<List<PlaceSummaryResponse>> Summaries(
        YzeDbContext db,
        Guid? parentPlaceId,
        CancellationToken cancellationToken) =>
        db.Places
            .AsNoTracking()
            .Where(place => place.ParentPlaceId == parentPlaceId)
            .OrderBy(place => place.Name)
            .Select(place => new PlaceSummaryResponse(
                place.Id,
                place.Name,
                place.PhotoUrl,
                place.Description,
                db.Places.Count(child => child.ParentPlaceId == place.Id),
                db.Items.Count(item => item.PlaceId == place.Id),
                place.CreatedAt,
                place.UpdatedAt))
            .ToListAsync(cancellationToken);

    private static Task<PlaceSummaryResponse> Summary(
        YzeDbContext db,
        Guid id,
        CancellationToken cancellationToken) =>
        db.Places
            .AsNoTracking()
            .Where(place => place.Id == id)
            .Select(place => new PlaceSummaryResponse(
                place.Id,
                place.Name,
                place.PhotoUrl,
                place.Description,
                db.Places.Count(child => child.ParentPlaceId == place.Id),
                db.Items.Count(item => item.PlaceId == place.Id),
                place.CreatedAt,
                place.UpdatedAt))
            .SingleAsync(cancellationToken);

    private static async Task<bool> CreatesCycle(
        Guid movingPlaceId,
        Guid proposedParentId,
        YzeDbContext db,
        CancellationToken cancellationToken)
    {
        var visited = new HashSet<Guid>();
        Guid? currentId = proposedParentId;

        while (currentId is not null && visited.Add(currentId.Value))
        {
            if (currentId == movingPlaceId) return true;

            currentId = await db.Places
                .AsNoTracking()
                .Where(place => place.Id == currentId.Value)
                .Select(place => place.ParentPlaceId)
                .SingleOrDefaultAsync(cancellationToken);
        }

        return currentId is not null;
    }
}
