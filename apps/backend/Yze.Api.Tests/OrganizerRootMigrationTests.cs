using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Yze.Api.Data;
using Yze.Api.Domain;
using Xunit;

namespace Yze.Api.Tests;

public sealed class OrganizerRootMigrationTests
{
    private const string InitialMigration = "202608010001_InitialPlacesAndItems";

    [Fact]
    public async Task MigratesLegacyTopLevelPlacesAndPreservesRootItemsAcrossDownAndUp()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<YzeDbContext>()
            .UseSqlite(connection)
            .Options;
        await using var db = new YzeDbContext(options);
        var migrator = db.GetService<IMigrator>();
        await migrator.MigrateAsync(InitialMigration);

        var createdAt = new DateTimeOffset(2026, 8, 1, 10, 0, 0, TimeSpan.Zero);
        var topLevel = Place("Studio", createdAt);
        var sibling = Place("Travel", createdAt);
        var child = Place("Drawer", createdAt, topLevel.Id);
        var legacyItem = Item("Camera", child.Id, createdAt);
        db.AddRange(topLevel, sibling, child, legacyItem);
        await db.SaveChangesAsync();

        await db.Database.MigrateAsync();
        db.ChangeTracker.Clear();

        Assert.NotNull(await db.Places.FindAsync(OrganizerRoot.Id));
        Assert.Equal(OrganizerRoot.Id, (await db.Places.FindAsync(topLevel.Id))!.ParentPlaceId);
        Assert.Equal(OrganizerRoot.Id, (await db.Places.FindAsync(sibling.Id))!.ParentPlaceId);
        Assert.Equal(topLevel.Id, (await db.Places.FindAsync(child.Id))!.ParentPlaceId);
        Assert.Equal(child.Id, (await db.Items.FindAsync(legacyItem.Id))!.PlaceId);

        var rootItem = Item("Passport", OrganizerRoot.Id, createdAt);
        db.Items.Add(rootItem);
        await db.SaveChangesAsync();

        await migrator.MigrateAsync(InitialMigration);
        db.ChangeTracker.Clear();

        Assert.Null(await db.Places.FindAsync(OrganizerRoot.Id));
        var recoveredItem = (await db.Items.FindAsync(rootItem.Id))!;
        var recoveryPlace = (await db.Places.FindAsync(recoveredItem.PlaceId))!;
        Assert.Equal("Recovered root items", recoveryPlace.Name);
        Assert.Null(recoveryPlace.ParentPlaceId);

        await db.Database.MigrateAsync();
        db.ChangeTracker.Clear();

        Assert.NotNull(await db.Places.FindAsync(OrganizerRoot.Id));
        Assert.Equal(
            OrganizerRoot.Id,
            (await db.Places.FindAsync(recoveryPlace.Id))!.ParentPlaceId);
        Assert.Equal(recoveryPlace.Id, (await db.Items.FindAsync(rootItem.Id))!.PlaceId);
    }

    private static Place Place(string name, DateTimeOffset createdAt, Guid? parentPlaceId = null) =>
        new()
        {
            Id = Guid.NewGuid(),
            Name = name,
            ParentPlaceId = parentPlaceId,
            CreatedAt = createdAt,
            UpdatedAt = createdAt,
        };

    private static Item Item(string name, Guid placeId, DateTimeOffset createdAt) =>
        new()
        {
            Id = Guid.NewGuid(),
            PlaceId = placeId,
            Name = name,
            IconKey = "generic-device",
            CreatedAt = createdAt,
            UpdatedAt = createdAt,
        };
}
