using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Yze.Api.Data;

namespace Yze.Api.Tests;

public sealed class YzeApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection connection = CreateConnection();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<YzeDbContext>>();
            services.RemoveAll<YzeDbContext>();
            services.AddDbContext<YzeDbContext>(options => options.UseSqlite(connection));
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) connection.Dispose();
    }

    private static SqliteConnection CreateConnection()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        connection.Open();
        return connection;
    }
}
