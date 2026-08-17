using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Yze.Api.Data;
using Yze.Api.Features;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        var exception = context.HttpContext.Features.Get<IExceptionHandlerFeature>()?.Error;
        if (exception is BadHttpRequestException)
        {
            context.ProblemDetails.Extensions["code"] = "malformed_request";
        }
        else if (context.ProblemDetails.Status == StatusCodes.Status400BadRequest &&
                 !context.ProblemDetails.Extensions.ContainsKey("code"))
        {
            context.ProblemDetails.Extensions["code"] = "malformed_request";
        }
    };
});
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});
builder.Services.AddDbContext<YzeDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Yze") ?? "Data Source=yze.db";
    options.UseSqlite(connectionString);
});

var app = builder.Build();

app.UseExceptionHandler(new ExceptionHandlerOptions
{
    StatusCodeSelector = exception =>
        exception is BadHttpRequestException
            ? StatusCodes.Status400BadRequest
            : StatusCodes.Status500InternalServerError,
});
app.UseStatusCodePages();
if (app.Environment.IsDevelopment())
{
    app.UseCors();
}

await using (var scope = app.Services.CreateAsyncScope())
{
    var database = scope.ServiceProvider.GetRequiredService<YzeDbContext>().Database;
    if (app.Environment.IsEnvironment("Testing"))
    {
        await database.EnsureCreatedAsync();
    }
    else
    {
        await database.MigrateAsync();
    }
}

app.MapGet("/api/hello", () => Results.Ok(new { message = "Hello from Yze API" }));
app.MapGet("/health", async (YzeDbContext db, CancellationToken cancellationToken) =>
    await db.Database.CanConnectAsync(cancellationToken)
        ? Results.Ok(new { status = "healthy" })
        : Results.Problem(statusCode: StatusCodes.Status503ServiceUnavailable));

app.MapPlaceEndpoints();
app.MapItemEndpoints();
app.MapOrganizerEndpoints();

app.Run();

public partial class Program;
