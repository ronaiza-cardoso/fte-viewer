#!/usr/bin/env python3
"""
FTE Viewer Backend - Python Package Setup
A web scraping and data processing backend for FTE (Fichas Técnicas de Enquadramento) data.
"""

from setuptools import setup, find_packages
import os

# Read the README file
def read_readme():
    readme_path = os.path.join(os.path.dirname(__file__), "README.md")
    if os.path.exists(readme_path):
        with open(readme_path, "r", encoding="utf-8") as f:
            return f.read()
    return "FTE Viewer Backend - Web scraping and data processing for FTE data"

# Read requirements
def read_requirements():
    requirements_path = os.path.join(os.path.dirname(__file__), "requirements.txt")
    if os.path.exists(requirements_path):
        with open(requirements_path, "r", encoding="utf-8") as f:
            return [line.strip() for line in f if line.strip() and not line.startswith("#")]
    return []

setup(
    name="fte-viewer-backend",
    version="1.0.0",
    description="Backend for FTE Viewer - Web scraping and data processing for FTE data",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    author="FTE Viewer Team",
    author_email="",
    url="https://github.com/your-username/fte-viewer",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Internet :: WWW/HTTP :: Browsers",
        "Topic :: Scientific/Engineering :: Information Analysis",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Text Processing :: Markup :: HTML",
    ],
    python_requires=">=3.8",
    install_requires=read_requirements(),
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "black>=23.0.0",
            "flake8>=6.0.0",
            "mypy>=1.0.0",
        ],
        "docs": [
            "sphinx>=6.0.0",
            "sphinx-rtd-theme>=1.2.0",
            "myst-parser>=1.0.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "fte-scraper=fte_viewer_backend.scrapper:main",
        ],
    },
    include_package_data=True,
    package_data={
        "fte_viewer_backend": [
            "*.json",
            "*.md",
            "*.txt",
        ],
    },
    zip_safe=False,
    keywords=[
        "fte",
        "web-scraping",
        "data-processing",
        "environmental-regulation",
        "brazil",
        "ibama",
        "beautifulsoup",
        "requests",
    ],
    project_urls={
        "Bug Reports": "https://github.com/your-username/fte-viewer/issues",
        "Source": "https://github.com/your-username/fte-viewer",
        "Documentation": "https://github.com/your-username/fte-viewer#readme",
    },
)
