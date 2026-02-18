
import os
import sys

# Add the parent directory to sys.path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from dotenv import load_dotenv

@pytest.fixture(scope="session", autouse=True)
def load_env():
    """Load environment variables for all tests."""
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "key.env")
    load_dotenv(env_path)
