import os
import json
from datetime import datetime
from pathlib import Path

class ProjectScanner:
    def __init__(self, root_path="."):
        self.root_path = Path(root_path).resolve()
        self.ignore_patterns = {
            # Common ignore patterns
            '__pycache__', '.git', '.svn', 'node_modules', '.env', 
            'venv', 'env', '.vscode', '.idea', 'dist', 'build',
            '.DS_Store', 'Thumbs.db', '*.pyc', '*.pyo', '*.pyd',
            '.pytest_cache', '.coverage', '*.log', '.mypy_cache'
        }
        
    def should_ignore(self, path):
        """Check if a file/directory should be ignored"""
        name = path.name
        
        # Check exact matches
        if name in self.ignore_patterns:
            return True
            
        # Check pattern matches (simple wildcards)
        for pattern in self.ignore_patterns:
            if pattern.startswith('*.') and name.endswith(pattern[1:]):
                return True
                
        # Ignore hidden files/folders (starting with .)
        if name.startswith('.') and name not in ['.env.example', '.gitignore', '.dockerignore']:
            return True
            
        return False
    
    def get_file_info(self, file_path):
        """Get file information"""
        try:
            stat = file_path.stat()
            return {
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "extension": file_path.suffix.lower()
            }
        except (OSError, PermissionError):
            return {
                "size": 0,
                "modified": None,
                "extension": file_path.suffix.lower(),
                "error": "Permission denied"
            }
    
    def scan_directory(self, dir_path, max_depth=10, current_depth=0):
        """Recursively scan directory structure"""
        if current_depth > max_depth:
            return {"error": "Max depth exceeded"}
            
        structure = {
            "type": "directory",
            "name": dir_path.name,
            "path": str(dir_path.relative_to(self.root_path)),
            "children": []
        }
        
        try:
            items = sorted(dir_path.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
            
            for item in items:
                if self.should_ignore(item):
                    continue
                    
                if item.is_file():
                    file_info = self.get_file_info(item)
                    structure["children"].append({
                        "type": "file",
                        "name": item.name,
                        "path": str(item.relative_to(self.root_path)),
                        **file_info
                    })
                elif item.is_dir():
                    subdir = self.scan_directory(item, max_depth, current_depth + 1)
                    structure["children"].append(subdir)
                    
        except PermissionError:
            structure["error"] = "Permission denied"
            
        return structure
    
    def get_project_summary(self, structure):
        """Generate project summary statistics"""
        stats = {
            "total_files": 0,
            "total_directories": 0,
            "file_types": {},
            "total_size": 0
        }
        
        def count_items(node):
            if node.get("type") == "file":
                stats["total_files"] += 1
                stats["total_size"] += node.get("size", 0)
                
                ext = node.get("extension", "no extension")
                if ext == "":
                    ext = "no extension"
                stats["file_types"][ext] = stats["file_types"].get(ext, 0) + 1
                
            elif node.get("type") == "directory":
                stats["total_directories"] += 1
                for child in node.get("children", []):
                    count_items(child)
        
        count_items(structure)
        return stats
    
    def scan_project(self, output_file="project_structure.json", include_summary=True):
        """Main method to scan project and save to JSON"""
        print(f"Scanning project at: {self.root_path}")
        
        # Get project structure
        structure = self.scan_directory(self.root_path)
        
        # Create output data
        output_data = {
            "project_name": self.root_path.name,
            "scan_timestamp": datetime.now().isoformat(),
            "root_path": str(self.root_path),
            "structure": structure
        }
        
        # Add summary if requested
        if include_summary:
            output_data["summary"] = self.get_project_summary(structure)
        
        # Save to JSON file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"Project structure saved to: {output_file}")
        
        # Print summary
        if include_summary:
            summary = output_data["summary"]
            print(f"\nProject Summary:")
            print(f"├── Files: {summary['total_files']}")
            print(f"├── Directories: {summary['total_directories']}")
            print(f"├── Total Size: {self.format_size(summary['total_size'])}")
            print(f"└── File Types:")
            for ext, count in sorted(summary['file_types'].items(), key=lambda x: x[1], reverse=True)[:10]:
                print(f"    ├── {ext}: {count}")
        
        return output_data
    
    def format_size(self, size_bytes):
        """Format file size in human readable format"""
        if size_bytes == 0:
            return "0 B"
        
        size_names = ["B", "KB", "MB", "GB", "TB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        return f"{size_bytes:.1f} {size_names[i]}"

# Usage functions
def scan_current_directory():
    """Scan current directory"""
    scanner = ProjectScanner(".")
    return scanner.scan_project()

def scan_custom_directory(path):
    """Scan custom directory"""
    scanner = ProjectScanner(path)
    return scanner.scan_project(f"{Path(path).name}_structure.json")

def customize_ignore_patterns(additional_patterns=None):
    """Create scanner with custom ignore patterns"""
    scanner = ProjectScanner(".")
    if additional_patterns:
        scanner.ignore_patterns.update(additional_patterns)
    return scanner.scan_project()

if __name__ == "__main__":
    import sys
    
    # Command line usage
    if len(sys.argv) > 1:
        project_path = sys.argv[1]
        print(f"Scanning project at: {project_path}")
        scan_custom_directory(project_path)
    else:
        print("Scanning current directory...")
        scan_current_directory()
    
    print("\nDone! You can now share the generated JSON file to discuss your project structure.")