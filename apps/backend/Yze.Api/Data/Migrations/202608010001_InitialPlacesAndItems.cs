using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Yze.Api.Data.Migrations;

[DbContext(typeof(YzeDbContext))]
[Migration("202608010001_InitialPlacesAndItems")]
public sealed class InitialPlacesAndItems : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Places",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "TEXT", nullable: false),
                Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                ParentPlaceId = table.Column<Guid>(type: "TEXT", nullable: true),
                PhotoUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: true),
                Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Places", value => value.Id);
                table.ForeignKey(
                    name: "FK_Places_Places_ParentPlaceId",
                    column: value => value.ParentPlaceId,
                    principalTable: "Places",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Items",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "TEXT", nullable: false),
                PlaceId = table.Column<Guid>(type: "TEXT", nullable: false),
                Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                IconKey = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                PhotoUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: true),
                Brand = table.Column<string>(type: "TEXT", maxLength: 120, nullable: true),
                Model = table.Column<string>(type: "TEXT", maxLength: 120, nullable: true),
                SerialNumber = table.Column<string>(type: "TEXT", maxLength: 160, nullable: true),
                Category = table.Column<string>(type: "TEXT", maxLength: 120, nullable: true),
                ProductionDate = table.Column<DateOnly>(type: "TEXT", nullable: true),
                PurchaseDate = table.Column<DateOnly>(type: "TEXT", nullable: true),
                PurchasePrice = table.Column<decimal>(type: "TEXT", precision: 19, scale: 4, nullable: true),
                PurchaseCurrency = table.Column<string>(type: "TEXT", maxLength: 3, nullable: true),
                WarrantyUntil = table.Column<DateOnly>(type: "TEXT", nullable: true),
                ProductUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: true),
                Quantity = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 1),
                Tags = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "[]"),
                Notes = table.Column<string>(type: "TEXT", maxLength: 4000, nullable: true),
                CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Items", value => value.Id);
                table.ForeignKey(
                    name: "FK_Items_Places_PlaceId",
                    column: value => value.PlaceId,
                    principalTable: "Places",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Items_PlaceId",
            table: "Items",
            column: "PlaceId");

        migrationBuilder.CreateIndex(
            name: "IX_Places_ParentPlaceId",
            table: "Places",
            column: "ParentPlaceId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Items");
        migrationBuilder.DropTable(name: "Places");
    }
}
