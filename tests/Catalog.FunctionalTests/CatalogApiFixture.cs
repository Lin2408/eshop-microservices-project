using System.Reflection;
using Aspire.Hosting;
using Aspire.Hosting.ApplicationModel;
using Microsoft.AspNetCore.Mvc.Testing;
using System.IO;

namespace eShop.Catalog.FunctionalTests;

public sealed class CatalogApiFixture : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly IHost _app;

    public IResourceBuilder<PostgresServerResource> Postgres { get; private set; }
    private string _postgresConnectionString;
    private bool _useExternalDb;
    private const string ExternalConnEnvName = "TEST_USE_EXISTING_DB_CONN";
    private const string DefaultResourceName = "CatalogDB";

        public CatalogApiFixture()
        {
            // If TEST_USE_EXISTING_DB_CONN is set, use that DB for tests instead of creating a test Postgres resource.
            var env = Environment.GetEnvironmentVariable(ExternalConnEnvName);
            if (!string.IsNullOrEmpty(env))
            {
                _useExternalDb = true;
                _postgresConnectionString = env;
                return;
            }

            // Keep the dashboard disabled to restore previous test behavior
            var options = new DistributedApplicationOptions { AssemblyName = typeof(CatalogApiFixture).Assembly.FullName, DisableDashboard = true };
            var appBuilder = DistributedApplication.CreateBuilder(options);
            Postgres = appBuilder.AddPostgres(DefaultResourceName)
                .WithImage("ankane/pgvector")
                .WithImageTag("latest");
            _app = appBuilder.Build();
        }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        builder.ConfigureHostConfiguration(config =>
        {
            var resourceName = _useExternalDb ? DefaultResourceName : Postgres.Resource.Name;
            config.AddInMemoryCollection(new Dictionary<string, string>
            {
                { $"ConnectionStrings:{resourceName}", _postgresConnectionString },
            });
        });
        return base.CreateHost(builder);
    }

    public new async Task DisposeAsync()
    {
        await base.DisposeAsync();
        if (_app != null)
        {
            await _app.StopAsync();
            if (_app is IAsyncDisposable asyncDisposable)
            {
                await asyncDisposable.DisposeAsync().ConfigureAwait(false);
            }
            else
            {
                _app.Dispose();
            }
        }
    }

    public async ValueTask InitializeAsync()
    {
        if (_useExternalDb)
        {
            return;
        }

        await _app.StartAsync();
        _postgresConnectionString = await Postgres.Resource.GetConnectionStringAsync();
    }
}
