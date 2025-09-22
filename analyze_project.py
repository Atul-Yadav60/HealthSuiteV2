import os
import json

def analyze_project():
    """
    Simple script to analyze your project structure for chatbot integration
    Run this in your HealthSuiteV2 root directory
    """
    
    project_info = {}
    
    print("="*50)
    print("PROJECT STRUCTURE ANALYZER")
    print("="*50)
    
    # 1. Get directory structure
    print("\n1. DIRECTORY STRUCTURE:")
    print("-" * 30)
    
    def print_tree(directory, prefix="", max_depth=3, current_depth=0):
        if current_depth >= max_depth:
            return
            
        items = []
        try:
            items = sorted(os.listdir(directory))
        except PermissionError:
            return
            
        for i, item in enumerate(items):
            if item.startswith('.'):
                continue
                
            path = os.path.join(directory, item)
            is_last = i == len(items) - 1
            
            current_prefix = "└── " if is_last else "├── "
            print(f"{prefix}{current_prefix}{item}")
            
            if os.path.isdir(path):
                extension = "    " if is_last else "│   "
                print_tree(path, prefix + extension, max_depth, current_depth + 1)
    
    print_tree(".")
    
    # 2. Tech Stack Detection
    print(f"\n\n2. TECH STACK DETECTION:")
    print("-" * 30)
    
    tech_stack = []
    
    # Check for different project types
    files_to_check = {
        'package.json': 'Node.js/React/Vue',
        'pubspec.yaml': 'Flutter',
        'requirements.txt': 'Python',
        'Pipfile': 'Python (Pipenv)',
        'pom.xml': 'Java/Maven',
        'build.gradle': 'Android/Gradle',
        'composer.json': 'PHP',
        'Gemfile': 'Ruby',
        'index.html': 'Static HTML',
        'app.py': 'Python Flask',
        'manage.py': 'Django',
        'main.dart': 'Flutter',
        'App.js': 'React',
        'app.js': 'Node.js'
    }
    
    for file_name, tech in files_to_check.items():
        if os.path.exists(file_name):
            tech_stack.append(tech)
            print(f"✓ Found {file_name} - {tech}")
    
    if not tech_stack:
        print("❌ Could not detect tech stack automatically")
    
    # 3. Key Files Content
    print(f"\n\n3. KEY FILES CONTENT:")
    print("-" * 30)
    
    key_files = [
        'package.json', 'pubspec.yaml', 'requirements.txt', 
        'app.py', 'main.py', 'App.js', 'main.dart'
    ]
    
    for file_name in key_files:
        if os.path.exists(file_name):
            print(f"\n📄 {file_name}:")
            print("-" * 20)
            try:
                with open(file_name, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Limit content to avoid too much output
                    if len(content) > 1000:
                        print(content[:1000] + "\n... [truncated]")
                    else:
                        print(content)
            except Exception as e:
                print(f"Error reading {file_name}: {e}")
    
    # 4. Database Files Detection
    print(f"\n\n4. DATABASE FILES:")
    print("-" * 30)
    
    db_extensions = ['.db', '.sqlite', '.sqlite3', '.sql']
    db_files = []
    
    for root, dirs, files in os.walk('.'):
        for file in files:
            if any(file.endswith(ext) for ext in db_extensions):
                db_files.append(os.path.join(root, file))
                
    if db_files:
        for db_file in db_files:
            print(f"📊 Found database: {db_file}")
    else:
        print("❌ No database files found")
    
    # 5. Models/Schema Files
    print(f"\n\n5. MODELS/SCHEMA FILES:")
    print("-" * 30)
    
    model_patterns = ['model', 'schema', 'database', 'db', 'entity']
    model_files = []
    
    for root, dirs, files in os.walk('.'):
        for file in files:
            if any(pattern in file.lower() for pattern in model_patterns):
                if file.endswith(('.py', '.js', '.dart', '.java', '.php')):
                    model_files.append(os.path.join(root, file))
    
    if model_files:
        for model_file in model_files[:5]:  # Show first 5
            print(f"🗂️  {model_file}")
    else:
        print("❌ No model files found")
    
    # 6. Medicine/Health Related Files
    print(f"\n\n6. MEDICINE/HEALTH RELATED FILES:")
    print("-" * 30)
    
    health_patterns = ['medicine', 'health', 'medical', 'drug', 'pill', 'symptom', 'doctor']
    health_files = []
    
    for root, dirs, files in os.walk('.'):
        for file in files:
            if any(pattern in file.lower() for pattern in health_patterns):
                health_files.append(os.path.join(root, file))
    
    if health_files:
        for health_file in health_files[:10]:  # Show first 10
            print(f"💊 {health_file}")
    else:
        print("❌ No health-related files found")
    
    # 7. Summary Report
    print(f"\n\n7. CHATBOT INTEGRATION SUMMARY:")
    print("=" * 50)
    print(f"Tech Stack: {', '.join(tech_stack) if tech_stack else 'Unknown'}")
    print(f"Database Files: {len(db_files)} found")
    print(f"Model Files: {len(model_files)} found")
    print(f"Health Files: {len(health_files)} found")
    
    print(f"\n📋 NEXT STEPS FOR CHATBOT INTEGRATION:")
    print("-" * 30)
    
    if 'Flutter' in tech_stack:
        print("✓ Flutter project detected - Add chatbot screen to lib/screens/")
        print("✓ Create chat service in lib/services/")
        print("✓ Integrate with existing database models")
    elif any(js_tech in tech_stack for js_tech in ['Node.js', 'React', 'Vue']):
        print("✓ JavaScript project - Add chatbot component to components/")
        print("✓ Create API routes for chat handling")
        print("✓ Connect to existing database")
    elif 'Python' in tech_stack:
        print("✓ Python project - Add chatbot routes to main app")
        print("✓ Create chat service module")
        print("✓ Integrate with existing models")
    
    print("\n🚀 Ready for chatbot integration!")
    print("Share this output with Claude for specific integration steps.")

if __name__ == "__main__":
    analyze_project()