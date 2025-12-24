import os
import re

# Mapping of NEW directory to OLD directory relative to src
# This helps us find where the file USED TO BE.
NEW_TO_OLD = {
    'presentation/components': 'components',
    'presentation/pages': 'pages',
    'presentation/contexts': 'contexts',
    'presentation/hooks': 'hooks',
    'presentation/translations': 'translations',
    'application/services': 'services',
    'infrastructure/lib': 'lib',
    'infrastructure/data': 'data',
    'domain/entities': 'types',
    'infrastructure/external-services/email-templates': 'email-templates'
}

# Mapping of OLD top-level dir to NEW top-level dir relative to src
OLD_TO_NEW = {v: k for k, v in NEW_TO_OLD.items()}

SRC_DIR = os.path.abspath('src')

def get_old_abs_path(new_file_path):
    rel_to_src = os.path.relpath(new_file_path, SRC_DIR)
    parts = rel_to_src.split(os.sep)
    
    # Try to find a match in NEW_TO_OLD
    for new_dir, old_dir in NEW_TO_OLD.items():
        new_dir_parts = new_dir.split('/')
        if parts[:len(new_dir_parts)] == new_dir_parts:
            # We found the old location
            old_rel_to_src = os.path.join(old_dir, *parts[len(new_dir_parts):])
            return os.path.abspath(os.path.join(SRC_DIR, old_rel_to_src))
            
    return new_file_path # No change

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    new_file_abs = os.path.abspath(file_path)
    old_file_abs = get_old_abs_path(new_file_abs)
    old_file_dir = os.path.dirname(old_file_abs)
    new_file_dir = os.path.dirname(new_file_abs)
    
    def replace_match(match):
        prefix = match.group(1) # 'from ' or 'import(' etc
        quote = match.group(2)
        import_path = match.group(3)
        
        if not import_path.startswith('.'):
            return match.group(0)
            
        # 1. Find the absolute path of what was being imported
        # Assuming the import_path was correct relative to the OLD file location
        old_import_abs = os.path.abspath(os.path.join(old_file_dir, import_path))
        
        # 2. Find where that imported file is NOW
        if not old_import_abs.startswith(SRC_DIR):
            return match.group(0)
            
        rel_to_src = os.path.relpath(old_import_abs, SRC_DIR)
        parts = rel_to_src.split(os.sep)
        if not parts:
            return match.group(0)
            
        top_dir = parts[0]
        if top_dir in OLD_TO_NEW:
            new_top_dir = OLD_TO_NEW[top_dir]
            new_import_rel_to_src = os.path.join(new_top_dir, *parts[1:])
            new_import_abs = os.path.abspath(os.path.join(SRC_DIR, new_import_rel_to_src))
            
            # 3. Calculate new relative path from NEW file location
            new_rel_path = os.path.relpath(new_import_abs, new_file_dir)
            if not new_rel_path.startswith('.'):
                new_rel_path = './' + new_rel_path
            return f"{prefix}{quote}{new_rel_path}{quote}"
            
        return match.group(0)

    # Standard imports: from '...' or import '...'
    # Use a generic regex to match content between quotes in from/import/require
    new_content = re.sub(r"(from\s+|import\s*\(|require\s*\(|import\s+)(['\"])([^'\"]+)\2", replace_match, content)

    if new_content != content:
        print(f"Fixed {file_path}")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

def main():
    for root, dirs, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.css')):
                fix_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
