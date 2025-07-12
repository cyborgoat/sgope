from pathlib import Path
from typing import List, Optional

from sgope.memory._types import Memory, Suggestion


class KnowledgeFileHandler:
    """Knowledge files that can be used by the agent"""

    def __init__(self):
        self.memory: List[Memory] = []
        self.data_path = (
            Path(__file__).parent.parent.parent / "data" / "memory" / "knowledge_files"
        )
        self._load_from_directory()

    def _load_from_directory(self):
        """Load files from the knowledge_files directory"""
        try:
            if not self.data_path.exists():
                print(f"knowledge_files directory not found: {self.data_path}")
                return

            self._scan_directory(self.data_path)
            print(f"Loaded {len(self.memory)} items from knowledge_files")

        except Exception as e:
            print(f"Error loading knowledge_files: {e}")
            # No fallback, just leave memory empty

    def _scan_directory(self, path: Path, max_depth: int = 2, current_depth: int = 0):
        """Recursively scan directory for files"""
        if current_depth >= max_depth:
            return

        try:
            for item in path.iterdir():
                if item.name.startswith("."):
                    continue

                if item.is_file():
                    # Determine file type
                    file_type = (
                        "image"
                        if item.suffix.lower()
                        in [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg"]
                        else "file"
                    )

                    memory_item = Memory(
                        type=file_type,
                        name=item.name,
                        file_path=str(
                            item.relative_to(self.data_path.parent.parent.parent)
                        ),
                        size=item.stat().st_size if item.exists() else None,
                        metadata={
                            "extension": item.suffix,
                            "parent_dir": str(
                                item.parent.relative_to(
                                    self.data_path.parent.parent.parent
                                )
                            ),
                            "is_hidden": item.name.startswith("."),
                            "absolute_path": str(item),
                        },
                    )
                    self.memory.append(memory_item)

                elif item.is_dir():
                    memory_item = Memory(
                        type="folder",
                        name=item.name,
                        folder_path=str(
                            item.relative_to(self.data_path.parent.parent.parent)
                        ),
                        metadata={
                            "parent_dir": str(
                                item.parent.relative_to(
                                    self.data_path.parent.parent.parent
                                )
                            ),
                            "is_hidden": item.name.startswith("."),
                            "absolute_path": str(item),
                        },
                    )
                    self.memory.append(memory_item)
                    # Recursively scan subdirectories
                    self._scan_directory(item, max_depth, current_depth + 1)

        except PermissionError:
            pass  # Skip directories we can't access

    # _load_fallback_data removed: no fallback logic, memory stays empty if no files

    def add_knowledge_file(self, filename: str, content: str) -> str:
        """Add a new knowledge file to knowledge_files"""
        try:
            # Simple duplicate handling
            file_path = self.data_path / filename
            counter = 2

            while file_path.exists():
                name, ext = (
                    filename.rsplit(".", 1) if "." in filename else (filename, "txt")
                )
                filename = f"{name}_{counter}.{ext}"
                file_path = self.data_path / filename
                counter += 1

            # Ensure directory exists
            file_path.parent.mkdir(parents=True, exist_ok=True)

            # Write content to file
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)

            # Add to memory
            memory_item = Memory(
                type="file",
                name=filename,
                file_path=str(
                    file_path.relative_to(self.data_path.parent.parent.parent)
                ),
                size=len(content.encode("utf-8")),
                metadata={
                    "extension": file_path.suffix,
                    "parent_dir": str(
                        file_path.parent.relative_to(
                            self.data_path.parent.parent.parent
                        )
                    ),
                    "is_hidden": filename.startswith("."),
                    "absolute_path": str(file_path),
                },
            )
            self.memory.append(memory_item)

            print(f"Added knowledge file: {filename}")
            return filename

        except Exception as e:
            print(f"Error adding knowledge file {filename}: {e}")
            return ""

    def search(self, query: str) -> List[Suggestion]:
        """Search for files/folders matching the query"""
        query_lower = query.lower()
        suggestions = []

        for item in self.memory:
            if query_lower in item.name.lower():
                suggestion = Suggestion(
                    id=f"file_{len(suggestions)}",
                    label=item.name,
                    description=f"{item.type.title()}: {item.file_path or item.folder_path}",
                    type="file",
                    metadata={
                        "type": item.type,
                        "path": item.file_path or item.folder_path,
                        "size": item.size,
                    },
                )
                suggestions.append(suggestion)

        return suggestions[:10]  # Limit to 10 suggestions

    def add(self, item: Memory):
        self.memory.append(item)

    def get(self, index: int) -> Memory:
        return self.memory[index]

    def find_by_name(self, name: str) -> Optional[Memory]:
        """Find memory item by name"""
        for item in self.memory:
            if item.name == name:
                return item
        return None

    def read_file_content(self, file_path: str) -> Optional[str]:
        """Read content of a file from memory"""
        try:
            # Convert relative path to absolute path
            if file_path.startswith("./"):
                file_path = file_path[2:]

            full_path = Path(__file__).parent.parent.parent / file_path

            if not full_path.exists():
                return None

            # Check if it's a text file (avoid reading binary files)
            text_extensions = {
                ".txt",
                ".md",
                ".py",
                ".js",
                ".ts",
                ".json",
                ".yaml",
                ".yml",
                ".xml",
                ".html",
                ".css",
                ".sql",
                ".sh",
                ".bat",
                ".cfg",
                ".ini",
                ".log",
                ".csv",
                ".tsv",
                ".rst",
                ".tex",
            }

            if full_path.suffix.lower() not in text_extensions:
                return f"[Binary file: {full_path.name}]"

            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Limit content size to avoid overwhelming the context
            max_size = 10000  # 10KB limit
            if len(content) > max_size:
                content = content[:max_size] + "\n[... content truncated ...]"

            return content
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            return None

    def write_file_content(self, file_path: str, content: str) -> bool:
        """Write content to a file in memory"""
        try:
            # Convert relative path to absolute path
            if file_path.startswith("./"):
                file_path = file_path[2:]

            full_path = Path(__file__).parent.parent.parent / file_path

            if not full_path.exists():
                print(f"File not found for writing: {full_path}")
                return False

            # Ensure directory exists
            full_path.parent.mkdir(parents=True, exist_ok=True)

            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)

            # Update the memory item's size (optional, but good for consistency)
            for item in self.memory:
                if item.file_path == file_path:
                    item.size = len(content.encode("utf-8"))
                    break

            print(f"Successfully wrote content to {file_path}")
            return True
        except Exception as e:
            print(f"Error writing to file {file_path}: {e}")
            return False

    def clear(self):
        """Clear all memory items"""
        self.memory = []

    def refresh(self):
        """Refresh the directory scan"""
        self.clear()
        self._load_from_directory()

    def __str__(self):
        return str(self.memory)

    def __repr__(self):
        return f"[KnowledgeFileHandler]: ({len(self.memory)} items)"

    def __len__(self):
        return len(self.memory)

    def __getitem__(self, index: int):
        return self.memory[index]

    def __setitem__(self, index: int, value: Memory):
        self.memory[index] = value

    def __delitem__(self, index: int):
        del self.memory[index]

    def __iter__(self):
        return iter(self.memory)

    def __contains__(self, item: Memory):
        return item in self.memory
