#!/usr/bin/env python3
"""
QRON - Simple Deployment Script for Windows
Python version - Handles paths correctly
"""

import os
import subprocess
import sys
from pathlib import Path
import shutil

def print_header(text):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def print_success(text):
    """Print success message"""
    print(f"[OK] {text}")

def print_error(text):
    """Print error message"""
    print(f"[X] {text}")

def print_warning(text):
    """Print warning message"""
    print(f"[!] {text}")

def run_command(command, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            shell=True,
            capture_output=True,
            text=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_prerequisites():
    """Check if required tools are installed"""
    print_header("Checking Prerequisites")
    
    tools = {
        'Node.js': 'node --version',
        'npm': 'npm --version',
        'Git': 'git --version'
    }
    
    all_installed = True
    
    for tool, cmd in tools.items():
        success, output, _ = run_command(cmd)
        if success:
            version = output.strip().split('\n')[0]
            print_success(f"{tool} {version}")
        else:
            print_error(f"{tool} is NOT installed")
            all_installed = False
    
    return all_installed

def main():
    """Main deployment function"""
    os.system('cls' if os.name == 'nt' else 'clear')
    
    print_header("QRON Deployment - Python Edition")
    print("Reliable deployment for Windows\n")
    
    # Get the directory where we want to create the project
    # Use the directory where the script is located
    base_dir = Path.cwd()
    print(f"Working in: {base_dir}\n")
    
    # Check prerequisites
    if not check_prerequisites():
        print_error("\nMissing required tools. Install them first:")
        print("  - Node.js: https://nodejs.org/")
        print("  - Git: https://git-scm.com/download/win")
        input("\nPress Enter to exit...")
        sys.exit(1)
    
    # Get project name
    project_name = input("\nEnter project name [qron-app]: ").strip()
    if not project_name:
        project_name = "qron-app"
    
    project_dir = base_dir / project_name
    
    # Check if project exists
    if project_dir.exists():
        print_warning(f"\nDirectory '{project_name}' already exists!")
        response = input("Delete and recreate? (y/N): ").strip().lower()
        if response == 'y':
            print(f"Deleting {project_dir}...")
            shutil.rmtree(project_dir)
        else:
            print_error("Cancelled. Please choose a different name.")
            input("\nPress Enter to exit...")
            sys.exit(0)
    
    # Create Next.js project
    print_header("Creating Next.js Project")
    print(f"This will take 1-2 minutes...\n")
    
    cmd = f'npx create-next-app@latest {project_name} --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes'
    success, stdout, stderr = run_command(cmd, cwd=base_dir)
    
    if not success or not project_dir.exists():
        print_error("Failed to create Next.js project")
        if stderr:
            print(f"\nError: {stderr}")
        input("\nPress Enter to exit...")
        sys.exit(1)
    
    print_success(f"Project created: {project_dir}\n")
    
    # Install dependencies
    print_header("Installing Dependencies")
    print("Using --legacy-peer-deps to avoid version conflicts\n")
    
    deps = [
        "@fal-ai/serverless-client replicate",
        "@supabase/supabase-js @supabase/auth-helpers-nextjs",
        "thirdweb ethers",
        "qrcode axios date-fns uuid",
        "@radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-slider",
        "lucide-react framer-motion"
    ]
    
    for i, dep_group in enumerate(deps, 1):
        print(f"[{i}/{len(deps)}] Installing {dep_group.split()[0]}...")
        cmd = f"npm install {dep_group} --legacy-peer-deps"
        success, _, stderr = run_command(cmd, cwd=project_dir)
        if not success:
            print_warning(f"    Some warnings (this is normal with --legacy-peer-deps)")
    
    print_success("Dependencies installed\n")
    
    # Create environment files
    print_header("Creating Configuration Files")
    
    env_content = """# QRON Environment Variables

# Supabase (https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Fal.ai (https://fal.ai)
FAL_KEY=your_fal_api_key

# Thirdweb (https://thirdweb.com)  
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=QRON
"""
    
    try:
        (project_dir / ".env.local").write_text(env_content, encoding='utf-8')
        (project_dir / ".env.example").write_text(env_content, encoding='utf-8')
        print_success(".env.local created")
    except Exception as e:
        print_error(f"Could not create .env.local: {e}")
    
    # Create helper batch files
    scripts = {
        'dev.bat': '@echo off\necho Starting dev server...\nnpm run dev',
        'build.bat': '@echo off\necho Building project...\nnpm run build',
        'deploy.bat': '@echo off\necho Deploying to Vercel...\nnpx vercel --prod'
    }
    
    for filename, content in scripts.items():
        try:
            (project_dir / filename).write_text(content, encoding='utf-8')
        except Exception as e:
            print_warning(f"Could not create {filename}")
    
    print_success("Helper scripts created (dev.bat, build.bat, deploy.bat)")
    
    # Create README
    readme = f"""# {project_name.upper()}

QRON - Living Portal QR Codes

## Quick Start

1. **Configure API Keys**
   ```
   notepad .env.local
   ```
   Add your keys from:
   - Supabase: https://supabase.com
   - Fal.ai: https://fal.ai
   - Thirdweb: https://thirdweb.com

2. **Start Development**
   ```
   dev.bat
   ```
   Or: `npm run dev`

3. **Deploy**
   ```
   deploy.bat
   ```
   Or: `npx vercel --prod`

## Files

- `dev.bat` - Start dev server
- `build.bat` - Build for production
- `deploy.bat` - Deploy to Vercel
- `.env.local` - Your API keys (keep secret!)

## Troubleshooting

**Port in use:**
```
npm run dev -- -p 3001
```

**Clear and reinstall:**
```
rmdir /s node_modules
del package-lock.json
npm install --legacy-peer-deps
```

Happy coding! 🚀
"""
    
    try:
        (project_dir / "README.md").write_text(readme, encoding='utf-8')
        print_success("README.md created\n")
    except Exception as e:
        print_warning(f"Could not create README: {e}\n")
    
    # Git init
    print_header("Initializing Git")
    run_command("git init", cwd=project_dir)
    run_command("git add .", cwd=project_dir)
    run_command('git commit -m "Initial commit"', cwd=project_dir)
    print_success("Git repository initialized\n")
    
    # Final instructions
    print_header("🎉 Setup Complete!")
    
    print(f"""
Project: {project_name}
Location: {project_dir}

NEXT STEPS:

1. Configure your API keys:
   cd {project_name}
   notepad .env.local

2. Start development:
   cd {project_name}
   dev.bat

3. Deploy to production:
   cd {project_name}
   deploy.bat

Your app will run at: http://localhost:3000
""")
    
    # Offer to open editor
    response = input("Open .env.local in Notepad? (Y/n): ").strip().lower()
    if response != 'n':
        try:
            env_file = project_dir / ".env.local"
            os.startfile(str(env_file))
            print_success("Opened .env.local")
        except Exception as e:
            print_warning("Could not open file automatically")
            print(f"Manually open: {project_dir}\\.env.local")
    
    print()
    response = input("Start development server now? (Y/n): ").strip().lower()
    if response != 'n':
        print_header("Starting Development Server")
        print("Press Ctrl+C to stop\n")
        os.chdir(project_dir)
        subprocess.run("npm run dev", shell=True)
    else:
        print(f"\nTo start later, run:")
        print(f"  cd {project_name}")
        print(f"  dev.bat\n")
    
    input("Press Enter to exit...")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nCancelled by user")
        sys.exit(0)
    except Exception as e:
        print_error(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        input("\nPress Enter to exit...")
        sys.exit(1)
