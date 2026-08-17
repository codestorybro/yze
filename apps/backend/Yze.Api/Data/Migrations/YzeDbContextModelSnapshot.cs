using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Yze.Api.Data.Migrations;

[DbContext(typeof(YzeDbContext))]
public sealed class YzeDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
#pragma warning disable 612, 618
        modelBuilder.HasAnnotation("ProductVersion", "10.0.10");

        modelBuilder.Entity("Yze.Api.Domain.Item", item =>
        {
            item.Property<Guid>("Id").HasColumnType("TEXT");
            item.Property<string>("Brand").HasMaxLength(120).HasColumnType("TEXT");
            item.Property<string>("Category").HasMaxLength(120).HasColumnType("TEXT");
            item.Property<DateTimeOffset>("CreatedAt").HasColumnType("TEXT");
            item.Property<string>("IconKey").IsRequired().HasMaxLength(64).HasColumnType("TEXT");
            item.Property<string>("Model").HasMaxLength(120).HasColumnType("TEXT");
            item.Property<string>("Name").IsRequired().HasMaxLength(120).HasColumnType("TEXT");
            item.Property<string>("Notes").HasMaxLength(4000).HasColumnType("TEXT");
            item.Property<string>("PhotoUrl").HasMaxLength(2048).HasColumnType("TEXT");
            item.Property<Guid>("PlaceId").HasColumnType("TEXT");
            item.Property<DateOnly?>("ProductionDate").HasColumnType("TEXT");
            item.Property<string>("ProductUrl").HasMaxLength(2048).HasColumnType("TEXT");
            item.Property<string>("PurchaseCurrency").HasMaxLength(3).HasColumnType("TEXT");
            item.Property<DateOnly?>("PurchaseDate").HasColumnType("TEXT");
            item.Property<decimal?>("PurchasePrice").HasPrecision(19, 4).HasColumnType("TEXT");
            item.Property<int>("Quantity").HasColumnType("INTEGER").HasDefaultValue(1);
            item.Property<string>("SerialNumber").HasMaxLength(160).HasColumnType("TEXT");
            item.Property<string>("TagsJson")
                .IsRequired()
                .HasColumnType("TEXT")
                .HasDefaultValue("[]")
                .HasColumnName("Tags");
            item.Property<DateTimeOffset>("UpdatedAt").HasColumnType("TEXT");
            item.Property<DateOnly?>("WarrantyUntil").HasColumnType("TEXT");

            item.HasKey("Id");
            item.HasIndex("PlaceId");
            item.ToTable("Items");
        });

        modelBuilder.Entity("Yze.Api.Domain.Place", place =>
        {
            place.Property<Guid>("Id").HasColumnType("TEXT");
            place.Property<DateTimeOffset>("CreatedAt").HasColumnType("TEXT");
            place.Property<string>("Description").HasMaxLength(2000).HasColumnType("TEXT");
            place.Property<string>("Name").IsRequired().HasMaxLength(120).HasColumnType("TEXT");
            place.Property<Guid?>("ParentPlaceId").HasColumnType("TEXT");
            place.Property<string>("PhotoUrl").HasMaxLength(2048).HasColumnType("TEXT");
            place.Property<DateTimeOffset>("UpdatedAt").HasColumnType("TEXT");

            place.HasKey("Id");
            place.HasIndex("ParentPlaceId");
            place.ToTable("Places");

            place.HasData(new
            {
                Id = new Guid("0198d0c0-5f37-7c13-9a7b-7a6500000001"),
                CreatedAt = new DateTimeOffset(2026, 8, 2, 0, 0, 0, TimeSpan.Zero),
                Name = "All gear",
                UpdatedAt = new DateTimeOffset(2026, 8, 2, 0, 0, 0, TimeSpan.Zero),
            });
        });

        modelBuilder.Entity("Yze.Api.Domain.Item", item =>
        {
            item.HasOne("Yze.Api.Domain.Place", "Place")
                .WithMany("Items")
                .HasForeignKey("PlaceId")
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();
            item.Navigation("Place");
        });

        modelBuilder.Entity("Yze.Api.Domain.Place", place =>
        {
            place.HasOne("Yze.Api.Domain.Place", "ParentPlace")
                .WithMany("ChildPlaces")
                .HasForeignKey("ParentPlaceId")
                .OnDelete(DeleteBehavior.Restrict);
            place.Navigation("ParentPlace");
        });

        modelBuilder.Entity("Yze.Api.Domain.Place", place =>
        {
            place.Navigation("ChildPlaces");
            place.Navigation("Items");
        });
#pragma warning restore 612, 618
    }
}
