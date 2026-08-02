FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Yze.Api/Yze.Api.csproj Yze.Api/
RUN dotnet restore Yze.Api/Yze.Api.csproj

COPY Yze.Api/ Yze.Api/
RUN dotnet publish Yze.Api/Yze.Api.csproj --configuration Release --no-restore --output /app/publish

FROM build AS test
COPY Yze.Api.Tests/Yze.Api.Tests.csproj Yze.Api.Tests/
RUN dotnet restore Yze.Api.Tests/Yze.Api.Tests.csproj
COPY Yze.Api.Tests/ Yze.Api.Tests/
RUN dotnet test Yze.Api.Tests/Yze.Api.Tests.csproj --configuration Release --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

RUN apt-get update \
    && apt-get install --yes --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Yze.Api.dll"]
