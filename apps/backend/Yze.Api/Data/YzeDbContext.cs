using Microsoft.EntityFrameworkCore;
using Yze.Api.Domain;

namespace Yze.Api.Data;

public sealed class YzeDbContext(DbContextOptions<YzeDbContext> options) : DbContext(options)
{
    public DbSet<Place> Places => Set<Place>();
    public DbSet<Item> Items => Set<Item>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var place = modelBuilder.Entity<Place>();
        place.ToTable("Places");
        place.HasKey(value => value.Id);
        place.Property(value => value.Name).HasMaxLength(120).IsRequired();
        place.Property(value => value.PhotoUrl).HasMaxLength(2048);
        place.Property(value => value.Description).HasMaxLength(2000);
        place.HasIndex(value => value.ParentPlaceId);
        place
            .HasOne(value => value.ParentPlace)
            .WithMany(value => value.ChildPlaces)
            .HasForeignKey(value => value.ParentPlaceId)
            .OnDelete(DeleteBehavior.Restrict);

        var item = modelBuilder.Entity<Item>();
        item.ToTable("Items");
        item.HasKey(value => value.Id);
        item.Property(value => value.Name).HasMaxLength(120).IsRequired();
        item.Property(value => value.IconKey).HasMaxLength(64).IsRequired();
        item.Property(value => value.PhotoUrl).HasMaxLength(2048);
        item.Property(value => value.Brand).HasMaxLength(120);
        item.Property(value => value.Model).HasMaxLength(120);
        item.Property(value => value.SerialNumber).HasMaxLength(160);
        item.Property(value => value.Category).HasMaxLength(120);
        item.Property(value => value.PurchasePrice).HasPrecision(19, 4);
        item.Property(value => value.PurchaseCurrency).HasMaxLength(3);
        item.Property(value => value.ProductUrl).HasMaxLength(2048);
        item.Property(value => value.Notes).HasMaxLength(4000);
        item.Property(value => value.Quantity).HasDefaultValue(1);
        item.Property(value => value.TagsJson).HasColumnName("Tags").HasDefaultValue("[]");
        item.Ignore(value => value.Tags);
        item.HasIndex(value => value.PlaceId);
        item
            .HasOne(value => value.Place)
            .WithMany(value => value.Items)
            .HasForeignKey(value => value.PlaceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
