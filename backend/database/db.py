"""
Database configuration and session management.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import os
from typing import Generator

# Database URL configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./research_paper_generator.db"
)

# Create SQLAlchemy engine
if DATABASE_URL.startswith("sqlite"):
    # SQLite specific configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False  # Set to True for SQL debugging
    )
else:
    # PostgreSQL/MySQL configuration
    engine = create_engine(
        DATABASE_URL,
        echo=False,  # Set to True for SQL debugging
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get database session.
    
    Yields:
        Session: Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all database tables."""
    from .models import Base
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all database tables."""
    from .models import Base
    Base.metadata.drop_all(bind=engine)

def reset_database():
    """Reset the database by dropping and recreating all tables."""
    drop_tables()
    create_tables()

class DatabaseManager:
    """Database manager for handling database operations."""
    
    def __init__(self):
        self.engine = engine
        self.SessionLocal = SessionLocal
    
    def get_session(self) -> Session:
        """Get a new database session."""
        return self.SessionLocal()
    
    def close_session(self, session: Session):
        """Close a database session."""
        session.close()
    
    def create_tables(self):
        """Create all database tables."""
        from .models import Base
        Base.metadata.create_all(bind=self.engine)
    
    def drop_tables(self):
        """Drop all database tables."""
        from .models import Base
        Base.metadata.drop_all(bind=self.engine)
    
    def reset_database(self):
        """Reset the database by dropping and recreating all tables."""
        self.drop_tables()
        self.create_tables()
    
    def health_check(self) -> bool:
        """Check database health."""
        try:
            with self.get_session() as session:
                session.execute("SELECT 1")
                return True
        except Exception as e:
            print(f"Database health check failed: {e}")
            return False

# Database configuration for different environments
class DatabaseConfig:
    """Database configuration for different environments."""
    
    @staticmethod
    def get_development_config():
        """Get development database configuration."""
        return {
            "url": "sqlite:///./research_paper_generator_dev.db",
            "echo": True,
            "pool_size": 5,
            "max_overflow": 10
        }
    
    @staticmethod
    def get_testing_config():
        """Get testing database configuration."""
        return {
            "url": "sqlite:///:memory:",
            "echo": False,
            "pool_size": 1,
            "max_overflow": 0
        }
    
    @staticmethod
    def get_production_config():
        """Get production database configuration."""
        return {
            "url": os.getenv("DATABASE_URL"),
            "echo": False,
            "pool_size": 20,
            "max_overflow": 30,
            "pool_pre_ping": True,
            "pool_recycle": 3600
        }

# Database utilities
class DatabaseUtils:
    """Utility functions for database operations."""
    
    @staticmethod
    def get_table_count(session: Session, table_name: str) -> int:
        """Get the count of records in a table."""
        try:
            result = session.execute(f"SELECT COUNT(*) FROM {table_name}")
            return result.scalar()
        except Exception as e:
            print(f"Error getting table count: {e}")
            return 0
    
    @staticmethod
    def get_database_size() -> str:
        """Get the size of the database file (SQLite only)."""
        if DATABASE_URL.startswith("sqlite"):
            db_file = DATABASE_URL.replace("sqlite:///", "")
            if os.path.exists(db_file):
                size_bytes = os.path.getsize(db_file)
                size_mb = size_bytes / (1024 * 1024)
                return f"{size_mb:.2f} MB"
        return "Unknown"
    
    @staticmethod
    def backup_database(backup_path: str) -> bool:
        """Create a backup of the database."""
        try:
            if DATABASE_URL.startswith("sqlite"):
                db_file = DATABASE_URL.replace("sqlite:///", "")
                if os.path.exists(db_file):
                    import shutil
                    shutil.copy2(db_file, backup_path)
                    return True
            return False
        except Exception as e:
            print(f"Error creating backup: {e}")
            return False
    
    @staticmethod
    def restore_database(backup_path: str) -> bool:
        """Restore database from backup."""
        try:
            if DATABASE_URL.startswith("sqlite"):
                db_file = DATABASE_URL.replace("sqlite:///", "")
                if os.path.exists(backup_path):
                    import shutil
                    shutil.copy2(backup_path, db_file)
                    return True
            return False
        except Exception as e:
            print(f"Error restoring backup: {e}")
            return False

# Database migration utilities
class DatabaseMigration:
    """Database migration utilities."""
    
    @staticmethod
    def get_current_schema_version() -> str:
        """Get the current schema version."""
        # This would typically be stored in a migrations table
        return "1.0.0"
    
    @staticmethod
    def migrate_to_version(version: str) -> bool:
        """Migrate database to a specific version."""
        try:
            # Implement migration logic here
            print(f"Migrating to version {version}")
            return True
        except Exception as e:
            print(f"Migration failed: {e}")
            return False
    
    @staticmethod
    def create_migration_script(version: str, description: str) -> str:
        """Create a migration script."""
        script = f"""
-- Migration: {version}
-- Description: {description}
-- Created: {os.popen('date').read().strip()}

-- Add your migration SQL here

"""
        return script

# Initialize database
def initialize_database():
    """Initialize the database with tables and default data."""
    try:
        create_tables()
        print("Database initialized successfully")
        return True
    except Exception as e:
        print(f"Database initialization failed: {e}")
        return False

# Database connection pool monitoring
class ConnectionPoolMonitor:
    """Monitor database connection pool status."""
    
    @staticmethod
    def get_pool_status():
        """Get connection pool status."""
        if hasattr(engine.pool, 'size'):
            return {
                "pool_size": engine.pool.size(),
                "checked_in": engine.pool.checkedin(),
                "checked_out": engine.pool.checkedout(),
                "overflow": engine.pool.overflow(),
                "invalid": engine.pool.invalid()
            }
        return {"status": "Pool information not available"}

# Example usage
if __name__ == "__main__":
    # Initialize database
    initialize_database()
    
    # Test database connection
    db_manager = DatabaseManager()
    if db_manager.health_check():
        print("Database connection successful")
    else:
        print("Database connection failed")
    
    # Get database size
    print(f"Database size: {DatabaseUtils.get_database_size()}")
    
    # Get pool status
    print(f"Pool status: {ConnectionPoolMonitor.get_pool_status()}")
