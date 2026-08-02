namespace Yze.Api.Features;

public static class ApiProblems
{
    public static IResult Validation(IReadOnlyDictionary<string, string[]> errors) =>
        Results.ValidationProblem(
            errors,
            title: "One or more fields are invalid.",
            statusCode: StatusCodes.Status400BadRequest,
            extensions: Extensions("validation_failed"));

    public static IResult NotFound(string code, string detail) =>
        Results.Problem(
            title: "Resource not found.",
            detail: detail,
            statusCode: StatusCodes.Status404NotFound,
            extensions: Extensions(code));

    public static IResult Conflict(string code, string detail) =>
        Results.Problem(
            title: "The requested operation conflicts with the current state.",
            detail: detail,
            statusCode: StatusCodes.Status409Conflict,
            extensions: Extensions(code));

    private static Dictionary<string, object?> Extensions(string code) => new()
    {
        ["code"] = code,
    };
}
