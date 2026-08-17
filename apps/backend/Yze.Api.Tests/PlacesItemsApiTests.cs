using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Yze.Api.Domain;
using Yze.Api.Features;
using Xunit;

namespace Yze.Api.Tests;

public sealed class PlacesItemsApiTests
{
    [Fact]
    public async Task ReturnsProblemDetailsForMalformedJson()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();
        using var content = new StringContent("{", Encoding.UTF8, "application/json");

        var response = await client.PostAsync("/api/places", content);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("malformed_request", problem.GetProperty("code").GetString());
    }

    [Fact]
    public async Task CreatesAndListsATrimmedRootPlace()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();

        var created = await CreatePlace(client, "  Living room  ");
        var roots = await client.GetFromJsonAsync<List<PlaceSummaryResponse>>("/api/places");

        Assert.Equal("Living room", created.Name);
        Assert.Equal(created.Id, Assert.Single(roots!).Id);
    }

    [Fact]
    public async Task CreatesAChildAndReturnsDirectContentsWithAncestry()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();
        var root = await CreatePlace(client, "Office");
        var child = await CreatePlace(client, "Cabinet", root.Id);
        var item = await CreateItem(client, child.Id);

        var details = await client.GetFromJsonAsync<PlaceDetailsResponse>($"/api/places/{child.Id}");

        Assert.Equal(child.Id, details!.Id);
        Assert.Equal(root.Id, Assert.Single(details.Ancestry).Id);
        Assert.Equal(item.Id, Assert.Single(details.Items).Id);
        Assert.Empty(details.Children);
    }

    [Fact]
    public async Task CreatesAnItemWithDefaultQuantity()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();
        var place = await CreatePlace(client, "Cable box");

        var item = await CreateItem(client, place.Id);
        var retrieved = await client.GetFromJsonAsync<ItemResponse>($"/api/items/{item.Id}");

        Assert.Equal(1, retrieved!.Quantity);
        Assert.Equal("cable", retrieved.IconKey);
    }

    [Fact]
    public async Task ReturnsTheCompleteOrganizerTreeFromTheImmutableRoot()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();
        var studio = await CreatePlace(client, "Studio");
        var drawer = await CreatePlace(client, "Drawer", studio.Id);
        var rootItem = await CreateItem(client, OrganizerRoot.Id);
        var nestedItem = await CreateItem(client, drawer.Id);

        var tree = await client.GetFromJsonAsync<OrganizerTreeResponse>("/api/organizer/tree");

        Assert.NotNull(tree);
        Assert.Equal(OrganizerRoot.Id, tree.Root.Id);
        Assert.Equal("All gear", tree.Root.Name);
        Assert.Equal(1, tree.Root.ChildPlaceCount);
        Assert.Equal(1, tree.Root.ItemCount);
        Assert.Equal(OrganizerRoot.Id, tree.Places.Single(place => place.Id == studio.Id).ParentPlaceId);
        Assert.Equal(studio.Id, tree.Places.Single(place => place.Id == drawer.Id).ParentPlaceId);
        Assert.Contains(tree.Items, item => item.Id == rootItem.Id && item.PlaceId == OrganizerRoot.Id);
        Assert.Contains(tree.Items, item => item.Id == nestedItem.Id && item.PlaceId == drawer.Id);
    }

    [Fact]
    public async Task CreatesAndMovesAnItemDirectlyUnderTheOrganizerRoot()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();
        var place = await CreatePlace(client, "Travel case");
        var item = await CreateItem(client, place.Id);

        var move = await client.PutAsJsonAsync(
            $"/api/items/{item.Id}/place",
            new MoveItemRequest(OrganizerRoot.Id));
        var moved = await move.Content.ReadFromJsonAsync<ItemResponse>();
        var createdAtRoot = await CreateItem(client, OrganizerRoot.Id);

        Assert.Equal(HttpStatusCode.OK, move.StatusCode);
        Assert.Equal(OrganizerRoot.Id, moved!.PlaceId);
        Assert.Equal(OrganizerRoot.Id, createdAtRoot.PlaceId);
    }

    [Theory]
    [InlineData("update")]
    [InlineData("move")]
    [InlineData("delete")]
    public async Task RejectsMutatingTheOrganizerRoot(string operation)
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();

        var response = operation switch
        {
            "update" => await client.PutAsJsonAsync(
                $"/api/places/{OrganizerRoot.Id}",
                new UpdatePlaceRequest("Renamed", null, null)),
            "move" => await client.PutAsJsonAsync(
                $"/api/places/{OrganizerRoot.Id}/parent",
                new MovePlaceRequest(null)),
            _ => await client.DeleteAsync($"/api/places/{OrganizerRoot.Id}"),
        };
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("organizer_root_immutable", problem.GetProperty("code").GetString());
    }

    [Theory]
    [InlineData(null, "cable", "name")]
    [InlineData("USB-C cable", null, "iconKey")]
    public async Task RejectsAnItemWithoutRequiredFields(string? name, string? iconKey, string field)
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();
        var place = await CreatePlace(client, "Desk");

        var response = await client.PostAsJsonAsync($"/api/places/{place.Id}/items", Item(name, iconKey));
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("validation_failed", problem.GetProperty("code").GetString());
        Assert.True(problem.GetProperty("errors").TryGetProperty(field, out _));
    }

    [Fact]
    public async Task RejectsAnItemAssignedToAMissingPlace()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/places/{Guid.NewGuid()}/items", Item());
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("destination_place_not_found", problem.GetProperty("code").GetString());
    }

    [Theory]
    [InlineData("http://example.test/photo.jpg")]
    [InlineData("file:///tmp/photo.jpg")]
    public async Task RejectsUnsafePlacePhotoUrls(string photoUrl)
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/places",
            new CreatePlaceRequest("Studio", null, photoUrl, null));
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True(problem.GetProperty("errors").TryGetProperty("photoUrl", out _));
    }

    [Fact]
    public async Task MovesAnItemToAnotherPlace()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();
        var source = await CreatePlace(client, "Source");
        var destination = await CreatePlace(client, "Destination");
        var item = await CreateItem(client, source.Id);

        var response = await client.PutAsJsonAsync(
            $"/api/items/{item.Id}/place",
            new MoveItemRequest(destination.Id));
        var moved = await response.Content.ReadFromJsonAsync<ItemResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(destination.Id, moved!.PlaceId);
    }

    [Fact]
    public async Task MovesAPlaceToAnotherParentAndBackToRoot()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();
        var first = await CreatePlace(client, "First");
        var second = await CreatePlace(client, "Second");

        var nestedResponse = await client.PutAsJsonAsync(
            $"/api/places/{second.Id}/parent",
            new MovePlaceRequest(first.Id));
        var rootResponse = await client.PutAsJsonAsync(
            $"/api/places/{second.Id}/parent",
            new MovePlaceRequest(null));

        Assert.Equal(HttpStatusCode.OK, nestedResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, rootResponse.StatusCode);
        var roots = await client.GetFromJsonAsync<List<PlaceSummaryResponse>>("/api/places");
        Assert.Equal(2, roots!.Count);
    }

    [Fact]
    public async Task RejectsACyclicPlaceRelationship()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();
        var root = await CreatePlace(client, "Root");
        var child = await CreatePlace(client, "Child", root.Id);

        var response = await client.PutAsJsonAsync(
            $"/api/places/{root.Id}/parent",
            new MovePlaceRequest(child.Id));
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("place_cycle", problem.GetProperty("code").GetString());
    }

    [Fact]
    public async Task PreventsDeletingANonEmptyPlace()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();
        var place = await CreatePlace(client, "Occupied");
        await CreateItem(client, place.Id);

        var response = await client.DeleteAsync($"/api/places/{place.Id}");
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("place_not_empty", problem.GetProperty("code").GetString());
    }

    [Fact]
    public async Task DeletesAnEmptyPlace()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();
        var place = await CreatePlace(client, "Temporary");

        var response = await client.DeleteAsync($"/api/places/{place.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/places/{place.Id}")).StatusCode);
    }

    [Fact]
    public async Task UpdatesAndDeletesAnItem()
    {
        using var factory = new YzeApiFactory();
        using var client = factory.CreateClient();
        var place = await CreatePlace(client, "Drawer");
        var item = await CreateItem(client, place.Id);

        var update = await client.PutAsJsonAsync(
            $"/api/items/{item.Id}",
            Item(name: "HDMI adapter", iconKey: "adapter", quantity: 2, tags: ["desk", "video"]));
        var updated = await update.Content.ReadFromJsonAsync<ItemResponse>();
        var persisted = await client.GetFromJsonAsync<ItemResponse>($"/api/items/{item.Id}");
        var delete = await client.DeleteAsync($"/api/items/{item.Id}");

        Assert.Equal("HDMI adapter", updated!.Name);
        Assert.Equal(2, updated.Quantity);
        Assert.Equal(new[] { "desk", "video" }, persisted!.Tags);
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/items/{item.Id}")).StatusCode);
    }

    private static async Task<PlaceSummaryResponse> CreatePlace(
        HttpClient client,
        string name,
        Guid? parentPlaceId = null)
    {
        var response = await client.PostAsJsonAsync(
            "/api/places",
            new CreatePlaceRequest(name, parentPlaceId, null, null));
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<PlaceSummaryResponse>())!;
    }

    private static async Task<ItemResponse> CreateItem(HttpClient client, Guid placeId)
    {
        var response = await client.PostAsJsonAsync($"/api/places/{placeId}/items", Item());
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<ItemResponse>())!;
    }

    private static ItemWriteRequest Item(
        string? name = "USB-C cable",
        string? iconKey = "cable",
        int? quantity = null,
        IReadOnlyList<string>? tags = null) =>
        new(
            name,
            iconKey,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            quantity,
            tags,
            null);
}
