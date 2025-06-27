# Task 2.0: Backend Project Setup and Core Configuration (.NET 8)

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

### 1. Scaffold Project and Install Packages

**Action:**
**From the project root:**

```powershell
cd backend && dotnet new webapi -f net8.0 --no-https --output .
```

### Create the NuGet.config file

**Put it at the same level as .csproj**

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <clear />
    <add key="LocalPackages" value="C:\Projects\NuGet" />
  </packageSources>
</configuration>
```

### Edit the backend.csproj file like this:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <NoWarn>$(NoWarn);1591</NoWarn>
  </PropertyGroup>

  <ItemGroup>
  <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.15" />
    <PackageReference Include="Microsoft.AspNetCore.SignalR" Version="1.2.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.5">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.0.5" />
    <PackageReference Include="Serilog.AspNetCore" Version="9.0.0" />
    <PackageReference Include="Serilog.Sinks.File" Version="7.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="8.1.2" />
  </ItemGroup>

</Project>
```

### 2. Create Project Structure

**Action:**
Create the required directories and empty C# class files for the project structure.

```powershell
# Always use the FULL ABSOLUTE PATH when you cd
# MAKE SURE YOU ARE IN 'backend' !!!
mkdir -Force 'Data','Data\Repositories','Data\Models','Services','Services\Dtos','Models','Hubs','Sinks','Controllers'

# Create empty placeholder files (no content)
# Always use the FULL ABSOLUTE PATH when you cd
# MAKE SURE YOU ARE IN 'backend' !!!
ni -ItemType File -Force -Path 'Data\ApplicationDbContext.cs','Data\DataSeeder.cs','Data\Repositories\ILlmModelRepository.cs','Data\Repositories\LlmModelRepository.cs','Data\Repositories\IComparisonRepository.cs','Data\Repositories\ComparisonRepository.cs','Services\ILlmModelService.cs','Services\LlmModelService.cs','Services\IComparisonService.cs','Services\ComparisonService.cs','Services\MappingProfile.cs','Services\IApiDocumentationService.cs','Services\ReflectionApiDocumentationService.cs','Services\ILogService.cs','Services\LogService.cs','Services\Dtos\LlmModelDto.cs','Services\Dtos\CreateLlmModelDto.cs','Services\Dtos\UpdateLlmModelDto.cs','Services\Dtos\ComparisonRecordDto.cs','Services\Dtos\CreateComparisonRecordDto.cs','Services\Dtos\UpdateComparisonRecordDto.cs','Models\LogEntry.cs','Models\ApiDocumentation.cs','Data\Models\LlmModel.cs','Data\Models\ComparisonRecord.cs','Hubs\LogHub.cs','Sinks\SignalRSink.cs','Controllers\LlmModelsController.cs','Controllers\ComparisonRecordsController.cs','Controllers\ApiManagementController.cs'; Start-Sleep 1

```

### . Restore packages from local

```powershell
# Always use the FULL ABSOLUTE PATH when you cd
# MAKE SURE YOU ARE IN 'backend' !!!
dotnet restore && dotnet build
```
