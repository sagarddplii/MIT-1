"""
Utility functions and classes for the coordinator module.
"""

import logging
import json
from typing import Dict, Any, Optional
from pathlib import Path

class Logger:
    """Custom logger for the application."""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def info(self, message: str):
        """Log info message."""
        self.logger.info(message)
    
    def error(self, message: str):
        """Log error message."""
        self.logger.error(message)
    
    def warning(self, message: str):
        """Log warning message."""
        self.logger.warning(message)
    
    def debug(self, message: str):
        """Log debug message."""
        self.logger.debug(message)

class Config:
    """Configuration management."""
    
    def __init__(self):
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file or environment."""
        default_config = {
            'database': {
                'host': 'localhost',
                'port': 5432,
                'name': 'research_db',
                'user': 'research_user',
                'password': 'research_pass'
            },
            'api_keys': {
                'openai': '',
                'arxiv': '',
                'pubmed': ''
            },
            'agents': {
                'retrieval': {
                    'max_papers': 50,
                    'timeout': 30
                },
                'summarizer': {
                    'max_length': 2000,
                    'model': 'gpt-3.5-turbo'
                }
            },
            'server': {
                'host': '0.0.0.0',
                'port': 8000
            }
        }
        
        # Try to load from config file
        config_path = Path('config.json')
        if config_path.exists():
            try:
                with open(config_path, 'r') as f:
                    file_config = json.load(f)
                    default_config.update(file_config)
            except Exception as e:
                logging.warning(f"Failed to load config file: {e}")
        
        return default_config
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value."""
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key: str, value: Any):
        """Set configuration value."""
        keys = key.split('.')
        config = self.config
        
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        config[keys[-1]] = value

class DataValidator:
    """Data validation utilities."""
    
    @staticmethod
    def validate_topic(topic: str) -> bool:
        """Validate research topic."""
        if not topic or not isinstance(topic, str):
            return False
        return len(topic.strip()) > 3
    
    @staticmethod
    def validate_requirements(requirements: Dict[str, Any]) -> bool:
        """Validate research requirements."""
        if not isinstance(requirements, dict):
            return False
        
        # Check required fields
        required_fields = ['length', 'focus_areas']
        for field in required_fields:
            if field not in requirements:
                return False
        
        # Validate length
        valid_lengths = ['short', 'medium', 'long']
        if requirements['length'] not in valid_lengths:
            return False
        
        # Validate focus areas
        if not isinstance(requirements['focus_areas'], list):
            return False
        
        return True

def format_paper_data(paper_data: Dict[str, Any]) -> Dict[str, Any]:
    """Format paper data for consistent output."""
    return {
        'title': paper_data.get('title', ''),
        'authors': paper_data.get('authors', []),
        'abstract': paper_data.get('abstract', ''),
        'url': paper_data.get('url', ''),
        'published_date': paper_data.get('published_date', ''),
        'citations_count': paper_data.get('citations_count', 0),
        'relevance_score': paper_data.get('relevance_score', 0.0)
    }

def calculate_relevance_score(query: str, paper_data: Dict[str, Any]) -> float:
    """Calculate relevance score for a paper based on query."""
    # Simple keyword matching - in production, use more sophisticated NLP
    query_words = set(query.lower().split())
    
    title_words = set(paper_data.get('title', '').lower().split())
    abstract_words = set(paper_data.get('abstract', '').lower().split())
    
    title_matches = len(query_words.intersection(title_words))
    abstract_matches = len(query_words.intersection(abstract_words))
    
    # Weight title matches more heavily
    score = (title_matches * 2 + abstract_matches) / (len(query_words) * 3)
    return min(score, 1.0)  # Cap at 1.0
