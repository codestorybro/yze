using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Yze.Api.Data.Migrations;

[DbContext(typeof(YzeDbContext))]
[Migration("202608020001_AddOrganizerRoot")]
public sealed class AddOrganizerRoot : Migration
{
    private const string RootId = "0198D0C0-5F37-7C13-9A7B-7A6500000001";
    private const string RecoveryPlaceId = "0198D0C0-5F37-7C13-9A7B-7A6500000002";

    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.InsertData(
            table: "Places",
            columns: ["Id", "CreatedAt", "Description", "Name", "ParentPlaceId", "PhotoUrl", "UpdatedAt"],
            values: [
                Guid.Parse(RootId),
                new DateTimeOffset(2026, 8, 2, 0, 0, 0, TimeSpan.Zero),
                null,
                "All gear",
                null,
                null,
                new DateTimeOffset(2026, 8, 2, 0, 0, 0, TimeSpan.Zero),
            ]);

        migrationBuilder.Sql(
            $"UPDATE Places SET ParentPlaceId = '{RootId}' WHERE ParentPlaceId IS NULL AND Id <> '{RootId}'");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            $"UPDATE Places SET ParentPlaceId = NULL WHERE ParentPlaceId = '{RootId}'");
        migrationBuilder.Sql($$"""
            INSERT INTO Places (Id, Name, ParentPlaceId, PhotoUrl, Description, CreatedAt, UpdatedAt)
            SELECT '{{RecoveryPlaceId}}', 'Recovered root items', NULL, NULL,
                   'Items preserved while downgrading the organizer root migration.',
                   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            WHERE EXISTS (SELECT 1 FROM Items WHERE PlaceId = '{{RootId}}')
              AND NOT EXISTS (SELECT 1 FROM Places WHERE Id = '{{RecoveryPlaceId}}');
            """);
        migrationBuilder.Sql(
            $"UPDATE Items SET PlaceId = '{RecoveryPlaceId}' WHERE PlaceId = '{RootId}'");
        migrationBuilder.Sql(
            $"DELETE FROM Places WHERE Id = '{RootId}'");
    }
}
