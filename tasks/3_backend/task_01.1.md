# (Do not use terminal to populate files) Write the code for Backend Core Configuration and Startup Files

### Rules

1.) **CONCISENESS CLAUSE** When replying use as few words as needed to explain, plan or analyze. Long winded replies waste time and tokens. No long explanations. Stick to the main points an keep it breif. Do not perform extra work or validation.

2.) **WORKSPACE DIRECTIVE** Before you write any code or run any terminal commands, Verify you are in the workspace. Do not create files or folders outside of the workspace. No other files are permitted to be created other than what is in the task files. Create files only where specified: frontend, backend, electron, (or root if main package.json).

3.) **COMMAND FORMATTING** Always use && to chain commands in terminal! Use tools properly when needed, especially: **read file, write to file, execute command, read multiple files, list files, new task and complete task.**

4.) **READ THE TASK FILE AND THEN SUMMARIZE** Summarize and list the steps in the task file in chat after you read it (**HIGH LEVEL SUMMARY ONLY - NO CODE, NO COMMANDS**). Then follow the steps **VERBATIM** in the **EXACT** order they appear in the task file. Read rules **VERBATIM**, and follow them explicitly. For efficiency, do not explain code or make overly verbose comments. Only spend a maximum of 10 seconds thinking.

5.) **IMPORTANT** do not stop to resolve build errors, missing files or missing imports.

6.) **FULL PATHS ONLY** Always confirm you are in the correct working directory first! When running terminal commands always use full paths for folders (e.g. cd C:/Projects/foo) to avoid errors.

7.) **READ FIRST DIRECTIVE** Read folders and files first before you write! File content is changed by the linter after you save. So before writing to a file you must read it first to get its latest content!

8.) Complete all work in the task file. Do not create or modify anything outside of these files.

9.) **TOOL USAGE CLAUSE** Always use the appropriate tools provided by the system for file operations. Specifically:

Use read_file to read files instead of command line utilities like type
Use write_to_file or insert_content to modify files
Use execute_command for running terminal commands Failing to use these tools properly may result in incomplete or incorrect task execution.

10.) **FINAL CHECKLIST** Always verify location before executing terminal commands. Use Full Paths: Always use full paths for directories when executing terminal commands. Resolve Terminal errors and syntax errors, ignore missing imports and do not create "placeholder" files unless instructed to do so. Do not create files or folders outside the workspace. **Only create files specified.** Only fix syntax errors and do not run the build to verify until the final task and all components have been fully populated.

### 1. (Do not use terminal to populate files) Write the code for `appsettings.json`

**`appsettings.json`:**

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### 2. (Do not use terminal to populate files) Write the code for `appsettings.Development.json`

**`appsettings.Development.json`:**

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  },
  "DetailedErrors": true
}
```

### 3. (Do not use terminal to populate files) Write the code for `Program.cs`

**`Program.cs`:**

```csharp
using backend.Configuration;
using backend.Data;
using backend.Middleware;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure logging
builder.ConfigureLogging();

// 2. Add controllers and API explorer
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 3. Configure Swagger documentation
builder.Services.ConfigureSwagger();

// 4. Configure port 5001
builder.WebHost.UseUrls("http://localhost:5001");

// 5. Configure database
builder.Services.ConfigureDatabase(builder.Environment);

// 6. Register application services and repositories
builder.Services.RegisterApplicationServices();

// Register API Insights services (including SignalR)
builder.Services.RegisterApiInsightsServices();

// CORS services are configured via the app.ConfigureCors() extension method below
// No specific service registration needed here for this setup.

var app = builder.Build();

// 7. Seed database with initial data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    DataSeeder.SeedData(services);
}

// 8. Configure HTTP pipeline middleware
// Configure Swagger documentation
app.UseSwaggerDocumentation();

// Configure request logging
app.UseRequestLogging();

// Configure CORS
app.ConfigureCors(); // Use the extension method from CorsConfiguration.cs

// Configure global exception handling
app.UseGlobalExceptionHandling();

// Configure API Insights
app.UseApiInsights();

// Configure real-time logging with SignalR
app.ConfigureRealtimeLogging();

// Map controllers to routes
app.MapControllers();

// 9. Start the application
app.Run();
```
