namespace Yze.Api.Domain;

public static class ItemIconKeys
{
    public const string Fallback = "generic-device";

    public static readonly IReadOnlySet<string> All = new HashSet<string>(StringComparer.Ordinal)
    {
        "computer",
        "laptop",
        "monitor",
        "smartphone",
        "tablet",
        "keyboard",
        "mouse",
        "headphones",
        "speaker",
        "microphone",
        "camera",
        "game-controller",
        "console",
        "cable",
        "charger",
        "adapter",
        "battery",
        "storage-drive",
        "router",
        "smartwatch",
        "book",
        "tools",
        "box",
        Fallback,
    };
}
