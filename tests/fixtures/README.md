# Test Fixtures

This directory contains test fixture files for comprehensive testing of file type support.

## Supported File Types

The mini-todo-list-mcp server supports reading content from the following file types:

### Text Files
- `.txt` - Plain text files
- `.text` - Alternative plain text extension
- `.md` - Markdown files
- `.markdown` - Alternative markdown extension

### Code Files
- `.js` - JavaScript files
- `.mjs` - ES6 module JavaScript files
- `.ts` - TypeScript files
- `.tsx` - TypeScript React files
- `.jsx` - JavaScript React files
- `.py` - Python files
- `.rb` - Ruby files
- `.go` - Go files
- `.rs` - Rust files
- `.php` - PHP files
- `.java` - Java files
- `.c` - C files
- `.cpp` - C++ files
- `.h` - Header files
- `.cs` - C# files
- `.swift` - Swift files
- `.kt` - Kotlin files
- `.scala` - Scala files

### Web Files
- `.html` - HTML files
- `.htm` - Alternative HTML extension
- `.css` - CSS stylesheets
- `.scss` - Sass stylesheets
- `.sass` - Sass stylesheets (indented syntax)
- `.less` - Less stylesheets
- `.xml` - XML files
- `.svg` - SVG files

### Configuration Files
- `.json` - JSON configuration files
- `.yaml` - YAML configuration files
- `.yml` - Alternative YAML extension
- `.toml` - TOML configuration files
- `.ini` - INI configuration files
- `.conf` - Configuration files
- `.config` - Configuration files
- `.env` - Environment files
- `.properties` - Properties files

### Documentation Files
- `.rst` - reStructuredText files
- `.tex` - LaTeX files
- `.asciidoc` - AsciiDoc files
- `.org` - Org-mode files

### Script Files
- `.sh` - Shell scripts
- `.bash` - Bash scripts
- `.zsh` - Zsh scripts
- `.fish` - Fish shell scripts
- `.ps1` - PowerShell scripts
- `.bat` - Batch files
- `.cmd` - Command files

### Data Files
- `.csv` - Comma-separated values
- `.tsv` - Tab-separated values
- `.sql` - SQL files
- `.log` - Log files

### Files Without Extensions
- Files without any extension are treated as plain text

## Rejected File Types

The following file types are rejected as they are binary formats:

### Executables
- `.exe`, `.app`, `.deb`, `.rpm`, `.msi`

### Images
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.ico`, `.tiff`, `.webp`

### Audio/Video
- `.mp3`, `.wav`, `.mp4`, `.avi`, `.mov`, `.mkv`, `.flv`

### Archives
- `.zip`, `.tar`, `.gz`, `.rar`, `.7z`

### Documents
- `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`

### Compiled Code
- `.class`, `.jar`, `.pyc`, `.dll`, `.so`, `.dylib`